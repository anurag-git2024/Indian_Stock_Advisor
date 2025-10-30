import React from 'react';
import { StockAnalysis } from '../types';
import RecommendationCard from './RecommendationCard';
import NewsSection from './NewsSection';

interface AnalysisResultProps {
  data: StockAnalysis;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ data }) => {
  return (
    <div className="mt-10 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">
          Analysis for <span className="text-green-400">{data.stock_name}</span>
        </h2>
        <div className="mt-4">
            <p className="text-gray-400 text-lg">Current Price</p>
            <p className="text-5xl font-bold text-white">{data.current_price}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {data.analysis.map((item, index) => (
          <RecommendationCard key={index} analysis={item} />
        ))}
      </div>
      
      {data.top_news && data.top_news.length > 0 && (
        <NewsSection news={data.top_news} />
      )}
    </div>
  );
};

export default AnalysisResult;
