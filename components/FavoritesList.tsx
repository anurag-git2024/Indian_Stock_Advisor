import React from 'react';
import { TrashIcon } from './icons';

interface FavoritesListProps {
  favorites: string[];
  onSelect: (symbol: string) => void;
  onRemove: (symbol: string) => void;
  loading: boolean;
}

const FavoritesList: React.FC<FavoritesListProps> = ({ favorites, onSelect, onRemove, loading }) => {
  return (
    <section className="mb-8 max-w-2xl mx-auto animate-fade-in">
      <h2 className="text-xl font-semibold text-gray-300 mb-4 text-center">Your Favorites</h2>
      <div className="flex flex-wrap justify-center gap-3 p-2 bg-gray-800/50 border border-gray-700 rounded-xl">
        {favorites.map(symbol => (
          <div key={symbol} className="bg-gray-800 border border-gray-600 rounded-full flex items-center justify-between text-sm font-medium shadow-sm">
            <button
              onClick={() => onSelect(symbol)}
              disabled={loading}
              className="px-4 py-2 text-green-400 hover:bg-gray-700/50 rounded-l-full disabled:text-gray-500 disabled:hover:bg-gray-800 transition-colors duration-200"
              title={`Analyze ${symbol}`}
            >
              {symbol}
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
        ))}
      </div>
    </section>
  )
};

export default FavoritesList;