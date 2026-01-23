import { useMemo } from 'react';
import { isWithinInterval } from 'date-fns';
import { Package } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { usePOSStore } from '@/stores/posStore';
import { DateRange } from './DateRangeFilter';

interface SalesByCategoryTableProps {
  dateRange: DateRange;
}

interface CategoryData {
  category: string;
  totalRevenue: number;
  totalQuantity: number;
  products: {
    name: string;
    quantity: number;
    revenue: number;
  }[];
}

export function SalesByCategoryTable({ dateRange }: SalesByCategoryTableProps) {
  const { sales, products } = usePOSStore();

  const categoryData = useMemo(() => {
    const filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.timestamp);
      return isWithinInterval(saleDate, { start: dateRange.from, end: dateRange.to });
    });

    const categoryMap = new Map<string, CategoryData>();

    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const product = products.find(p => p.id === item.id);
        const category = item.category || product?.category || 'Sin categoría';
        const productName = item.name;

        if (!categoryMap.has(category)) {
          categoryMap.set(category, {
            category,
            totalRevenue: 0,
            totalQuantity: 0,
            products: []
          });
        }

        const catData = categoryMap.get(category)!;
        catData.totalRevenue += item.price * item.quantity;
        catData.totalQuantity += item.quantity;

        const existingProduct = catData.products.find(p => p.name === productName);
        if (existingProduct) {
          existingProduct.quantity += item.quantity;
          existingProduct.revenue += item.price * item.quantity;
        } else {
          catData.products.push({
            name: productName,
            quantity: item.quantity,
            revenue: item.price * item.quantity
          });
        }
      });
    });

    // Sort categories by revenue (highest first)
    const sortedCategories = Array.from(categoryMap.values()).sort(
      (a, b) => b.totalRevenue - a.totalRevenue
    );

    // Sort products within each category by revenue
    sortedCategories.forEach(cat => {
      cat.products.sort((a, b) => b.revenue - a.revenue);
    });

    return sortedCategories;
  }, [sales, products, dateRange]);

  const totalRevenue = categoryData.reduce((sum, cat) => sum + cat.totalRevenue, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Ventas por Categoría
        </CardTitle>
      </CardHeader>
      <CardContent>
        {categoryData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay ventas en el período seleccionado
          </div>
        ) : (
          <Accordion type="multiple" className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Categoría</TableHead>
                  <TableHead className="text-center">Unidades</TableHead>
                  <TableHead className="text-right">Ingresos</TableHead>
                  <TableHead className="text-right w-[80px]">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryData.map((cat, index) => (
                  <AccordionItem key={cat.category} value={cat.category} className="border-0">
                    <TableRow className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <AccordionTrigger className="hover:no-underline py-0 w-full justify-start gap-2">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold mr-2">
                            {index + 1}
                          </span>
                          {cat.category}
                        </AccordionTrigger>
                      </TableCell>
                      <TableCell className="text-center">{cat.totalQuantity}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatNumber(cat.totalRevenue, '$')}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {totalRevenue > 0 ? ((cat.totalRevenue / totalRevenue) * 100).toFixed(1) : 0}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4} className="p-0">
                        <AccordionContent className="pb-0">
                          <div className="bg-muted/30 rounded-md mx-2 mb-2">
                            <Table>
                              <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                  <TableHead className="text-xs h-8 pl-10">Producto</TableHead>
                                  <TableHead className="text-xs h-8 text-center">Unidades</TableHead>
                                  <TableHead className="text-xs h-8 text-right pr-4">Ingresos</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {cat.products.map((product) => (
                                  <TableRow key={product.name} className="hover:bg-muted/50">
                                    <TableCell className="py-2 pl-10 text-sm">{product.name}</TableCell>
                                    <TableCell className="py-2 text-center text-sm">{product.quantity}</TableCell>
                                    <TableCell className="py-2 text-right pr-4 text-sm">
                                      {formatNumber(product.revenue, '$')}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </AccordionContent>
                      </TableCell>
                    </TableRow>
                  </AccordionItem>
                ))}
              </TableBody>
            </Table>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
