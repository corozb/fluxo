import { usePOSStore } from '@/stores/posStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, ShoppingCart, Package, TrendingUp, AlertTriangle } from 'lucide-react';

export function StatsCards() {
  const { sales, products } = usePOSStore();

  // Calculate today's sales
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaySales = sales.filter(sale => new Date(sale.timestamp) >= today);
  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const todayTransactions = todaySales.length;

  // Calculate total revenue
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);

  // Calculate low stock items
  const lowStockItems = products.filter(product => product.stock <= product.lowStockThreshold);

  // Calculate average transaction value
  const avgTransaction = sales.length > 0 ? totalRevenue / sales.length : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">${todayRevenue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            From {todayTransactions} transactions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {sales.length} total transactions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${avgTransaction.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            Per transaction average
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inventory Alerts</CardTitle>
          <AlertTriangle className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-warning">{lowStockItems.length}</div>
          <p className="text-xs text-muted-foreground">
            Items need restocking
          </p>
          {lowStockItems.length > 0 && (
            <Badge variant="outline" className="mt-2 text-warning border-warning">
              <Package className="h-3 w-3 mr-1" />
              Low Stock
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
}