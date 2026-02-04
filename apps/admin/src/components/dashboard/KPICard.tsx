'use client';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red';
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
    icon: 'text-blue-500',
  },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200',
    icon: 'text-green-500',
  },
  orange: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-200',
    icon: 'text-orange-500',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200',
    icon: 'text-purple-500',
  },
  red: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200',
    icon: 'text-red-500',
  },
};

export default function KPICard({ title, value, change, changeLabel, icon, color = 'blue' }: KPICardProps) {
  const colors = colorClasses[color];
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className={`${colors.bg} border ${colors.border} p-6 rounded-2xl relative overflow-hidden group hover:shadow-lg transition-all`}>
      {icon && (
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <div className={`${colors.icon} w-20 h-20`}>
            {icon}
          </div>
        </div>
      )}
      <h3 className="text-gray-600 font-medium mb-2 text-sm">{title}</h3>
      <p className={`text-4xl font-bold ${colors.text} mb-2`}>{value}</p>
      {change !== undefined && (
        <div className={`flex items-center text-sm gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={isPositive ? '' : 'rotate-180'}
          >
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
            <polyline points="17 6 23 6 23 12"/>
          </svg>
          <span>{isPositive ? '+' : ''}{change}% {changeLabel || 'vs anterior'}</span>
        </div>
      )}
    </div>
  );
}
