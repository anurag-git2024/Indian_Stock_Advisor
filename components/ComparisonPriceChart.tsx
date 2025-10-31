import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { StockAnalysis } from '../types';

interface ComparisonPriceChartProps {
  analyses: StockAnalysis[];
}

const COLORS = ['#34D399', '#60A5FA', '#FBBF24', '#F87171']; // green, blue, yellow, red

const ComparisonPriceChart: React.FC<ComparisonPriceChartProps> = ({ analyses }) => {
  // 1. Create a union of all dates from all datasets
  const allDates = new Set<string>();
  analyses.forEach(analysis => {
    analysis.historical_data.forEach(point => {
      allDates.add(point.date);
    });
  });

  const sortedDates = Array.from(allDates).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  // 2. Create price maps for quick lookup
  const priceMaps = analyses.map(analysis => {
    const map = new Map<string, number>();
    analysis.historical_data.forEach(point => {
      map.set(point.date, point.price);
    });
    return map;
  });

  // 3. Build the combined data for the chart
  const combinedData = sortedDates.map(date => {
    const dataPoint: { [key: string]: string | number | null } = {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
    analyses.forEach((analysis, i) => {
      const symbol = analysis.symbol!; 
      dataPoint[symbol] = priceMaps[i].get(date) ?? null; // Use null for recharts to create a gap in the line
    });
    return dataPoint;
  });
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="label text-gray-300 font-bold">{label}</p>
          {payload.map((pld: any, index: number) => (
            pld.value ? (
             <p key={index} style={{ color: pld.color }}>
                {`${pld.name}: ₹${pld.value.toLocaleString('en-IN')}`}
             </p>
            ) : null
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative h-96 w-full bg-gray-800/50 border border-gray-700 rounded-xl p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={combinedData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
          <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`} domain={['auto', 'auto']} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '14px' }} />
          {analyses.map((analysis, index) => (
            <Line
              key={analysis.symbol}
              type="monotone"
              dataKey={analysis.symbol!}
              name={analysis.symbol!}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
              connectNulls={true}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ComparisonPriceChart;
