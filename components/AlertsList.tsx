import React from 'react';
import { PriceAlert } from '../types';
import { BellIcon, TrashIcon, TrendUpIcon, TrendDownIcon } from './icons';

interface AlertsListProps {
  alerts: PriceAlert[];
  onRemove: (id: string) => void;
  loading: boolean;
}

const AlertsList: React.FC<AlertsListProps> = ({ alerts, onRemove, loading }) => {
  if (alerts.length === 0) {
    return null;
  }

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const triggeredAlerts = alerts.filter(a => a.status === 'triggered');

  return (
    <section className="mb-8 max-w-2xl mx-auto animate-fade-in">
      <h2 className="text-xl font-semibold text-gray-300 mb-4 text-center flex items-center justify-center gap-2">
        <BellIcon className="h-6 w-6 text-yellow-400" />
        Your Price Alerts
      </h2>
      <div className="space-y-3 p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
        {activeAlerts.length === 0 && triggeredAlerts.length === 0 && (
          <p className="text-gray-500 text-center">You have no price alerts set.</p>
        )}
        {[...activeAlerts, ...triggeredAlerts].map(alert => (
          <div 
            key={alert.id} 
            className={`flex items-center justify-between p-3 rounded-lg border ${
              alert.status === 'active' 
                ? 'bg-gray-800 border-gray-600' 
                : 'bg-yellow-900/30 border-yellow-700/50 opacity-70'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="font-bold text-lg text-white w-24">{alert.symbol}</span>
              <div className="flex items-center gap-2 text-md">
                {alert.condition === 'above' 
                    ? <TrendUpIcon className="h-5 w-5 text-green-400" /> 
                    : <TrendDownIcon className="h-5 w-5 text-red-400" />
                }
                <span className="text-gray-300">₹{alert.targetPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                alert.status === 'active' 
                  ? 'bg-blue-500 text-blue-950' 
                  : 'bg-yellow-500 text-yellow-950'
              }`}>
                {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
              </span>
              <button
                onClick={() => onRemove(alert.id)}
                disabled={loading}
                className="text-red-500 hover:text-red-400 disabled:text-gray-500 transition-colors"
                aria-label={`Remove alert for ${alert.symbol}`}
                title="Remove Alert"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AlertsList;
