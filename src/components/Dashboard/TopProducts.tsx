import { useMemo } from 'react';
import { usePOSStore } from '@/stores/posStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { isWithinInterval } from 'date-fns';
import { DateRange } from './DateRangeFilter';
import { formatNumber } from '@/lib/utils';

interface TopProductsProps {
  dateRange: DateRange;
}

export function TopProducts({ dateRange }: TopProductsProps) {
  const { sales, products } = usePOSStore();

  const topProducts = useMemo(() => {
    // Filter sales by date range
    const filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.timestamp);
      return isWithinInterval(saleDate, { start: dateRange.from, end: dateRange.to });
    });

    // Calculate product sales data
    const productSales = new Map<string, { product: any; quantity: number; revenue: number }>();

    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const existing = productSales.get(item.id);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.subtotal;
        } else {
          productSales.set(item.id, {
            product: products.find(p => p.id === item.id) || item,
            quantity: item.quantity,
            revenue: item.subtotal
          });
        }
      });
    });

    // Sort by quantity and get top 5
    return Array.from(productSales.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [sales, products, dateRange]);

  const maxQuantity = topProducts.length > 0 ? topProducts[0].quantity : 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos Más Vendidos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {topProducts.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No hay datos de ventas</p>
        ) : (
          topProducts.map((item, index) => (
            <div key={item.product.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="text-xs">
                    #{index + 1}
                  </Badge>
                  <div>
                    <p className="font-medium text-sm">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.product.category || 'Sin categoría'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">{item.quantity} vendidos</p>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(item.revenue, '$')}
                  </p>
                </div>
              </div>
              <Progress 
                value={(item.quantity / maxQuantity) * 100} 
                className="h-2"
              />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}