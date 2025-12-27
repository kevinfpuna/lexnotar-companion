import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type PeriodOption = '7d' | '30d' | '3m' | '6m' | '1y' | 'all';

interface PeriodFilterProps {
  value: PeriodOption;
  onChange: (period: PeriodOption) => void;
  className?: string;
}

const options: { value: PeriodOption; label: string }[] = [
  { value: '7d', label: '7 días' },
  { value: '30d', label: '30 días' },
  { value: '3m', label: '3 meses' },
  { value: '6m', label: '6 meses' },
  { value: '1y', label: '1 año' },
  { value: 'all', label: 'Todo' },
];

export function PeriodFilter({ value, onChange, className }: PeriodFilterProps) {
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {options.map((option) => (
        <Button
          key={option.value}
          variant={value === option.value ? "default" : "ghost"}
          size="sm"
          className={cn(
            "h-7 px-2.5 text-xs",
            value === option.value && "pointer-events-none"
          )}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

export function getDateRangeFromPeriod(period: PeriodOption): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case '7d':
      start.setDate(start.getDate() - 7);
      break;
    case '30d':
      start.setDate(start.getDate() - 30);
      break;
    case '3m':
      start.setMonth(start.getMonth() - 3);
      break;
    case '6m':
      start.setMonth(start.getMonth() - 6);
      break;
    case '1y':
      start.setFullYear(start.getFullYear() - 1);
      break;
    case 'all':
      start.setFullYear(2020, 0, 1); // Far back date
      break;
  }

  return { start, end };
}
