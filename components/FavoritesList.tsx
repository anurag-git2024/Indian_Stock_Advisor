import React from 'react';
import { TrashIcon, PlusCircleIcon } from './icons';

interface FavoritesListProps {
  favorites: string[];
  onSelect: (symbol: string) => void;
  onRemove: (symbol: string) => void;
  loading: boolean;
  onAddToComparison: (symbol: string) => void;
  comparisonList: string[];
}

const FavoritesList: React.FC<FavoritesListProps> = ({ favorites, onSelect, onRemove, loading, onAddToComparison, comparisonList }) => {
  return (
    <section className="mb-8 max-w-3xl mx-auto animate-fade-in">
      <h2 className="text-xl font-semibold text-gray-300 mb-4 text-center">Your Favorites</h2>
      <div className="flex flex-wrap justify-center gap-3 p-2 bg-gray-800/50 border border-gray-700 rounded-xl">
        {favorites.map(symbol => {
            const isInComparison = comparisonList.includes(symbol);
            const isComparisonFull = comparisonList.length >= 3;
            return (
                <div key={symbol} className="bg-gray-800 border border-gray-600 rounded-full flex items-center justify-between text-sm font-medium shadow-sm">
                    <button
                    onClick={() => onSelect(symbol)}
                    disabled={loading}
                    className="pl-4 pr-2 py-2 text-green-400 hover:bg-gray-700/50 rounded-l-full disabled:text-gray-500 disabled:hover:bg-gray-800 transition-colors duration-200"
                    title={`Analyze ${symbol}`}
                    >
                    {symbol}
                    </button>
                    <span className="w-px h-4 bg-gray-600"></span>
                     <button
                        onClick={() => onAddToComparison(symbol)}
                        disabled={loading || isInComparison || isComparisonFull}
                        className="px-2 py-2 text-blue-400 hover:bg-gray-700/50 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                        title={isInComparison ? 'In comparison' : isComparisonFull ? 'Comparison full' : `Add ${symbol} to compare`}
                     >
                        <PlusCircleIcon className="h-4 w-4" />
                    </button>
                    <span className="w-px h-4 bg-gray-600"></span>
                    <button
                    onClick={() => onRemove(symbol)}
                    disabled={loading}
                    className="px-3 py-2 text-red-500 hover:bg-gray-700/50 rounded-r-full disabled:text-gray-500 disabled:hover:bg-gray-800 transition-colors duration-200"
                    aria-label={`Remove ${symbol} from favorites`}
                    title={`Remove ${symbol}`}
                    >
                    <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            )
        })}
      </div>
    </section>
  )
};

export default FavoritesList;