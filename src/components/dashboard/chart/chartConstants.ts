export const MEETING_COLORS = ['#ec4899', '#f97316', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export const GRADIENT_COLORS = [
  { start: '#ec4899', end: '#be185d' }
];

export type ChartSlot = {
  start: string;
  end: string;
  group: string;
};

export type ChartDataPoint = {
  date: string;
  count: number;
  slots: ChartSlot[];
};