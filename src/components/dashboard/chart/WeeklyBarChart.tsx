'use client';

import { BarChart, XAxis, YAxis, Tooltip, Bar, Cell, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useTheme } from '@/context/ThemeContext';
import { ChartGradients } from './ChartGradients';
import { CustomTooltip } from './CustomTooltip';
import { GRADIENT_COLORS } from './chartConstants';
import type { ChartDataPoint } from './chartConstants';

interface WeeklyBarChartProps {
  data: ChartDataPoint[];
}

export const WeeklyBarChart = ({ data }: WeeklyBarChartProps) => {
  const { theme } = useTheme();
  const textColor = theme === 'dark' ? '#a1a1aa' : '#52525b';

  return (
    <div className="h-64 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data}
          margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
          barCategoryGap="15%"
        >
          <ChartGradients />
          
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
            strokeOpacity={0.5}
            vertical={false}
          />
          
          <XAxis 
            dataKey="date" 
            tick={{ 
              fill: textColor, 
              fontSize: 16, 
              fontWeight: 600,
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
            tickLine={{ stroke: textColor, strokeWidth: 2 }}
            axisLine={{ stroke: textColor, strokeWidth: 2 }}
            dy={10}
          />
          <YAxis 
            allowDecimals={false} 
            tick={{ 
              fill: textColor, 
              fontSize: 16, 
              fontWeight: 600,
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
            tickLine={{ stroke: textColor, strokeWidth: 2 }}
            axisLine={{ stroke: textColor, strokeWidth: 2 }}
            dx={-10}
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{
              fill: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
              radius: 8
            }}
          />
          <Bar 
            dataKey="count" 
            radius={[8, 8, 2, 2]}
            maxBarSize={60}
          >
            {data.map((entry, index) => (
              <Cell
                key={`bar-${entry.date}`}
                fill={`url(#gradient-${index % GRADIENT_COLORS.length})`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};