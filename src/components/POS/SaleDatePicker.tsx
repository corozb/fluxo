import { usePOSStore } from '@/stores/posStore';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function SaleDatePicker() {
  const { saleDate, setSaleDate } = usePOSStore();
  
  // Ensure we have a valid date object
  const dateToUse = saleDate ? new Date(saleDate) : new Date();
  const isDateToday = isToday(dateToUse);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !saleDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {isDateToday ? "TODAY" : format(dateToUse, "PPP", { locale: es })}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateToUse}
          onSelect={(date) => date && setSaleDate(date)}
          disabled={(date) => date > new Date()}
          initialFocus
          locale={es}
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}
