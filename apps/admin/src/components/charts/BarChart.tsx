'use client';

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DataPoint {
  [key: string]: string | number;
}

interface BarChartProps {
  data: DataPoint[];
  dataKey: string;
  xAxisKey: string;
  title?: string;
  color?: string;
  height?: number;
  yAxisFormatter?: (value: number) => string;
  hideLegend?: boolean;
}

export default function BarChart({ 
  data, 
  dataKey, 
  xAxisKey, 
  title, 
  color = '#3b82f6', 
  height = 300,
  yAxisFormatter,
  hideLegend = false
}: BarChartProps) {
  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis dataKey={xAxisKey} stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis 
            stroke="#6b7280" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={yAxisFormatter}
          />
          <Tooltip 
            formatter={(value: any) => yAxisFormatter ? yAxisFormatter(Number(value)) : value}
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
          />
          {!hideLegend && <Legend />}
          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
