import React from 'react';
import { StockAnalysis, PriceAlert } from '../types';
import RecommendationCard from './RecommendationCard';
import NewsSection from './NewsSection';
import PriceChart from './PriceChart';
import { StarIcon, StarOutlineIcon } from './icons';
import PriceAlertForm from './PriceAlertForm';

interface AnalysisResultProps {
  data: StockAnalysis;
  stockSymbol: string;
  isFavorite: boolean;
  onToggleFavorite: (symbol: string) => void;
  onSetAlert: (alert: Omit<PriceAlert, 'id' | 'status'>) => void;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ data, stockSymbol, isFavorite, onToggleFavorite, onSetAlert }) => {
  const currentPriceNumber = parseFloat(data.current_price.replace(/[₹,]/g, ''));
  
  const low = data.fifty_two_week_low ? parseFloat(data.fifty_two_week_low.replace(/[₹,]/g, '')) : NaN;
  const high = data.fifty_two_week_high ? parseFloat(data.fifty_two_week_high.replace(/[₹,]/g, '')) : NaN;
  
  let rangePosition: number | null = null;
  if (!isNaN(low) && !isNaN(high) && !isNaN(currentPriceNumber) && high > low) {
      const range = high - low;
      const position = ((currentPriceNumber - low) / range) * 100;
      rangePosition = Math.max(0, Math.min(100, position));
  }

  return (
    <div className="mt-10 animate-fade-in">
      <div className="text-center mb-8 bg-gray-800/30 border border-gray-700 rounded-xl p-6">
        <div className="flex justify-center items-center gap-4">
            <h2 className="text-3xl font-bold">
                Analysis for <span className="text-green-400">{data.stock_name}</span>
            </h2>
            <button
                onClick={() => onToggleFavorite(stockSymbol)}
                className="text-yellow-400 hover:text-yellow-300 transition-transform duration-200 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded-full"
                aria-label={isFavorite ? `Remove ${stockSymbol} from favorites` : `Add ${stockSymbol} to favorites`}
                title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            >
                {isFavorite ? <StarIcon className="h-8 w-8" /> : <StarOutlineIcon className="h-8 w-8" />}
            </button>
        </div>
        <div className="mt-4">
            <p className="text-gray-400 text-lg">Current Price</p>
            <p className="text-5xl font-bold text-white">{data.current_price}</p>
        </div>

        {data.fifty_two_week_low && data.fifty_two_week_high && (
            <div className="mt-6 max-w-md mx-auto">
                {rangePosition !== null && (
                    <div className="relative w-full h-2 bg-gray-700 rounded-full mb-1">
                        <div className="absolute h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full" style={{ width: '100%' }}></div>
                        <div 
                           className="absolute top-1/2 -translate-y-1/2 h-4 w-1 bg-white rounded-full shadow-lg transform" 
                           style={{ left: `calc(${rangePosition}% - 2px)` }}
                           title={`Current price is at ${rangePosition.toFixed(1)}% of the 52-week range`}
                        >
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold bg-gray-900 px-1 rounded">Now</span>
                        </div>
                    </div>
                )}
                <div className="flex justify-between items-center text-sm px-1">
                    <div className="text-left">
                        <p className="text-gray-500">52W Low</p>
                        <p className="font-semibold text-red-400">{data.fifty_two_week_low}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-gray-500">52W High</p>
                        <p className="font-semibold text-green-400">{data.fifty_two_week_high}</p>
                    </div>
                </div>
            </div>
        )}
      </div>

      {data.historical_data && data.historical_data.length > 0 && (
        <div className="mb-12">
            <h3 className="text-2xl font-bold text-center mb-4">30-Day Price History</h3>
            <PriceChart data={data.historical_data} analysis={data.analysis} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {data.analysis.map((item, index) => (
          <RecommendationCard key={index} analysis={item} />
        ))}
      </div>
      
      {!isNaN(currentPriceNumber) && (
        <PriceAlertForm 
          stockSymbol={stockSymbol}
          currentPrice={currentPriceNumber}
          onSetAlert={onSetAlert}
        />
      )}

      {data.top_news && data.top_news.length > 0 && (
        <NewsSection news={data.top_news} />
      )}
    </div>
  );
};

export default AnalysisResult;