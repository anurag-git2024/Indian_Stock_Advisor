import React from 'react';
import { TopPicks, TodaysPick } from '../types';
import { LightBulbIcon, TrendUpIcon, TrendDownIcon, PlusCircleIcon } from './icons';

interface TodayRecommendationProps {
  onFetchPicks: () => void;
  picks: TopPicks | null;
  loading: boolean;
  error: string | null;
  onAnalyze: (symbol: string) => void;
  isAppLoading: boolean; // To disable button if another analysis is running
  onAddToComparison: (symbol: string) => void;
  comparisonList: string[];
}

const PickCard: React.FC<{ 
    pick: TodaysPick; 
    type: 'Buy' | 'Sell'; 
    onAnalyze: (symbol: string) => void; 
    onAddToComparison: (symbol: string) => void; 
    isInComparison: boolean; 
    isComparisonFull: boolean; 
}> = ({ pick, type, onAnalyze, onAddToComparison, isInComparison, isComparisonFull }) => {
    const isBuy = type === 'Buy';
    const styles = {
        card: isBuy ? 'border-green-500/50 bg-green-900/20' : 'border-red-500/50 bg-red-900/20',
        title: isBuy ? 'text-green-400' : 'text-red-400',
        icon: isBuy ? <TrendUpIcon className="h-8 w-8 text-green-400" /> : <TrendDownIcon className="h-8 w-8 text-red-400" />,
        button: isBuy ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'
    };

    return (
        <div className={`rounded-xl border p-6 flex flex-col ${styles.card}`}>
            <div className="flex justify-between items-start mb-4">
                <h3 className={`text-xl font-bold ${styles.title}`}>Top {type} Today</h3>
                {styles.icon}
            </div>
            <div className="mb-4">
                <p className="text-2xl font-bold text-white">{pick.symbol}</p>
                <p className="text-sm text-gray-400">{pick.stock_name}</p>
            </div>
            <p className="text-gray-400 text-sm flex-grow mb-6">
                <strong>Rationale:</strong> {pick.rationale}
            </p>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onAnalyze(pick.symbol)}
                    className={`w-full text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 ${styles.button}`}
                >
                    Analyze Full Report
                </button>
                <button
                    onClick={() => onAddToComparison(pick.symbol)}
                    disabled={isInComparison || isComparisonFull}
                    className="flex-shrink-0 bg-blue-600 hover:bg-blue-500 text-white font-bold p-2 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed"
                    title={isInComparison ? 'In comparison' : isComparisonFull ? 'Comparison full' : `Add ${pick.symbol} to compare`}
                >
                    <PlusCircleIcon className="h-6 w-6" />
                </button>
            </div>
        </div>
    );
};


const TodayRecommendation: React.FC<TodayRecommendationProps> = ({ onFetchPicks, picks, loading, error, onAnalyze, isAppLoading, onAddToComparison, comparisonList }) => {
  return (
    <section className="mb-8 max-w-3xl mx-auto text-center">
      <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl">
        <h2 className="text-2xl font-semibold text-gray-200 mb-4 flex items-center justify-center gap-3">
          <LightBulbIcon className="h-7 w-7 text-yellow-400" />
          Today's Top AI Picks
        </h2>
        <p className="text-gray-400 mb-6">
          Let our AI analyze today's market conditions across quick picks to find the top buy and sell opportunities.
        </p>

        {!picks && !loading && (
          <button
            onClick={onFetchPicks}
            disabled={loading || isAppLoading}
            className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
          >
            Find Top Buy/Sell Now
          </button>
        )}

        {loading && (
            <div className="flex items-center justify-center space-x-2 mt-4 text-gray-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>Scanning the market for opportunities...</span>
            </div>
        )}

        {error && (
            <div className="mt-4 text-center bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">
                <span className="block sm:inline">{error}</span>
            </div>
        )}
        
        {picks && !loading && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-left animate-fade-in">
                <PickCard 
                    pick={picks.buy} 
                    type="Buy" 
                    onAnalyze={onAnalyze} 
                    onAddToComparison={onAddToComparison} 
                    isInComparison={comparisonList.includes(picks.buy.symbol)}
                    isComparisonFull={comparisonList.length >= 3}
                />
                <PickCard 
                    pick={picks.sell} 
                    type="Sell" 
                    onAnalyze={onAnalyze}
                    onAddToComparison={onAddToComparison}
                    isInComparison={comparisonList.includes(picks.sell.symbol)}
                    isComparisonFull={comparisonList.length >= 3}
                />
            </div>
        )}
      </div>
    </section>
  );
};

export default TodayRecommendation;