'use client';

import { GRADIENT_COLORS } from './chartConstants';

export const ChartGradients = () => {
  return (
    <defs>
      {GRADIENT_COLORS.map((gradient, index) => (
        <linearGradient 
          key={`gradient-${index}`}
          id={`gradient-${index}`} 
          x1="0%" 
          y1="0%" 
          x2="0%" 
          y2="100%"
        >
          <stop offset="0%" stopColor={gradient.start} stopOpacity={0.9} />
          <stop offset="100%" stopColor={gradient.end} stopOpacity={0.7} />
        </linearGradient>
      ))}
    </defs>
  );
};