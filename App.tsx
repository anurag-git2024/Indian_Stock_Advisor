import React, { useState, useCallback, useEffect } from 'react';
import { StockAnalysis, TopPicks, PriceAlert } from './types';
import { fetchStockAnalysis, fetchTodaysPicks } from './services/geminiService';
import StockInputForm from './components/StockInputForm';
import AnalysisResult from './components/AnalysisResult';
import Loader from './components/Loader';
import FavoritesList from './components/FavoritesList';
import PredefinedStocks from './components/PredefinedStocks';
import TodayRecommendation from './components/TodayRecommendation';
import AlertsList from './components/AlertsList';
import TriggeredAlertDialog from './components/TriggeredAlertDialog';
import ComparisonTray from './components/ComparisonTray';
import ComparisonView from './components/ComparisonView';

const predefinedStocks = [
  'ADANIENSOL', 'ADANIGREEN', 'ADANIPOWER', 'AFCONS', 'AKI', 'BAJAJHFL', 
  'BANDHANBNK', 'BEL', 'BSE', 'COALINDIA', 'EXIDEIND', 'FMCGIETF', 'GAIL', 
  'HAWKINSCOOK', 'HDBFS', 'HDFCBANK', 'HYUNDAI', 'ICICIBANK', 'INDUSINDBK', 
  'INOXWIND', 'IOC', 'IRFC', 'ITC', 'ITCHOTELS', 'JIOFIN', 'JSWINFRA', 
  'LICI', 'MOBIKWIK', 'NMDC', 'OIL', 'PAYTM', 'RECLTD', 'RELIANCE', 
  'SBIN', 'STL', 'STYLEBAAZA', 'SUZLON', 'TATACAP', 'TATATECH', 'TCS', 
  'TMPV', 'VMM', 'YESBANK'
];

interface TriggeredAlertInfo {
  alert: PriceAlert;
  triggeringPrice: string;
}

