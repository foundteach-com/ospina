'use client';

import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface AreaChartProps {
  data: any[];
  dataKeys: string[];
  xAxisKey: string;
  title?: string;
  colors?: string[];
  height?: number;
}

const DEFAULT_COLORS = ['#10b981', '#ef4444', '#3b82f6'];

export default function AreaChart({ 
  data, 
  dataKeys, 
  xAxisKey, 
  title, 
  colors = DEFAULT_COLORS, 
  height = 300 
}: AreaChartProps) {
  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            {dataKeys.map((key, index) => (
              <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0.1}/>
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey={xAxisKey} stroke="#6b7280" fontSize={12} />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
          />
          <Legend />
          {dataKeys.map((key, index) => (
            <Area 
              key={key}
              type="monotone" 
              dataKey={key} 
              stroke={colors[index % colors.length]} 
              fillOpacity={1} 
              fill={`url(#color${key})`} 
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
