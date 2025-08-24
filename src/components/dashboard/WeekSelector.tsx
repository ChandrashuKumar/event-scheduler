'use client';

import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

export type WeekOption = 'this-week' | 'next-week';

interface WeekSelectorProps {
  value: WeekOption;
  onValueChange: (value: WeekOption) => void;
}

const WeekSelector = ({ value, onValueChange }: WeekSelectorProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger 
        size="sm" 
        className="text-sm font-semibold text-purple-700  dark:text-foreground dark:bg-muted dark:hover:bg-muted/80 border-0 shadow-none bg-blue-100 px-3 py-1.5 h-auto rounded-full min-w-0"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="this-week">This Week</SelectItem>
        <SelectItem value="next-week">Next Week</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default WeekSelector;