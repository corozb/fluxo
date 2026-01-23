import { useMemo } from 'react';
import { formatNumber } from '@/lib/utils';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Sale } from '@/stores/posStore';
import { DateRange } from './DateRangeFilter';

interface ProfitMetricsProps {
  sales: Sale[];
  dateRange: DateRange;
}

// Assuming 30% profit margin for demo purposes
const PROFIT_MARGIN = 0.30;

export function ProfitMetrics({ sales, dateRange }: ProfitMetricsProps) {
  const today = new Date();

  const profits = useMemo(() => {
    // Today
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const todaySales = sales.filter(sale => 
      isWithinInterval(new Date(sale.timestamp), { start: todayStart, end: todayEnd })
    );
    const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
    const todayProfit = todayRevenue * PROFIT_MARGIN;

    // This week
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const weekSales = sales.filter(sale => 
      isWithinInterval(new Date(sale.timestamp), { start: weekStart, end: weekEnd })
    );
    const weekRevenue = weekSales.reduce((sum, sale) => sum + sale.total, 0);
    const weekProfit = weekRevenue * PROFIT_MARGIN;

    // This month
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const monthSales = sales.filter(sale => 
      isWithinInterval(new Date(sale.timestamp), { start: monthStart, end: monthEnd })
    );
    const monthRevenue = monthSales.reduce((sum, sale) => sum + sale.total, 0);
    const monthProfit = monthRevenue * PROFIT_MARGIN;

    // Custom range
    const rangeSales = sales.filter(sale => 
      isWithinInterval(new Date(sale.timestamp), { start: dateRange.from, end: dateRange.to })
    );
    const rangeRevenue = rangeSales.reduce((sum, sale) => sum + sale.total, 0);
    const rangeProfit = rangeRevenue * PROFIT_MARGIN;

    return {
      today: { revenue: todayRevenue, profit: todayProfit },
      week: { revenue: weekRevenue, profit: weekProfit },
      month: { revenue: monthRevenue, profit: monthProfit },
      range: { revenue: rangeRevenue, profit: rangeProfit }
    };
  }, [sales, dateRange, today]);

  const ProfitDisplay = ({ revenue, profit }: { revenue: number; profit: number }) => (
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center p-4 bg-muted rounded-lg">
        <p className="text-2xl font-bold">{formatNumber(revenue, '$')}</p>
        <p className="text-sm text-muted-foreground">Ingresos</p>
      </div>
      <div className="text-center p-4 bg-primary/10 rounded-lg">
        <div className="flex items-center justify-center gap-1">
          <p className="text-2xl font-bold text-primary">{formatNumber(profit, '$')}</p>
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">Ganancia (30%)</p>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Ganancias
        </CardTitle>
        <CardDescription>Ingresos y ganancias acumuladas</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="today">Hoy</TabsTrigger>
            <TabsTrigger value="week">Semana</TabsTrigger>
            <TabsTrigger value="month">Mes</TabsTrigger>
            <TabsTrigger value="range">Rango</TabsTrigger>
          </TabsList>
          
          <TabsContent value="today" className="mt-4">
            <ProfitDisplay revenue={profits.today.revenue} profit={profits.today.profit} />
          </TabsContent>
          
          <TabsContent value="week" className="mt-4">
            <ProfitDisplay revenue={profits.week.revenue} profit={profits.week.profit} />
          </TabsContent>
          
          <TabsContent value="month" className="mt-4">
            <ProfitDisplay revenue={profits.month.revenue} profit={profits.month.profit} />
          </TabsContent>
          
          <TabsContent value="range" className="mt-4">
            <ProfitDisplay revenue={profits.range.revenue} profit={profits.range.profit} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
