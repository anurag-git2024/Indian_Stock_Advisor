import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Brush } from 'recharts';
import { HistoricalDataPoint, TimeframeAnalysis, RecommendationType } from '../types';
import { TrendUpIcon, TrendDownIcon, MinusCircleIcon } from './icons';

interface PriceChartProps {
  data: HistoricalDataPoint[];
  analysis: TimeframeAnalysis[];
}

const RecommendationBadge: React.FC<{ analysis: TimeframeAnalysis }> = ({ analysis }) => {
    const getRecommendationStyles = () => {
        switch (analysis.recommendation) {
            case RecommendationType.BUY:
                return {
                    icon: <TrendUpIcon className="h-5 w-5 text-green-400" />,
                    text: 'text-green-400',
                };
            case RecommendationType.SELL:
                return {
                    icon: <TrendDownIcon className="h-5 w-5 text-red-400" />,
                    text: 'text-red-400',
                };
            case RecommendationType.HOLD:
            default:
                return {
                    icon: <MinusCircleIcon className="h-5 w-5 text-yellow-400" />,
                    text: 'text-yellow-400',
                };
        }
    };
    const styles = getRecommendationStyles();

    return (
        <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-gray-300 w-20 flex-shrink-0">{analysis.timeframe}:</span>
            <div className="flex items-center gap-1">
                {styles.icon}
                <span className={`font-bold ${styles.text}`}>{analysis.recommendation}</span>
            </div>
        </div>
    );
};


const PriceChart: React.FC<PriceChartProps> = ({ data, analysis }) => {

  const formattedData = data.map(item => ({
    ...item,
    // Format date for better display on the X-axis
    formattedDate: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="label text-gray-300">{`${label}`}</p>
          <p className="intro text-green-400 font-bold">{`Price : ₹${payload[0].value.toLocaleString('en-IN')}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative h-96 w-full bg-gray-800/50 border border-gray-700 rounded-xl p-4">
      <div className="absolute top-4 left-4 z-10 bg-gray-900/70 backdrop-blur-sm border border-gray-700 rounded-lg p-3 space-y-2 max-w-xs">
          <h4 className="text-sm font-bold text-white border-b border-gray-600 pb-1 mb-2">AI Recommendations</h4>
          {analysis.map((item, index) => (
              <RecommendationBadge key={index} analysis={item} />
          ))}
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formattedData}
          margin={{
            top: 5,
            right: 20,
            left: 10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
          <XAxis 
            dataKey="formattedDate" 
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
            domain={['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '14px' }} />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#34D399" // green-400
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
            name="Closing Price"
          />
          <Brush 
            dataKey="formattedDate" 
            height={30} 
            stroke="#34D399"
            fill="rgba(31, 41, 55, 0.5)"
          >
            {/* The nested LineChart creates the preview inside the brush */}
            <LineChart>
                <Line type="monotone" dataKey="price" stroke="#34D399" dot={false} />
            </LineChart>
          </Brush>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;