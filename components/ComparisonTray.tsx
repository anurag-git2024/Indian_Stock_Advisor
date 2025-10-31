import React from 'react';
import { XCircleIcon } from './icons';

interface ComparisonTrayProps {
  comparisonList: string[];
  onRemove: (symbol: string) => void;
  onClear: () => void;
  onCompare: () => void;
  loading: boolean;
  appLoading: boolean;
}

const ComparisonTray: React.FC<ComparisonTrayProps> = ({ comparisonList, onRemove, onClear, onCompare, loading, appLoading }) => {
  if (comparisonList.length === 0) {
    return null;
  }

  const canCompare = comparisonList.length >= 2;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800/80 backdrop-blur-sm border-t border-gray-700 z-40 animate-fade-in">
      <div className="max-w-4xl mx-auto p-3 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="font-semibold text-gray-300 hidden sm:block">Comparing:</span>
            {comparisonList.map(symbol => (
                <div key={symbol} className="flex items-center bg-gray-700 rounded-full text-sm">
                    <span className="font-bold text-green-400 px-3 py-1">{symbol}</span>
                    <button 
                        onClick={() => onRemove(symbol)} 
                        className="text-gray-400 hover:text-white pr-2"
                        aria-label={`Remove ${symbol} from comparison`}
                    >
                        <XCircleIcon className="h-5 w-5"/>
                    </button>
                </div>
            ))}
             {comparisonList.length < 3 && <span className="text-gray-500 text-sm">Add up to {3 - comparisonList.length} more...</span>}
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={onClear}
                disabled={loading || appLoading}
                className="text-gray-400 hover:text-white font-semibold text-sm px-3 py-2 rounded-md disabled:opacity-50"
            >
                Clear
            </button>
            <button
                onClick={onCompare}
                disabled={!canCompare || loading || appLoading}
                className="bg-green-600 text-white font-bold px-5 py-2 rounded-full hover:bg-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-300 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Comparing...
                </>
              ) : (
                <>
                  Compare ({comparisonList.length})
                </>
              )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ComparisonTray;
