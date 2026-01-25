import { useState } from 'react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { DateRange as DayPickerDateRange } from 'react-day-picker';

export type DateRange = {
  from: Date;
  to: Date;
};

interface DateRangeFilterProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

type PresetValue = 'today' | 'yesterday' | 'week' | 'month' | 'last7' | 'last30' | 'custom';

const presetRanges: { label: string; value: PresetValue; getRange: () => DateRange }[] = [
  {
    label: 'Hoy',
    value: 'today',
    getRange: () => ({
      from: startOfDay(new Date()),
      to: endOfDay(new Date())
    })
  },
  {
    label: 'Ayer',
    value: 'yesterday',
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 1)),
      to: endOfDay(subDays(new Date(), 1))
    })
  },
  {
    label: 'Esta semana',
    value: 'week',
    getRange: () => ({
      from: startOfWeek(new Date(), { weekStartsOn: 1 }),
      to: endOfWeek(new Date(), { weekStartsOn: 1 })
    })
  },
  {
    label: 'Este mes',
    value: 'month',
    getRange: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date())
    })
  },
  {
    label: 'Últimos 7 días',
    value: 'last7',
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 6)),
      to: endOfDay(new Date())
    })
  },
  {
    label: 'Últimos 30 días',
    value: 'last30',
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 29)),
      to: endOfDay(new Date())
    })
  }
];

// Quick presets shown as buttons (first 3)
const quickPresets = presetRanges.slice(0, 3);

export function DateRangeFilter({ dateRange, onDateRangeChange }: DateRangeFilterProps) {
  const [selectedPreset, setSelectedPreset] = useState<PresetValue>('today');
  const [isOpen, setIsOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DayPickerDateRange | undefined>({
    from: dateRange.from,
    to: dateRange.to
  });

  const handlePresetClick = (preset: typeof presetRanges[0]) => {
    setSelectedPreset(preset.value);
    const range = preset.getRange();
    onDateRangeChange(range);
    setTempRange({ from: range.from, to: range.to });
    setIsOpen(false);
  };

  const handleCalendarSelect = (range: DayPickerDateRange | undefined) => {
    setTempRange(range);
    if (range?.from && range?.to) {
      setSelectedPreset('custom');
      onDateRangeChange({
        from: startOfDay(range.from),
        to: endOfDay(range.to)
      });
    } else if (range?.from) {
      setSelectedPreset('custom');
    }
  };

  const formatDateRange = () => {
    return `${format(dateRange.from, "dd/MM/yy", { locale: es })} - ${format(dateRange.to, "dd/MM/yy", { locale: es })}`;
  };

  const isPresetActive = (value: PresetValue) => selectedPreset === value;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Quick preset buttons - visible on desktop */}
      <div className="hidden sm:flex items-center gap-2">
        {quickPresets.map((preset) => (
          <Button
            key={preset.value}
            variant={isPresetActive(preset.value) ? "default" : "outline"}
            size="sm"
            onClick={() => handlePresetClick(preset)}
            className={cn(
              "text-sm font-medium transition-all",
              isPresetActive(preset.value) 
                ? "bg-primary text-primary-foreground shadow-md" 
                : "hover:bg-accent"
            )}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      {/* Date range popover with calendar */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "justify-start text-left font-medium min-w-[180px] gap-2",
              selectedPreset === 'custom' && "border-primary"
            )}
          >
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span>{formatDateRange()}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end" sideOffset={8}>
          <div className="p-3 border-b">
            <div className="flex flex-wrap gap-2">
              {presetRanges.map((preset) => (
                <Button
                  key={preset.value}
                  variant={isPresetActive(preset.value) ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handlePresetClick(preset)}
                  className={cn(
                    "text-sm font-medium h-8 px-3",
                    isPresetActive(preset.value) 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
          <Calendar
            mode="range"
            selected={tempRange}
            onSelect={handleCalendarSelect}
            numberOfMonths={1}
            initialFocus
            locale={es}
            className="p-3 pointer-events-auto"
            classNames={{
              day_range_middle: "bg-primary/20 text-foreground",
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              day_range_start: "bg-primary text-primary-foreground rounded-l-md",
              day_range_end: "bg-primary text-primary-foreground rounded-r-md",
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
