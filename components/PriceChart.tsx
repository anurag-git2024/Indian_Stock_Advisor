import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Brush } from 'recharts';
import { HistoricalDataPoint } from '../types';

interface PriceChartProps {
  data: HistoricalDataPoint[];
}

const PriceChart: React.FC<PriceChartProps> = ({ data }) => {

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