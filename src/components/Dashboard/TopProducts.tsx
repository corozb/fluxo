import { usePOSStore } from '@/stores/posStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export function TopProducts() {
  const { sales, products } = usePOSStore();

  // Calculate product sales data
  const productSales = new Map<string, { product: any; quantity: number; revenue: number }>();

  sales.forEach(sale => {
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
  const topProducts = Array.from(productSales.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const maxQuantity = topProducts.length > 0 ? topProducts[0].quantity : 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Selling Products</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {topProducts.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No sales data available</p>
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
                      {item.product.category}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">{item.quantity} sold</p>
                  <p className="text-xs text-muted-foreground">
                    ${item.revenue.toFixed(2)}
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