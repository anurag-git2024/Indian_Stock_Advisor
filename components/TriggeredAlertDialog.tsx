import React from 'react';
import { PriceAlert } from '../types';
import { BellIcon, CloseIcon, TrendUpIcon, TrendDownIcon } from './icons';

interface TriggeredAlertDialogProps {
  alert: PriceAlert;
  currentPrice: string;
  onDismiss: (id: string) => void;
}

const TriggeredAlertDialog: React.FC<TriggeredAlertDialogProps> = ({ alert, currentPrice, onDismiss }) => {
  const isAbove = alert.condition === 'above';
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 animate-fade-in"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <div className="bg-gray-800 border-2 border-yellow-500 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full m-4 transform transition-all duration-300 scale-100">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-500/20 p-3 rounded-full">
              <BellIcon className="h-8 w-8 text-yellow-400" />
            </div>
            <div>
              <h2 id="alert-dialog-title" className="text-2xl font-bold text-yellow-400">Price Alert Triggered!</h2>
              <p className="text-gray-400 text-lg font-semibold">{alert.symbol}</p>
            </div>
          </div>
          <button 
            onClick={() => onDismiss(alert.id)} 
            className="text-gray-500 hover:text-gray-200 transition-colors"
            aria-label="Dismiss alert"
          >
            <CloseIcon className="h-7 w-7" />
          </button>
        </div>

        <div id="alert-dialog-description" className="mt-6 space-y-4 text-center">
            <div className="flex justify-around items-center bg-gray-900/50 p-4 rounded-lg">
                <div>
                    <p className="text-sm text-gray-400">Target Price</p>
                    <p className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                      {isAbove ? <TrendUpIcon className="h-6 w-6 text-green-400" /> : <TrendDownIcon className="h-6 w-6 text-red-400" />}
                      <span>₹{alert.targetPrice.toLocaleString('en-IN')}</span>
                    </p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Current Price</p>
                    <p className="text-2xl font-bold text-yellow-300">{currentPrice}</p>
                </div>
            </div>
            <p className="text-gray-300">
              {alert.symbol} has reached your target price.
            </p>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={() => onDismiss(alert.id)}
            className="w-full bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-yellow-500 disabled:bg-gray-500 transition-colors duration-300"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default TriggeredAlertDialog;
