
import React, { useState } from 'react';
import { SearchIcon } from './icons';

interface StockInputFormProps {
  onSubmit: (symbol: string) => void;
  loading: boolean;
}

const StockInputForm: React.FC<StockInputFormProps> = ({ onSubmit, loading }) => {
  const [symbol, setSymbol] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(symbol);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 max-w-xl mx-auto">
      <div className="flex items-center bg-gray-800 border-2 border-gray-600 rounded-full shadow-lg overflow-hidden focus-within:border-green-500 transition-colors duration-300">
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="e.g., RELIANCE"
          className="w-full bg-transparent p-4 text-gray-200 placeholder-gray-500 focus:outline-none"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !symbol}
          className="bg-green-600 text-white font-bold p-4 h-full rounded-r-full hover:bg-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center aspect-square"
        >
          {loading ? (
             <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          ) : (
            <SearchIcon className="h-6 w-6" />
          )}
        </button>
      </div>
    </form>
  );
};

export default StockInputForm;
