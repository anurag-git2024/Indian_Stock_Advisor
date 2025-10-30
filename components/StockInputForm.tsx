import React, { useState } from 'react';
import { SearchIcon } from './icons';

interface StockInputFormProps {
  onSubmit: (symbol: string, timeframes: string[]) => void;
  loading: boolean;
}

const timeframes = ['All', 'Intraday', '1 Week', '1 Month', '6 Months', '1 Year', '2 Years'];

const StockInputForm: React.FC<StockInputFormProps> = ({ onSubmit, loading }) => {
  const [symbol, setSymbol] = useState('');
  const [selectedTimeframes, setSelectedTimeframes] = useState(['All']);

  const handleTimeframeChange = (timeframe: string) => {
    if (loading) return;

    if (timeframe === 'All') {
      setSelectedTimeframes(['All']);
    } else {
      setSelectedTimeframes(prev => {
        // If 'All' was selected, start fresh. Otherwise, use the previous selection.
        const currentSelection = prev.includes('All') ? [] : prev;

        let newSelection;
        if (currentSelection.includes(timeframe)) {
          // Deselect the timeframe
          newSelection = currentSelection.filter(t => t !== timeframe);
        } else {
          // Select the timeframe
          newSelection = [...currentSelection, timeframe];
        }

        // If selection becomes empty, default back to 'All'
        if (newSelection.length === 0) {
          return ['All'];
        }

        return newSelection;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTimeframes.length > 0) {
      onSubmit(symbol, selectedTimeframes);
    }
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
          disabled={loading || !symbol || selectedTimeframes.length === 0}
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
        <legend className="sr-only">Select analysis timeframe(s)</legend>
        <div className="flex justify-center items-center gap-2 sm:gap-4">
          <span className="text-gray-400 font-semibold text-sm sm:text-base" id="timeframe-label">Timeframes:</span>
          <div role="group" aria-labelledby="timeframe-label" className="flex flex-wrap justify-center gap-2 rounded-full bg-gray-800 p-1">
            {timeframes.map((timeframe) => (
              <button
                type="button"
                key={timeframe}
                onClick={() => handleTimeframeChange(timeframe)}
                disabled={loading}
                aria-pressed={selectedTimeframes.includes(timeframe)}
                className={`px-3 sm:px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                  selectedTimeframes.includes(timeframe)
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-transparent text-gray-400 hover:bg-gray-700'
                }`}
              >
                {timeframe}
              </button>
            ))}
          </div>
        </div>
      </fieldset>
    </form>
  );
};

export default StockInputForm;