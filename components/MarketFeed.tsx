import React from 'react';
import { MarketFeedItem, MarketSentiment } from '../types';
import { RefreshIcon } from './icons';

interface MarketFeedProps {
    feed: MarketFeedItem[] | null;
    loading: boolean;
    error: string | null;
    onRefresh: () => void;
}

const SentimentIndicator: React.FC<{ sentiment: MarketSentiment }> = ({ sentiment }) => {
    const sentimentClasses: { [key in MarketSentiment]: string } = {
        [MarketSentiment.POSITIVE]: 'bg-green-500',
        [MarketSentiment.NEGATIVE]: 'bg-red-500',
        [MarketSentiment.NEUTRAL]: 'bg-yellow-500',
    };
    const bgColorClass = sentimentClasses[sentiment] || 'bg-gray-500';

    return (
        <div className={`flex-shrink-0 w-3 h-3 rounded-full ring-4 ring-gray-800 ${bgColorClass}`}></div>
    );
};

const MarketFeed: React.FC<MarketFeedProps> = ({ feed, loading, error, onRefresh }) => {
    return (
        <section className="mb-8 max-w-3xl mx-auto">
            <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-200">
                        Global Market Feed
                    </h2>
                    <button
                        onClick={onRefresh}
                        disabled={loading}
                        className="p-2 text-gray-400 rounded-full hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-wait"
                        aria-label="Refresh Market Feed"
                        title="Refresh Feed"
                    >
                        <RefreshIcon className={`h-6 w-6 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {loading && !feed && (
                    <div className="text-center text-gray-400 py-4">
                        <p>Loading market feed...</p>
                    </div>
                )}

                {error && (
                    <div className="text-center bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {feed && feed.length > 0 && (
                    <div className="relative space-y-6">
                        {/* The timeline bar */}
                        <div className="absolute left-[5px] top-1 bottom-1 w-0.5 bg-gray-700"></div>

                        {feed.map((item, index) => (
                            <div key={index} className="relative flex items-start gap-4">
                                <SentimentIndicator sentiment={item.sentiment} />
                                <div className="flex-1">
                                    <div className="flex justify-between items-baseline text-xs text-gray-500">
                                        <p className="font-semibold">{item.source}</p>
                                        <p>{item.timestamp.replace(' UTC', '')}</p>
                                    </div>
                                    <h4 className="font-bold text-gray-100 mt-0.5">{item.title}</h4>
                                    <p className="text-sm text-gray-400 mt-1">{item.summary}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default MarketFeed;