const App: React.FC = () => {
  const [stockSymbol, setStockSymbol] = useState<string>('');
  const [analysis, setAnalysis] = useState<StockAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const [topPicks, setTopPicks] = useState<TopPicks | null>(null);
  const [topPicksLoading, setTopPicksLoading] = useState<boolean>(false);
  const [topPicksError, setTopPicksError] = useState<string | null>(null);

  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [triggeredAlertQueue, setTriggeredAlertQueue] = useState<TriggeredAlertInfo[]>([]);
  
  // State for comparison feature
  const [comparisonList, setComparisonList] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<StockAnalysis[]>([]);
  const [comparisonLoading, setComparisonLoading] = useState<boolean>(false);
  const [comparisonError, setComparisonError] = useState<string | null>(null);
  const [showComparisonView, setShowComparisonView] = useState<boolean>(false);

  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem('stockFavorites');
      if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
      
      const storedAlerts = localStorage.getItem('stockAlerts');
      if (storedAlerts) setAlerts(JSON.parse(storedAlerts));

      const storedComparisonList = localStorage.getItem('stockComparisonList');
      if (storedComparisonList) setComparisonList(JSON.parse(storedComparisonList));
    } catch (err) {
      console.error("Failed to parse from localStorage", err);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('stockFavorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('stockAlerts', JSON.stringify(alerts));
  }, [alerts]);
  
  useEffect(() => {
    localStorage.setItem('stockComparisonList', JSON.stringify(comparisonList));
  }, [comparisonList]);

  const handleAddAlert = useCallback((newAlertData: Omit<PriceAlert, 'id' | 'status'>) => {
    const newAlert: PriceAlert = {
      ...newAlertData,
      id: `${newAlertData.symbol}-${Date.now()}`,
      status: 'active',
    };
    setAlerts(prev => [...prev, newAlert]);
  }, []);

  const handleRemoveAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const handleDismissTriggeredAlert = useCallback((id: string) => {
    setTriggeredAlertQueue(prev => prev.filter(info => info.alert.id !== id));
  }, []);

  const handleAnalysisRequest = useCallback(async (symbol: string, timeframes: string[]) => {
    if (!symbol) {
      setError('Please enter a stock symbol.');
      return;
    }
    // Exit comparison view when a single analysis is requested
    setShowComparisonView(false);
    setComparisonData([]);
    
    setLoading(true);
    setError(null);
    setAnalysis(null);
    const upperSymbol = symbol.toUpperCase();
    setStockSymbol(upperSymbol);

    try {
      const result = await fetchStockAnalysis(symbol, timeframes);
      setAnalysis({ ...result, symbol: upperSymbol });

      const currentPriceStr = result.current_price.replace(/[₹,]/g, '');
      const currentPrice = parseFloat(currentPriceStr);

      if (!isNaN(currentPrice)) {
          const newlyTriggered: PriceAlert[] = [];
          const updatedAlerts = alerts.map(alert => {
              if (alert.symbol === upperSymbol && alert.status === 'active') {
                  const isTriggered = 
                      (alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
                      (alert.condition === 'below' && currentPrice <= alert.targetPrice);

                  if (isTriggered) {
                      const triggeredAlert = { ...alert, status: 'triggered' as const };
                      newlyTriggered.push(triggeredAlert);
                      return triggeredAlert;
                  }
              }
              return alert;
          });

          if (newlyTriggered.length > 0) {
              const newQueueItems = newlyTriggered.map(alert => ({
                  alert,
                  triggeringPrice: result.current_price,
              }));
              setAlerts(updatedAlerts);
              setTriggeredAlertQueue(prev => [...prev, ...newQueueItems]);
          }
      }

    } catch (err) {
      setError('Failed to fetch stock analysis. The stock symbol might be invalid or there was an API error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [alerts]);
  
  const handleFetchTopPicks = useCallback(async () => {
    setTopPicksLoading(true);
    setTopPicksError(null);
    setTopPicks(null);
    try {
      const result = await fetchTodaysPicks(predefinedStocks);
      setTopPicks(result);
    } catch (err) {
      setTopPicksError("Failed to fetch today's top picks. Please try again later.");
    } finally {
      setTopPicksLoading(false);
    }
  }, []);

  const handleToggleFavorite = useCallback((symbol: string) => {
    setFavorites(prev => 
      prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol].sort()
    );
  }, []);

  const handleRemoveFavorite = useCallback((symbol: string) => {
    setFavorites(prev => prev.filter(s => s !== symbol));
  }, []);

  const handleSelectFavorite = useCallback((symbol: string) => {
    handleAnalysisRequest(symbol, ['All']);
  }, [handleAnalysisRequest]);

  const handlePredefinedSelect = useCallback((symbol: string) => {
    handleAnalysisRequest(symbol, ['All']);
  }, [handleAnalysisRequest]);
  
  // Comparison Handlers
  const handleAddToComparison = useCallback((symbol: string) => {
    setComparisonList(prev => {
      if (prev.includes(symbol) || prev.length >= 3) {
        return prev;
      }
      return [...prev, symbol];
    });
  }, []);

  const handleRemoveFromComparison = useCallback((symbol: string) => {
    setComparisonList(prev => prev.filter(s => s !== symbol));
  }, []);

  const handleClearComparison = useCallback(() => {
    setComparisonList([]);
  }, []);

  const handleInitiateComparison = useCallback(async () => {
    if (comparisonList.length < 2) return;
    setComparisonLoading(true);
    setComparisonError(null);
    setAnalysis(null);
    setError(null);
    setShowComparisonView(true);
    setComparisonData([]);

    try {
      const results = await Promise.all(
        comparisonList.map(async (symbol) => {
          const analysis = await fetchStockAnalysis(symbol, ['All']);
          return { ...analysis, symbol };
        })
      );
      setComparisonData(results);
    } catch (err) {
      setComparisonError('Failed to fetch comparison data for one or more stocks. Please try again.');
      setShowComparisonView(false);
    } finally {
      setComparisonLoading(false);
    }
  }, [comparisonList]);

  const handleExitComparisonView = useCallback(() => {
    setShowComparisonView(false);
    setComparisonData([]);
    setComparisonError(null);
  }, []);


  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      {triggeredAlertQueue.length > 0 && (
          <TriggeredAlertDialog 
              alert={triggeredAlertQueue[0].alert}
              currentPrice={triggeredAlertQueue[0].triggeringPrice}
              onDismiss={handleDismissTriggeredAlert}
          />
      )}

      <div className="w-full max-w-5xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-2">
            Indian Stock Advisor AI
          </h1>
          <p className="text-gray-400">
            Get AI-powered analysis for Indian stocks using real-time data from NSE and BSE.
          </p>
        </header>
        
        {showComparisonView ? (
          <>
            {comparisonLoading && <Loader />}
            {comparisonError && (
              <div className="mt-8 text-center bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{comparisonError}</span>
              </div>
            )}
            {comparisonData.length > 0 && !comparisonLoading && (
              <ComparisonView analyses={comparisonData} onBack={handleExitComparisonView} />
            )}
          </>
        ) : (
          <main className="w-full">
            <StockInputForm onSubmit={handleAnalysisRequest} loading={loading} />
            
            <TodayRecommendation 
              onFetchPicks={handleFetchTopPicks}
              picks={topPicks}
              loading={topPicksLoading}
              error={topPicksError}
              onAnalyze={handleSelectFavorite}
              isAppLoading={loading}
              onAddToComparison={handleAddToComparison}
              comparisonList={comparisonList}
            />

            <PredefinedStocks 
              stocks={predefinedStocks} 
              onSelect={handlePredefinedSelect} 
              loading={loading}
              onAddToComparison={handleAddToComparison}
              comparisonList={comparisonList}
            />

            {favorites.length > 0 && (
              <FavoritesList 
                favorites={favorites}
                onSelect={handleSelectFavorite}
                onRemove={handleRemoveFavorite}
                loading={loading}
                onAddToComparison={handleAddToComparison}
                comparisonList={comparisonList}
              />
            )}

            <AlertsList
              alerts={alerts}
              onRemove={handleRemoveAlert}
              loading={loading}
            />

            {loading && <Loader />}
            
            {error && (
              <div className="mt-8 text-center bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {analysis && (
              <AnalysisResult 
                data={analysis} 
                stockSymbol={stockSymbol}
                isFavorite={favorites.includes(stockSymbol)}
                onToggleFavorite={handleToggleFavorite}
                onSetAlert={handleAddAlert}
                onAddToComparison={handleAddToComparison}
                isInComparison={comparisonList.includes(stockSymbol)}
              />
            )}
          </main>
        )}
        
        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>Disclaimer: The analysis provided is generated by an AI model and is for informational purposes only. It does not constitute financial advice. Always conduct your own research before making any investment decisions.</p>
        </footer>
      </div>

       <ComparisonTray 
        comparisonList={comparisonList}
        onRemove={handleRemoveFromComparison}
        onClear={handleClearComparison}
        onCompare={handleInitiateComparison}
        loading={comparisonLoading}
        appLoading={loading}
      />
    </div>
  );
};

export default App;