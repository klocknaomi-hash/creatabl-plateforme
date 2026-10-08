import React from 'react';

interface AIUsageIndicatorProps {
  used: number;
  limit: number;
  size?: number;
}

const AIUsageIndicator: React.FC<AIUsageIndicatorProps> = ({ used, limit, size = 48 }) => {
  const radius = (size / 2) - 6;
  const circumference = 2 * Math.PI * radius;
  const safeUsed = Number.isFinite(used) ? used : 0;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 0;
  const progress = safeLimit ? Math.min(safeUsed / safeLimit, 1) : 0;
  const strokeDashoffset = circumference * (1 - progress);

  let color = "#8A38F5"; // Normal (Violet)
  if (progress >= 1) {
    color = "#B42318"; // Limite atteinte (erreur du design system)
  } else if (progress > 0.8) {
    color = "#8A4B00"; // Alerte (design system)
  }

  const tooltip = progress >= 1 
    ? "Limite atteinte : renouvellement le 1er du mois"
    : `${safeUsed} générations utilisées sur ${safeLimit} ce mois-ci`;

  return (
    <div 
      className="flex items-center justify-center relative flex-shrink-0" 
      title={tooltip} 
      style={{ cursor: 'default', width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={radius} 
          fill="none" stroke="#E8E6F0" strokeWidth="4"/>
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
            {safeUsed}/{safeLimit}
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
