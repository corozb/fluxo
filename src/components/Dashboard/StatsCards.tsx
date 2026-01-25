import { usePOSStore } from '@/stores/posStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, ShoppingCart, Package, TrendingUp, AlertTriangle } from 'lucide-react';
import { isWithinInterval } from 'date-fns';
import { DateRange } from './DateRangeFilter';
import { formatNumber } from '@/lib/utils';

interface StatsCardsProps {
  dateRange: DateRange;
}

export function StatsCards({ dateRange }: StatsCardsProps) {
  const { sales, products } = usePOSStore();

  // Filter sales by date range
  const periodSales = sales.filter(sale => {
    const saleDate = new Date(sale.timestamp);
    return isWithinInterval(saleDate, { start: dateRange.from, end: dateRange.to });
  });

  // Calculate metrics for the period
  const periodRevenue = periodSales.reduce((sum, sale) => sum + sale.total, 0);
  const periodTransactions = periodSales.length;

  // Calculate total revenue (all time)
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);

  // Calculate low stock items
  const lowStockItems = products.filter(product => product.stock <= product.lowStockThreshold);

  // Calculate average transaction value for the period
  const avgTransaction = periodSales.length > 0 ? periodRevenue / periodSales.length : 0;

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium truncate">Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </CardHeader>
        <CardContent>
          <div className="text-lg sm:text-2xl font-bold text-success truncate">{formatNumber(periodRevenue, '$')}</div>
          <p className="text-xs text-muted-foreground truncate">
            {periodTransactions} transactions
          </p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium truncate">Total (All Time)</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </CardHeader>
        <CardContent>
          <div className="text-lg sm:text-2xl font-bold truncate">{formatNumber(totalRevenue, '$')}</div>
          <p className="text-xs text-muted-foreground truncate">
            {sales.length} total transactions
          </p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium truncate">Avg Transaction</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </CardHeader>
        <CardContent>
          <div className="text-lg sm:text-2xl font-bold truncate">{formatNumber(avgTransaction, '$')}</div>
          <p className="text-xs text-muted-foreground truncate">
            Average for period
          </p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium truncate">Inventory Alerts</CardTitle>
          <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />
        </CardHeader>
        <CardContent>
          <div className="text-lg sm:text-2xl font-bold text-warning">{lowStockItems.length}</div>
          <p className="text-xs text-muted-foreground truncate">
            Items need restocking
          </p>
          {lowStockItems.length > 0 && (
            <Badge variant="outline" className="mt-2 text-warning border-warning text-xs">
              <Package className="h-3 w-3 mr-1" />
              Low Stock
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
}