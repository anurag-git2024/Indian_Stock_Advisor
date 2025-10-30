
import React, { useState } from 'react';
import { SearchIcon } from './icons';

interface StockInputFormProps {
  onSubmit: (symbol: string, timeframe: string) => void;
  loading: boolean;
}

const timeframes = ['All', 'Intraday', '1 Week', '1 Month'];

const StockInputForm: React.FC<StockInputFormProps> = ({ onSubmit, loading }) => {
  const [symbol, setSymbol] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('All');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(symbol, selectedTimeframe);
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
          aria-label="Stock Symbol"
        />
        <button
          type="submit"
          disabled={loading || !symbol}
          className="bg-green-600 text-white font-bold p-4 h-full rounded-r-full hover:bg-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center aspect-square"
          aria-label="Analyze Stock"
        >
          {loading ? (
             <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" role="status" aria-live="polite"></div>
          ) : (
            <SearchIcon className="h-6 w-6" />
          )}
        </button>
      </div>
      <fieldset className="mt-4">
        <legend className="sr-only">Select analysis timeframe</legend>
        <div className="flex justify-center items-center gap-2 sm:gap-4">
          <span className="text-gray-400 font-semibold text-sm sm:text-base" id="timeframe-label">Timeframe:</span>
          <div role="radiogroup" aria-labelledby="timeframe-label" className="flex flex-wrap justify-center gap-2 rounded-full bg-gray-800 p-1">
            {timeframes.map((timeframe) => (
              <label key={timeframe} className="cursor-pointer">
                <input
                  type="radio"
                  name="timeframe"
                  value={timeframe}
                  checked={selectedTimeframe === timeframe}
                  onChange={() => setSelectedTimeframe(timeframe)}
                  className="sr-only"
                  disabled={loading}
                  aria-label={timeframe}
                />
                <span
                  className={`px-3 sm:px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                    selectedTimeframe === timeframe
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-transparent text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {timeframe}
                </span>
              </label>
            ))}
          </div>
        </div>
      </fieldset>
    </form>
  );
};

export default StockInputForm;
