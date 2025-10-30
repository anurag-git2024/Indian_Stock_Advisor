
import React from 'react';
import { TimeframeAnalysis, RecommendationType } from '../types';
import { TrendUpIcon, TrendDownIcon, MinusCircleIcon, TargetIcon } from './icons';

interface RecommendationCardProps {
  analysis: TimeframeAnalysis;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ analysis }) => {
  const { timeframe, recommendation, price_target, rationale } = analysis;

  const getRecommendationStyles = () => {
    switch (recommendation) {
      case RecommendationType.BUY:
        return {
          card: 'border-green-500/50 bg-green-900/20 hover:border-green-400',
          badge: 'bg-green-500 text-green-950',
          icon: <TrendUpIcon className="h-8 w-8 text-green-400" />,
          title: 'text-green-400',
        };
      case RecommendationType.SELL:
        return {
          card: 'border-red-500/50 bg-red-900/20 hover:border-red-400',
          badge: 'bg-red-500 text-red-950',
          icon: <TrendDownIcon className="h-8 w-8 text-red-400" />,
          title: 'text-red-400',
        };
      case RecommendationType.HOLD:
      default:
        return {
          card: 'border-yellow-500/50 bg-yellow-900/20 hover:border-yellow-400',
          badge: 'bg-yellow-500 text-yellow-950',
          icon: <MinusCircleIcon className="h-8 w-8 text-yellow-400" />,
          title: 'text-yellow-400',
        };
    }
  };

  const styles = getRecommendationStyles();

  return (
    <div className={`rounded-xl border p-6 flex flex-col transition-all duration-300 transform hover:scale-105 ${styles.card}`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold">{timeframe}</h3>
        <span className={`px-3 py-1 text-sm font-bold rounded-full ${styles.badge}`}>
          {recommendation}
        </span>
      </div>
      
      <div className="mb-4">
        {styles.icon}
      </div>

      <div className="mb-4 flex items-center space-x-2 text-gray-300">
        <TargetIcon className="h-5 w-5 text-gray-400" />
        <span className="font-semibold">Price Target:</span>
        <span className={`font-bold text-lg ${styles.title}`}>{price_target}</span>
      </div>

      <p className="text-gray-400 text-sm flex-grow">
        <strong>Rationale:</strong> {rationale}
      </p>
    </div>
  );
};

export default RecommendationCard;
