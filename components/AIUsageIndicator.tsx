import React from 'react';

interface AIUsageIndicatorProps {
  used: number;
  limit: number;
  size?: number;
}

const AIUsageIndicator: React.FC<AIUsageIndicatorProps> = ({ used, limit, size = 48 }) => {
  const radius = (size / 2) - 6;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(used / limit, 1);
  const strokeDashoffset = circumference * (1 - progress);

  let color = "#7F77DD"; // Normal (Violet)
  if (progress >= 1) {
    color = "#D85A30"; // Limit reached (Red/Orange-ish)
  } else if (progress > 0.8) {
    color = "#EF9F27"; // Warning (Orange)
  }

  const tooltip = progress >= 1 
    ? "Limit reached — renews on the 1st of the month" 
    : `${used} generations used out of ${limit} this month`;

  return (
    <div 
      className="flex items-center justify-center relative flex-shrink-0" 
      title={tooltip} 
      style={{ cursor: 'default', width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={radius} 
          fill="none" stroke="#E5E7EB" strokeWidth="4"/>
        <circle cx={size/2} cy={size/2} r={radius}
          fill="none" 
          stroke={color}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
        {progress < 1 ? (
          <text x={size/2} y={(size/2) + 4} textAnchor="middle" 
            fontSize={size > 60 ? "14" : "10"} fontWeight="600" fill={color}>
            {used}/{limit}
          </text>
        ) : (
          <text x={size/2} y={(size/2) + 4} textAnchor="middle" 
            fontSize={size > 60 ? "12" : "8"} fontWeight="700" fill={color}>
            LIMIT
          </text>
        )}
      </svg>
    </div>
  );
};

export default AIUsageIndicator;
