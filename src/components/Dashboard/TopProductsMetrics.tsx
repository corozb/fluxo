import { useMemo } from 'react';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Package, TrendingUp, Award } from 'lucide-react';
import { Sale, Product } from '@/stores/posStore';
import { DateRange } from './DateRangeFilter';

interface TopProductsMetricsProps {
  sales: Sale[];
  products: Product[];
  dateRange: DateRange;
}

interface ProductSalesData {
  product: Product;
  quantity: number;
  revenue: number;
}

function getTopProduct(sales: Sale[], products: Product[]): ProductSalesData | null {
  const productSales = new Map<string, ProductSalesData>();

  sales.forEach(sale => {
    sale.items.forEach(item => {
      const existing = productSales.get(item.id);
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += item.subtotal;
      } else {
        const product = products.find(p => p.id === item.id);
        if (product) {
          productSales.set(item.id, {
            product,
            quantity: item.quantity,
            revenue: item.subtotal
          });
        }
      }
    });
  });

  const sorted = Array.from(productSales.values()).sort((a, b) => b.quantity - a.quantity);
  return sorted.length > 0 ? sorted[0] : null;
}

function TopProductCard({ data, label }: { data: ProductSalesData | null; label: string }) {
  if (!data) {
    return (
      <div className="text-center p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">Sin ventas {label.toLowerCase()}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-muted rounded-lg space-y-2">
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="flex items-center gap-1">
          <Award className="h-3 w-3" />
          #1
        </Badge>
        <Badge variant="outline">{data.product.category}</Badge>
      </div>
      <p className="font-semibold text-lg">{data.product.name}</p>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{data.quantity} unidades</span>
        <span className="font-medium text-primary">${data.revenue.toFixed(2)}</span>
      </div>
    </div>
  );
}

export function TopProductsMetrics({ sales, products, dateRange }: TopProductsMetricsProps) {
  const today = new Date();

  const topProducts = useMemo(() => {
    // Today
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const todaySales = sales.filter(sale => 
      isWithinInterval(new Date(sale.timestamp), { start: todayStart, end: todayEnd })
    );
    const todayTop = getTopProduct(todaySales, products);

    // This week
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const weekSales = sales.filter(sale => 
      isWithinInterval(new Date(sale.timestamp), { start: weekStart, end: weekEnd })
    );
    const weekTop = getTopProduct(weekSales, products);

    // This month
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const monthSales = sales.filter(sale => 
      isWithinInterval(new Date(sale.timestamp), { start: monthStart, end: monthEnd })
    );
    const monthTop = getTopProduct(monthSales, products);

    // Custom range
    const rangeSales = sales.filter(sale => 
      isWithinInterval(new Date(sale.timestamp), { start: dateRange.from, end: dateRange.to })
    );
    const rangeTop = getTopProduct(rangeSales, products);

    return {
      today: todayTop,
      week: weekTop,
      month: monthTop,
      range: rangeTop
    };
  }, [sales, products, dateRange, today]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Producto Más Vendido
        </CardTitle>
        <CardDescription>El producto estrella por período</CardDescription>
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
            <TopProductCard data={topProducts.today} label="hoy" />
          </TabsContent>
          
          <TabsContent value="week" className="mt-4">
            <TopProductCard data={topProducts.week} label="esta semana" />
          </TabsContent>
          
          <TabsContent value="month" className="mt-4">
            <TopProductCard data={topProducts.month} label="este mes" />
          </TabsContent>
          
          <TabsContent value="range" className="mt-4">
            <TopProductCard data={topProducts.range} label="en este rango" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
