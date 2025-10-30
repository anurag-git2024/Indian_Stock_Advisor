import React, { useState } from 'react';
import { PriceAlert } from '../types';
import { BellIcon } from './icons';

interface PriceAlertFormProps {
  stockSymbol: string;
  currentPrice: number;
  onSetAlert: (alert: Omit<PriceAlert, 'id' | 'status'>) => void;
}

const PriceAlertForm: React.FC<PriceAlertFormProps> = ({ stockSymbol, currentPrice, onSetAlert }) => {
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) {
      setError('Please enter a valid target price.');
      return;
    }
    setError(null);
    onSetAlert({
      symbol: stockSymbol,
      targetPrice: price,
      condition,
    });
    setTargetPrice('');
  };

  return (
    <div className="mt-12">
        <h3 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-3">
            <BellIcon className="h-7 w-7 text-yellow-400" />
            Set Price Alert
        </h3>
        <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-gray-800/50 border border-gray-700 rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center bg-gray-800 border-2 border-gray-600 rounded-lg overflow-hidden focus-within:border-yellow-500">
                    <span className="pl-3 text-gray-400">₹</span>
                    <input 
                        type="number"
                        step="0.01"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(e.target.value)}
                        placeholder="Target Price"
                        className="w-full bg-transparent p-2 text-gray-200 placeholder-gray-500 focus:outline-none"
                        aria-label="Target Price"
                        required
                    />
                </div>
                <div className="bg-gray-800 border-2 border-gray-600 rounded-lg p-1 flex">
                    <button 
                        type="button" 
                        onClick={() => setCondition('above')}
                        aria-pressed={condition === 'above'}
                        className={`w-1/2 rounded-md py-1 px-2 text-sm font-semibold transition-colors ${condition === 'above' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                    >
                        Above
                    </button>
                    <button 
                        type="button" 
                        onClick={() => setCondition('below')}
                        aria-pressed={condition === 'below'}
                        className={`w-1/2 rounded-md py-1 px-2 text-sm font-semibold transition-colors ${condition === 'below' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                    >
                        Below
                    </button>
                </div>
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
                type="submit"
                className="w-full bg-yellow-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-yellow-500 disabled:bg-gray-500 transition-colors duration-300"
            >
                Set Alert
            </button>
            <p className="text-xs text-gray-500 text-center">Current Price: ₹{currentPrice.toLocaleString('en-IN')}. You will be notified when you analyze this stock again after the price crosses your target.</p>
        </form>
    </div>
  );
};

export default PriceAlertForm;
