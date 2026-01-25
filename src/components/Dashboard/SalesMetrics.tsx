import { useMemo } from 'react';
import { formatNumber } from '@/lib/utils';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, ShoppingCart, Calendar } from 'lucide-react';
import { Sale } from '@/stores/posStore';
import { DateRange } from './DateRangeFilter';

interface SalesMetricsProps {
  sales: Sale[];
  dateRange: DateRange;
}

export function SalesMetrics({ sales, dateRange }: SalesMetricsProps) {
  const today = new Date();

  const metrics = useMemo(() => {
    // Today's sales
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const todaySales = sales.filter(sale => 
      isWithinInterval(new Date(sale.timestamp), { start: todayStart, end: todayEnd })
    );
    const todayTotal = todaySales.reduce((sum, sale) => sum + sale.total, 0);
    const todayTransactions = todaySales.length;

    // This week's sales
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const weekSales = sales.filter(sale => 
      isWithinInterval(new Date(sale.timestamp), { start: weekStart, end: weekEnd })
    );
    const weekTotal = weekSales.reduce((sum, sale) => sum + sale.total, 0);
    const weekTransactions = weekSales.length;

    // This month's sales
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const monthSales = sales.filter(sale => 
      isWithinInterval(new Date(sale.timestamp), { start: monthStart, end: monthEnd })
    );
    const monthTotal = monthSales.reduce((sum, sale) => sum + sale.total, 0);
    const monthTransactions = monthSales.length;

    // Custom range sales
    const rangeSales = sales.filter(sale => 
      isWithinInterval(new Date(sale.timestamp), { start: dateRange.from, end: dateRange.to })
    );
    const rangeTotal = rangeSales.reduce((sum, sale) => sum + sale.total, 0);
    const rangeTransactions = rangeSales.length;

    return {
      today: { total: todayTotal, transactions: todayTransactions },
      week: { total: weekTotal, transactions: weekTransactions },
      month: { total: monthTotal, transactions: monthTransactions },
      range: { total: rangeTotal, transactions: rangeTransactions }
    };
  }, [sales, dateRange, today]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Ventas
        </CardTitle>
        <CardDescription>Resumen de ventas por período</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="today" className="text-xs sm:text-sm px-1 sm:px-3 py-1.5">Hoy</TabsTrigger>
            <TabsTrigger value="week" className="text-xs sm:text-sm px-1 sm:px-3 py-1.5">Semana</TabsTrigger>
            <TabsTrigger value="month" className="text-xs sm:text-sm px-1 sm:px-3 py-1.5">Mes</TabsTrigger>
            <TabsTrigger value="range" className="text-xs sm:text-sm px-1 sm:px-3 py-1.5">Rango</TabsTrigger>
          </TabsList>
          
          <TabsContent value="today" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div className="text-center p-2 sm:p-4 bg-muted rounded-lg">
                <p className="text-base sm:text-2xl font-bold text-primary truncate">{formatNumber(metrics.today.total, '$')}</p>
                <p className="text-xs text-muted-foreground">Total vendido</p>
              </div>
              <div className="text-center p-2 sm:p-4 bg-muted rounded-lg">
                <p className="text-base sm:text-2xl font-bold">{metrics.today.transactions}</p>
                <p className="text-xs text-muted-foreground">Transacciones</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="week" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div className="text-center p-2 sm:p-4 bg-muted rounded-lg">
                <p className="text-base sm:text-2xl font-bold text-primary truncate">{formatNumber(metrics.week.total, '$')}</p>
                <p className="text-xs text-muted-foreground">Total vendido</p>
              </div>
              <div className="text-center p-2 sm:p-4 bg-muted rounded-lg">
                <p className="text-base sm:text-2xl font-bold">{metrics.week.transactions}</p>
                <p className="text-xs text-muted-foreground">Transacciones</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="month" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div className="text-center p-2 sm:p-4 bg-muted rounded-lg">
                <p className="text-base sm:text-2xl font-bold text-primary truncate">{formatNumber(metrics.month.total, '$')}</p>
                <p className="text-xs text-muted-foreground">Total vendido</p>
              </div>
              <div className="text-center p-2 sm:p-4 bg-muted rounded-lg">
                <p className="text-base sm:text-2xl font-bold">{metrics.month.transactions}</p>
                <p className="text-xs text-muted-foreground">Transacciones</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="range" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div className="text-center p-2 sm:p-4 bg-muted rounded-lg">
                <p className="text-base sm:text-2xl font-bold text-primary truncate">{formatNumber(metrics.range.total, '$')}</p>
                <p className="text-xs text-muted-foreground">Total vendido</p>
              </div>
              <div className="text-center p-2 sm:p-4 bg-muted rounded-lg">
                <p className="text-base sm:text-2xl font-bold">{metrics.range.transactions}</p>
                <p className="text-xs text-muted-foreground">Transacciones</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
