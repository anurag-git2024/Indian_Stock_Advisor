import React, { useState } from 'react';
import { StockAnalysis, PriceAlert, TimeframeAnalysis, RecommendationType } from '../types';
import RecommendationCard from './RecommendationCard';
import NewsSection from './NewsSection';
import PriceChart from './PriceChart';
import { StarIcon, StarOutlineIcon, TrendUpIcon, TrendDownIcon, MinusCircleIcon, DownloadIcon, PlusCircleIcon } from './icons';
import PriceAlertForm from './PriceAlertForm';

// TypeScript declaration for jsPDF globals loaded from script tags
declare global {
    interface Window {
        jspdf: any;
    }
}

// --- Recommendations Panel Component ---
const RecommendationBadge: React.FC<{ analysis: TimeframeAnalysis }> = ({ analysis }) => {
    const getRecommendationStyles = () => {
        switch (analysis.recommendation) {
            case RecommendationType.BUY:
                return {
                    icon: <TrendUpIcon className="h-4 w-4" />,
                    text: 'text-green-300',
                    container: 'bg-green-500/10 border-green-500/30',
                };
            case RecommendationType.SELL:
                return {
                    icon: <TrendDownIcon className="h-4 w-4" />,
                    text: 'text-red-300',
                    container: 'bg-red-500/10 border-red-500/30',
                };
            case RecommendationType.HOLD:
            default:
                return {
                    icon: <MinusCircleIcon className="h-4 w-4" />,
                    text: 'text-yellow-300',
                    container: 'bg-yellow-500/10 border-yellow-500/30',
                };
        }
    };
    const styles = getRecommendationStyles();

    return (
        <div className={`flex items-center gap-2 text-xs rounded-full px-3 py-1.5 border ${styles.container}`}>
            <span className="font-semibold text-gray-300 whitespace-nowrap">{analysis.timeframe}:</span>
            <div className={`flex items-center gap-1 font-bold ${styles.text}`}>
                {styles.icon}
                <span>{analysis.recommendation}</span>
            </div>
        </div>
    );
};

interface RecommendationsPanelProps {
    analysis: TimeframeAnalysis[];
}

const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({ analysis }) => {
    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 h-full">
            <h4 className="text-lg font-bold text-white border-b border-gray-600 pb-2 mb-4 text-center">AI Recommendations</h4>
            <div className="flex flex-wrap justify-center gap-2">
                {analysis.map((item, index) => (
                    <RecommendationBadge key={index} analysis={item} />
                ))}
            </div>
        </div>
    );
};


