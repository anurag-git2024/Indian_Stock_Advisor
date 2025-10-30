import React from 'react';
import { StockAnalysis } from '../types';
import RecommendationCard from './RecommendationCard';
import NewsSection from './NewsSection';
import PriceChart from './PriceChart';
import { StarIcon, StarOutlineIcon } from './icons';

interface AnalysisResultProps {
  data: StockAnalysis;
  stockSymbol: string;
  isFavorite: boolean;
  onToggleFavorite: (symbol: string) => void;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ data, stockSymbol, isFavorite, onToggleFavorite }) => {
  return (
    <div className="mt-10 animate-fade-in">
      <div className="text-center mb-8">
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
      </div>

      {data.historical_data && data.historical_data.length > 0 && (
        <div className="mb-12">
            <h3 className="text-2xl font-bold text-center mb-4">30-Day Price History</h3>
            <PriceChart data={data.historical_data} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {data.analysis.map((item, index) => (
          <RecommendationCard key={index} analysis={item} />
        ))}
      </div>
      
      {data.top_news && data.top_news.length > 0 && (
        <NewsSection news={data.top_news} />
      )}
    </div>
  );
};

export default AnalysisResult;