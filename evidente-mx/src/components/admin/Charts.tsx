'use client';

interface BarChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}

export function SimpleBarChart({ data, color = '#1e3a8a', height = 200 }: BarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const barWidth = 100 / data.length;

  return (
    <div className="w-full" style={{ height }}>
      <svg width="100%" height="100%" className="overflow-visible">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((percent) => (
          <g key={percent}>
            <line
              x1="0"
              y1={`${100 - percent}%`}
              x2="100%"
              y2={`${100 - percent}%`}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
            <text
              x="-5"
              y={`${100 - percent}%`}
              fill="#9ca3af"
              fontSize="10"
              textAnchor="end"
              dominantBaseline="middle"
            >
              {Math.round((percent / 100) * maxValue)}
            </text>
          </g>
        ))}
        
        {/* Bars */}
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * 100;
          const x = index * barWidth + barWidth * 0.1;
          const width = barWidth * 0.8;
          
          return (
            <g key={item.label}>
              <rect
                x={`${x}%`}
                y={`${100 - barHeight}%`}
                width={`${width}%`}
                height={`${barHeight}%`}
                fill={color}
                rx="4"
                className="transition-all duration-300 hover:opacity-80"
              />
              <text
                x={`${x + width / 2}%`}
                y="100%"
                dy="15"
                fill="#6b7280"
                fontSize="11"
                textAnchor="middle"
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

interface LineChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}

export function SimpleLineChart({ data, color = '#1e3a8a', height = 200 }: LineChartProps) {
  if (data.length === 0) return null;
  
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - (item.value / maxValue) * 100;
    return { x, y, ...item };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const areaD = `${pathD} L ${points[points.length - 1].x} 100 L 0 100 Z`;

  return (
    <div className="w-full" style={{ height }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="overflow-visible">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((percent) => (
          <line
            key={percent}
            x1="0"
            y1={100 - percent}
            x2="100"
            y2={100 - percent}
            stroke="#e5e7eb"
            strokeWidth="0.5"
          />
        ))}
        
        {/* Area */}
        <path
          d={areaD}
          fill={`${color}20`}
        />
        
        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        
        {/* Points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="white"
            stroke={color}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            className="transition-all duration-300 hover:r-6"
          />
        ))}
      </svg>
      
      {/* Labels */}
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        {data.map((item, index) => (
          <span key={index}>{item.label}</span>
        ))}
      </div>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
}

export function StatsCard({ title, value, change, icon, color }: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
        {change !== undefined && (
          <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{title}</p>
    </div>
  );
}