interface AnalysisResultProps {
  data: StockAnalysis;
  stockSymbol: string;
  isFavorite: boolean;
  onToggleFavorite: (symbol: string) => void;
  onSetAlert: (alert: Omit<PriceAlert, 'id' | 'status'>) => void;
  onAddToComparison: (symbol: string) => void;
  isInComparison: boolean;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ data, stockSymbol, isFavorite, onToggleFavorite, onSetAlert, onAddToComparison, isInComparison }) => {
  const [isExporting, setIsExporting] = useState(false);
  const currentPriceNumber = parseFloat(data.current_price.replace(/[₹,]/g, ''));
  
  const low = data.fifty_two_week_low ? parseFloat(data.fifty_two_week_low.replace(/[₹,]/g, '')) : NaN;
  const high = data.fifty_two_week_high ? parseFloat(data.fifty_two_week_high.replace(/[₹,]/g, '')) : NaN;
  
  let rangePosition: number | null = null;
  if (!isNaN(low) && !isNaN(high) && !isNaN(currentPriceNumber) && high > low) {
      const range = high - low;
      const position = ((currentPriceNumber - low) / range) * 100;
      rangePosition = Math.max(0, Math.min(100, position));
  }

  const handleExportPDF = () => {
    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert("Could not export to PDF. The required library is missing.");
        console.error("jsPDF library not found on window object.");
        return;
    }
    setIsExporting(true);

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Title
        doc.setFontSize(20);
        doc.setTextColor('#10B981'); // Corresponds to text-green-500
        doc.text(`${data.stock_name} (${stockSymbol})`, 15, 20);

        // Sub-header
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Analysis Report`, 15, 28);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, 34);

        // Summary Table
        const summaryData = [
            ['Current Price', data.current_price],
            ['52-Week High', data.fifty_two_week_high],
            ['52-Week Low', data.fifty_two_week_low],
        ];
        doc.autoTable({
            startY: 40,
            head: [['Metric', 'Value']],
            body: summaryData,
            theme: 'grid',
            headStyles: { fillColor: '#374151' }, // gray-700
        });

        // Recommendations Table
        doc.setFontSize(16);
        doc.setTextColor(40);
        doc.text('AI Recommendations', 15, doc.lastAutoTable.finalY + 15);
        const recommendationsData = data.analysis.map(a => [
            a.timeframe, a.recommendation, a.price_target, a.rationale
        ]);
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 20,
            head: [['Timeframe', 'Recommendation', 'Price Target', 'Rationale']],
            body: recommendationsData,
            theme: 'striped',
            headStyles: { fillColor: '#10B981' },
            columnStyles: { 3: { cellWidth: 70 } }
        });
        
        // News Section
        if (data.top_news && data.top_news.length > 0) {
            doc.addPage();
            doc.setFontSize(16);
            doc.setTextColor(40);
            doc.text('Recent News', 15, 20);
             const newsData = data.top_news.map(n => [
                n.title, n.source, n.summary
            ]);
            doc.autoTable({
                startY: 28,
                head: [['Title', 'Source', 'Summary']],
                body: newsData,
                theme: 'striped',
                headStyles: { fillColor: '#3B82F6' }, // blue-500
                columnStyles: { 0: { cellWidth: 45 }, 2: { cellWidth: 70 } }
            });
        }
        
        // Footer/Disclaimer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(
                'Disclaimer: This AI-generated report is for informational purposes only and not financial advice.',
                15,
                doc.internal.pageSize.height - 10
            );
             doc.text(
                `Page ${i} of ${pageCount}`,
                doc.internal.pageSize.width - 35,
                doc.internal.pageSize.height - 10
            );
        }

        doc.save(`${stockSymbol}_Analysis_${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (err) {
        console.error("Failed to generate PDF:", err);
        alert("An error occurred while generating the PDF.");
    } finally {
        setIsExporting(false);
    }
  };


  return (
    <div className="mt-10 animate-fade-in">
      <div className="text-center mb-8 bg-gray-800/30 border border-gray-700 rounded-xl p-6">
        <div className="flex justify-center items-center gap-4">
            <h2 className="text-3xl font-bold">
                Analysis for <span className="text-green-400">{data.stock_name}</span>
            </h2>
            <button
                onClick={() => onToggleFavorite(stockSymbol)}
                className="text-yellow-400 hover:text-yellow-300 transition-transform duration-200 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded-full"
                aria-label={isFavorite ? `Remove ${stockSymbol} from favorites` : `Add ${stockSymbol} to favorites`}
                title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            >
                {isFavorite ? <StarIcon className="h-8 w-8" /> : <StarOutlineIcon className="h-8 w-8" />}
            </button>
            <button
                onClick={() => onAddToComparison(stockSymbol)}
                disabled={isInComparison}
                className="text-blue-400 hover:text-blue-300 transition-transform duration-200 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full disabled:text-gray-500 disabled:cursor-not-allowed disabled:scale-100"
                aria-label={isInComparison ? `${stockSymbol} is in comparison list` : `Add ${stockSymbol} to comparison`}
                title={isInComparison ? 'In Comparison List' : 'Add to Compare'}
            >
                <PlusCircleIcon className="h-8 w-8" />
            </button>
            <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="text-blue-400 hover:text-blue-300 transition-transform duration-200 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full disabled:text-gray-500 disabled:cursor-wait"
                aria-label="Export analysis as PDF"
                title="Export as PDF"
            >
                {isExporting ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" role="status" aria-live="polite"></div>
                ) : (
                    <DownloadIcon className="h-8 w-8" />
                )}
            </button>
        </div>
        <div className="mt-4">
            <p className="text-gray-400 text-lg">Current Price</p>
            <p className="text-5xl font-bold text-white">{data.current_price}</p>
        </div>

        {data.fifty_two_week_low && data.fifty_two_week_high && (
            <div className="mt-6 max-w-md mx-auto">
                {rangePosition !== null && (
                    <div className="relative w-full h-2 bg-gray-700 rounded-full mb-1">
                        <div className="absolute h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full" style={{ width: '100%' }}></div>
                        <div 
                           className="absolute top-1/2 -translate-y-1/2 h-4 w-1 bg-white rounded-full shadow-lg transform" 
                           style={{ left: `calc(${rangePosition}% - 2px)` }}
                           title={`Current price is at ${rangePosition.toFixed(1)}% of the 52-week range`}
                        >
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold bg-gray-900 px-1 rounded">Now</span>
                        </div>
                    </div>
                )}
                <div className="flex justify-between items-center text-sm px-1">
                    <div className="text-left">
                        <p className="text-gray-500">52W Low</p>
                        <p className="font-semibold text-red-400">{data.fifty_two_week_low}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-gray-500">52W High</p>
                        <p className="font-semibold text-green-400">{data.fifty_two_week_high}</p>
                    </div>
                </div>
            </div>
        )}
      </div>

      {data.historical_data && data.historical_data.length > 0 && (
        <div className="mb-12">
            <h3 className="text-2xl font-bold text-center mb-4">30-Day Price History &amp; AI Recommendations</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2">
                <PriceChart data={data.historical_data} />
              </div>
              <div className="lg:col-span-1">
                <RecommendationsPanel analysis={data.analysis} />
              </div>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {data.analysis.map((item, index) => (
          <RecommendationCard key={index} analysis={item} />
        ))}
      </div>
      
      {!isNaN(currentPriceNumber) && (
        <PriceAlertForm 
          stockSymbol={stockSymbol}
          currentPrice={currentPriceNumber}
          onSetAlert={onSetAlert}
        />
      )}

      {data.top_news && data.top_news.length > 0 && (
        <NewsSection news={data.top_news} />
      )}
    </div>
  );
};

export default AnalysisResult;