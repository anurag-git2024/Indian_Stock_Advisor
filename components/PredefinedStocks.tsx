import React from 'react';
import { PlusCircleIcon } from './icons';

interface PredefinedStocksProps {
  stocks: string[];
  onSelect: (symbol: string) => void;
  loading: boolean;
  onAddToComparison: (symbol: string) => void;
  comparisonList: string[];
}

const PredefinedStocks: React.FC<PredefinedStocksProps> = ({ stocks, onSelect, loading, onAddToComparison, comparisonList }) => {
  return (
    <section className="mb-8 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-300 mb-4 text-center">Quick Picks</h2>
      <div className="flex flex-wrap justify-center gap-3">
        {stocks.map(symbol => {
          const isInComparison = comparisonList.includes(symbol);
          const isComparisonFull = comparisonList.length >= 3;
          return (
            <div key={symbol} className="bg-gray-700 rounded-full flex items-center transition-colors duration-200">
              <button
                onClick={() => onSelect(symbol)}
                disabled={loading}
                className="px-4 py-2 text-gray-300 text-sm font-medium hover:bg-green-600 hover:text-white disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed rounded-l-full"
                title={`Analyze ${symbol}`}
              >
                {symbol}
              </button>
              <span className="w-px h-4 bg-gray-600"></span>
              <button
                onClick={() => onAddToComparison(symbol)}
                disabled={loading || (isInComparison || isComparisonFull)}
                className="px-3 py-2 text-blue-400 hover:bg-gray-600 rounded-r-full disabled:text-gray-500 disabled:cursor-not-allowed"
                title={isInComparison ? 'Already in comparison' : isComparisonFull ? 'Comparison list is full' : `Add ${symbol} to comparison`}
              >
                <PlusCircleIcon className="h-5 w-5"/>
              </button>
            </div>
          )
        })}
      </div>
    </section>
  );
};

export default PredefinedStocks;
