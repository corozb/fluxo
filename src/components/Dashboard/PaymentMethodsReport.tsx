import { useMemo } from 'react';
import { format, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { usePOSStore, Sale } from '@/stores/posStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Banknote, Smartphone, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DateRange } from './DateRangeFilter';

interface PaymentMethodsReportProps {
  dateRange: DateRange;
}

interface PaymentMethodData {
  method: 'cash' | 'card' | 'digital';
  label: string;
  icon: React.ReactNode;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
  products: { date: Date; name: string; quantity: number; revenue: number }[];
}

const paymentMethodLabels = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  digital: 'Digital'
};

const paymentMethodIcons = {
  cash: <Banknote className="h-5 w-5" />,
  card: <CreditCard className="h-5 w-5" />,
  digital: <Smartphone className="h-5 w-5" />
};

const paymentMethodColors = {
  cash: 'bg-green-500/10 text-green-600 dark:text-green-400',
  card: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  digital: 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
};

export function PaymentMethodsReport({ dateRange }: PaymentMethodsReportProps) {
  const { sales } = usePOSStore();
  
  const paymentData = useMemo(() => {
    // Filter sales by date range
    const filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.timestamp);
      return isWithinInterval(saleDate, { start: dateRange.from, end: dateRange.to });
    });

    // Group by payment method
    const methodGroups: Record<string, { sales: Sale[]; totalAmount: number }> = {
      cash: { sales: [], totalAmount: 0 },
      card: { sales: [], totalAmount: 0 },
      digital: { sales: [], totalAmount: 0 }
    };

    filteredSales.forEach(sale => {
      if (methodGroups[sale.paymentMethod]) {
        methodGroups[sale.paymentMethod].sales.push(sale);
        methodGroups[sale.paymentMethod].totalAmount += sale.total;
      }
    });

    const totalRevenue = Object.values(methodGroups).reduce((sum, group) => sum + group.totalAmount, 0);

    // Build detailed data for each payment method
    const result: PaymentMethodData[] = (['cash', 'card', 'digital'] as const).map(method => {
      const group = methodGroups[method];
      
      // List all product sales individually with their date
      const products: { date: Date; name: string; quantity: number; revenue: number }[] = [];
      
      group.sales.forEach(sale => {
        sale.items.forEach((item) => {
          products.push({
            date: new Date(sale.timestamp),
            name: item.name,
            quantity: item.quantity,
            revenue: item.subtotal
          });
        });
      });

      // Sort products by date descending (newest first)
      products.sort((a, b) => b.date.getTime() - a.date.getTime());

      return {
        method,
        label: paymentMethodLabels[method],
        icon: paymentMethodIcons[method],
        totalAmount: group.totalAmount,
        transactionCount: group.sales.length,
        percentage: totalRevenue > 0 ? (group.totalAmount / totalRevenue) * 100 : 0,
        products
      };
    });

    return result.sort((a, b) => b.totalAmount - a.totalAmount);
  }, [sales, dateRange]);

  const totalRevenue = paymentData.reduce((sum, d) => sum + d.totalAmount, 0);
  const totalTransactions = paymentData.reduce((sum, d) => sum + d.transactionCount, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            <CardTitle>Reporte por Método de Pago</CardTitle>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground">Total Recaudado</div>
            <div className="text-2xl font-bold text-primary">${totalRevenue.toFixed(2)}</div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground">Transacciones</div>
            <div className="text-2xl font-bold">{totalTransactions}</div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 col-span-2 sm:col-span-1">
            <div className="text-sm text-muted-foreground">Ticket Promedio</div>
            <div className="text-2xl font-bold">
              ${totalTransactions > 0 ? (totalRevenue / totalTransactions).toFixed(2) : '0.00'}
            </div>
          </div>
        </div>

        {/* Payment Methods Accordion */}
        {paymentData.length === 0 || totalTransactions === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay ventas en el período seleccionado
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {paymentData.map((data) => (
              <AccordionItem key={data.method} value={data.method}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", paymentMethodColors[data.method])}>
                        {data.icon}
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">{data.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {data.transactionCount} transacciones
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className="font-mono">
                        {data.percentage.toFixed(1)}%
                      </Badge>
                      <div className="text-right">
                        <div className="font-bold text-lg">${data.totalAmount.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {data.products.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No hay productos vendidos con este método
                    </div>
                  ) : (
                    <div className="rounded-md border mt-2">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Producto</TableHead>
                            <TableHead className="text-center">Cantidad</TableHead>
                            <TableHead className="text-right">Ingresos</TableHead>
                            <TableHead className="text-right">% del Método</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.products.map((product, index) => (
                            <TableRow key={`${data.method}-${product.name}-${index}`}>
                              <TableCell className="text-muted-foreground font-mono text-xs">
                                {format(product.date, 'dd/MM/yy HH:mm', { locale: es })}
                              </TableCell>
                              <TableCell className="font-medium">{product.name}</TableCell>
                              <TableCell className="text-center">{product.quantity}</TableCell>
                              <TableCell className="text-right font-mono">
                                ${product.revenue.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge variant="outline" className="font-mono">
                                  {data.totalAmount > 0 
                                    ? ((product.revenue / data.totalAmount) * 100).toFixed(1) 
                                    : 0}%
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
