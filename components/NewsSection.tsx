import React, { useState } from 'react';
import { NewsArticle } from '../types';
import { NewsIcon, LinkIcon } from './icons';

interface NewsSectionProps {
  news: NewsArticle[];
}

const NewsSection: React.FC<NewsSectionProps> = ({ news }) => {
  const [expandedArticles, setExpandedArticles] = useState<Set<number>>(new Set());

  const toggleArticleExpansion = (index: number) => {
    setExpandedArticles(prev => {
        const newSet = new Set(prev);
        if (newSet.has(index)) {
            newSet.delete(index);
        } else {
            newSet.add(index);
        }
        return newSet;
    });
  };

  const SUMMARY_TRUNCATE_LENGTH = 120;

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-3">
        <NewsIcon className="h-7 w-7" />
        Top News
      </h3>
      <div className="space-y-4 max-w-3xl mx-auto">
        {news.map((article, index) => {
          const isExpanded = expandedArticles.has(index);
          const isTruncatable = article.summary.length > SUMMARY_TRUNCATE_LENGTH;

          return (
            <div key={index} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 transition-all duration-300 hover:border-blue-500 hover:bg-gray-800">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-lg text-gray-100 pr-4">{article.title}</h4>
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex-shrink-0 text-blue-400 hover:text-blue-300 transition-colors"
                  aria-label={`Read more about ${article.title}`}
                >
                  <LinkIcon className="h-6 w-6" />
                </a>
              </div>
              <p className="text-sm text-gray-500 font-semibold mb-2">{article.source}</p>
              <div className="text-gray-400 text-sm">
                <p>
                  {isTruncatable && !isExpanded
                    ? `${article.summary.substring(0, SUMMARY_TRUNCATE_LENGTH)}...`
                    : article.summary}
                </p>
                {isTruncatable && (
                  <button 
                    onClick={() => toggleArticleExpansion(index)} 
                    className="text-blue-400 hover:underline text-sm mt-2 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    aria-expanded={isExpanded}
                  >
                    {isExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NewsSection;