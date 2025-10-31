import React from 'react';
import { StockAnalysis } from '../types';
import ComparisonPriceChart from './ComparisonPriceChart';
import { BackIcon, TrendUpIcon, TrendDownIcon, MinusCircleIcon } from './icons';

interface ComparisonViewProps {
  analyses: StockAnalysis[];
  onBack: () => void;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ analyses, onBack }) => {
    if (!analyses || analyses.length === 0) {
        return (
            <div className="text-center mt-10">
                <p>No comparison data available.</p>
                <button onClick={onBack} className="mt-4 text-blue-400 hover:underline">Go Back</button>
            </div>
        );
    }
    
    const metrics = [
        { label: 'Current Price', key: 'current_price' as keyof StockAnalysis },
        { label: '52-Week High', key: 'fifty_two_week_high' as keyof StockAnalysis },
        { label: '52-Week Low', key: 'fifty_two_week_low' as keyof StockAnalysis },
    ];

    const getRecommendationCounts = (analysis: StockAnalysis) => {
        const counts = { Buy: 0, Sell: 0, Hold: 0 };
        analysis.analysis.forEach(a => {
            if (a.recommendation) {
                counts[a.recommendation]++;
            }
        });
        return counts;
    };

    return (
        <div className="mt-10 animate-fade-in w-full max-w-5xl mx-auto">
            <header className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                    Stock Comparison
                </h2>
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 transition-colors"
                >
                    <BackIcon className="h-5 w-5"/>
                    Back to Analysis
                </button>
            </header>
            
            <section className="mb-12">
                <h3 className="text-2xl font-bold text-center mb-4">Key Metrics</h3>
                <div className="overflow-x-auto bg-gray-800/50 border border-gray-700 rounded-xl p-1">
                    <table className="w-full text-left">
                        <thead className="border-b-2 border-gray-600">
                            <tr>
                                <th className="p-4 font-semibold text-gray-400">Metric</th>
                                {analyses.map(a => (
                                    <th key={a.symbol} className="p-4 font-bold text-center text-lg text-green-400">{a.symbol} <span className="text-sm text-gray-500 font-normal block truncate max-w-[150px] mx-auto">{a.stock_name}</span></th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {metrics.map(metric => (
                                <tr key={metric.label} className="border-b border-gray-700 last:border-b-0">
                                    <td className="p-4 font-semibold">{metric.label}</td>
                                    {analyses.map(a => (
                                        <td key={a.symbol} className="p-4 text-center font-mono text-lg text-white">{(a[metric.key] as string) || 'N/A'}</td>
                                    ))}
                                </tr>
                            ))}
                            <tr className="border-b border-gray-700 last:border-b-0">
                                <td className="p-4 font-semibold">AI Recommendations</td>
                                {analyses.map(a => {
                                    const counts = getRecommendationCounts(a);
                                    return (
                                        <td key={a.symbol} className="p-4 text-center">
                                            <div className="flex justify-center items-center gap-3 text-sm">
                                                <span className="flex items-center gap-1 text-green-400"><TrendUpIcon className="h-4 w-4"/> {counts.Buy}</span>
                                                <span className="flex items-center gap-1 text-yellow-400"><MinusCircleIcon className="h-4 w-4"/> {counts.Hold}</span>
                                                <span className="flex items-center gap-1 text-red-400"><TrendDownIcon className="h-4 w-4"/> {counts.Sell}</span>
                                            </div>
                                        </td>
                                    )
                                })}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
            
            <section>
                <h3 className="text-2xl font-bold text-center mb-4">30-Day Price Trend Comparison</h3>
                <ComparisonPriceChart analyses={analyses} />
            </section>
        </div>
    );
};

export default ComparisonView;
