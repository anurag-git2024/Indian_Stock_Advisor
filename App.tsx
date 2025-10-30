import React, { useState, useCallback, useEffect } from 'react';
import { StockAnalysis, TopPicks } from './types';
import { fetchStockAnalysis, fetchTodaysPicks } from './services/geminiService';
import StockInputForm from './components/StockInputForm';
import AnalysisResult from './components/AnalysisResult';
import Loader from './components/Loader';
import FavoritesList from './components/FavoritesList';
import PredefinedStocks from './components/PredefinedStocks';
import TodayRecommendation from './components/TodayRecommendation';

const predefinedStocks = [
  'ADANIENSOL', 'ADANIGREEN', 'ADANIPOWER', 'AFCONS', 'AKI', 'BAJAJHFL', 
  'BANDHANBNK', 'BEL', 'BSE', 'COALINDIA', 'EXIDEIND', 'FMCGIETF', 'GAIL', 
  'HAWKINSCOOK', 'HDBFS', 'HDFCBANK', 'HYUNDAI', 'ICICIBANK', 'INDUSINDBK', 
  'INOXWIND', 'IOC', 'IRFC', 'ITC', 'ITCHOTELS', 'JIOFIN', 'JSWINFRA', 
  'LICI', 'MOBIKWIK', 'NMDC', 'OIL', 'PAYTM', 'RECLTD', 'RELIANCE', 
  'SBIN', 'STL', 'STYLEBAAZA', 'SUZLON', 'TATACAP', 'TATATECH', 'TCS', 
  'TMPV', 'VMM', 'YESBANK'
];


const App: React.FC = () => {
  const [stockSymbol, setStockSymbol] = useState<string>('');
  const [analysis, setAnalysis] = useState<StockAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  // New state for today's picks
  const [topPicks, setTopPicks] = useState<TopPicks | null>(null);
  const [topPicksLoading, setTopPicksLoading] = useState<boolean>(false);
  const [topPicksError, setTopPicksError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem('stockFavorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (err) {
      console.error("Failed to parse favorites from localStorage", err);
      setFavorites([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('stockFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleAnalysisRequest = useCallback(async (symbol: string, timeframes: string[]) => {
    if (!symbol) {
      setError('Please enter a stock symbol.');
      return;
    }
    setLoading(true);
    setError(null);
    setAnalysis(null);
    setStockSymbol(symbol.toUpperCase());

    try {
      const result = await fetchStockAnalysis(symbol, timeframes);
      setAnalysis(result);
    } catch (err) {
// FIX: Added curly braces to the catch block to fix a syntax error.
      setError('Failed to fetch stock analysis. The stock symbol might be invalid or there was an API error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // New handler for fetching top picks
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

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-2">
            Indian Stock Advisor AI
          </h1>
          <p className="text-gray-400">
            Get AI-powered analysis for Indian stocks using real-time data from NSE and BSE.
          </p>
        </header>

        <main className="w-full">
          <StockInputForm onSubmit={handleAnalysisRequest} loading={loading} />
          
          <TodayRecommendation 
            onFetchPicks={handleFetchTopPicks}
            picks={topPicks}
            loading={topPicksLoading}
            error={topPicksError}
            onAnalyze={handleSelectFavorite}
            isAppLoading={loading}
          />

          <PredefinedStocks stocks={predefinedStocks} onSelect={handlePredefinedSelect} loading={loading} />

          {favorites.length > 0 && (
            <FavoritesList 
              favorites={favorites}
              onSelect={handleSelectFavorite}
              onRemove={handleRemoveFavorite}
              loading={loading}
            />
          )}

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
            />
          )}
        </main>
        
        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>Disclaimer: The analysis provided is generated by an AI model and is for informational purposes only. It does not constitute financial advice. Always conduct your own research before making any investment decisions.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;