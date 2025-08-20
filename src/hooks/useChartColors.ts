'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

export const useChartColors = () => {
  const { theme } = useTheme();
  const [chartColors, setChartColors] = useState({ text: '#6b7280' });

  useEffect(() => {
    const updateChartColors = () => {
      // Use theme-based colors that are more readable
      const textColor = theme === 'dark' ? '#a1a1aa' : '#52525b'; // zinc-400 dark, zinc-600 light
      setChartColors({ text: textColor });
    };

    updateChartColors();
    
    // Listen for theme changes
    const observer = new MutationObserver(updateChartColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, [theme]);

  return chartColors;
};