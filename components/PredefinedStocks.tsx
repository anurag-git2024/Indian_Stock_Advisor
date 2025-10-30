import React from 'react';

interface PredefinedStocksProps {
  stocks: string[];
  onSelect: (symbol: string) => void;
  loading: boolean;
}

const PredefinedStocks: React.FC<PredefinedStocksProps> = ({ stocks, onSelect, loading }) => {
  return (
    <section className="mb-8 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-300 mb-4 text-center">Quick Picks</h2>
      <div className="flex flex-wrap justify-center gap-2">
        {stocks.map(symbol => (
          <button
            key={symbol}
            onClick={() => onSelect(symbol)}
            disabled={loading}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-full text-sm font-medium hover:bg-green-600 hover:text-white disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
            title={`Analyze ${symbol}`}
          >
            {symbol}
          </button>
        ))}
      </div>
    </section>
  );
};

export default PredefinedStocks;