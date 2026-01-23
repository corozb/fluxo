import { useMemo, useState } from 'react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronDown, CalendarIcon, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { cn } from '@/lib/utils';
import { usePOSStore } from '@/stores/posStore';

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

export function SalesByCategoryTable() {
  const { sales, products } = usePOSStore();
  const today = new Date();

  const [dateRange, setDateRange] = useState({
    from: startOfDay(today),
    to: endOfDay(today)
  });
  const [isCustomRange, setIsCustomRange] = useState(false);

  const presetRanges = [
    {
      label: 'Hoy',
      value: 'today',
      getRange: () => ({
        from: startOfDay(new Date()),
        to: endOfDay(new Date())
      })
    },
    {
      label: 'Esta semana',
      value: 'week',
      getRange: () => ({
        from: startOfWeek(new Date(), { weekStartsOn: 1 }),
        to: endOfWeek(new Date(), { weekStartsOn: 1 })
      })
    },
    {
      label: 'Este mes',
      value: 'month',
      getRange: () => ({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date())
      })
    },
    {
      label: 'Personalizado',
      value: 'custom',
      getRange: () => dateRange
    }
  ];

  const handlePresetChange = (value: string) => {
    if (value === 'custom') {
      setIsCustomRange(true);
      return;
    }
    setIsCustomRange(false);
    const preset = presetRanges.find(p => p.value === value);
    if (preset) {
      setDateRange(preset.getRange());
    }
  };

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Ventas por Categoría
          </CardTitle>
          
          <div className="flex flex-wrap items-center gap-2">
            <Select onValueChange={handlePresetChange} defaultValue="today">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                {presetRanges.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isCustomRange && (
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(dateRange.from, "dd/MM/yy", { locale: es })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => date && setDateRange({ ...dateRange, from: startOfDay(date) })}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                <span className="text-muted-foreground">-</span>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(dateRange.to, "dd/MM/yy", { locale: es })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => date && setDateRange({ ...dateRange, to: endOfDay(date) })}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        </div>
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
                        ${cat.totalRevenue.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {((cat.totalRevenue / totalRevenue) * 100).toFixed(1)}%
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
                                      ${product.revenue.toFixed(2)}
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
