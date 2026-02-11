import { useState } from 'react';
import { startOfDay, endOfDay } from 'date-fns';
import { POSHeader } from '@/components/POS/POSHeader';
import { StatsCards } from '@/components/Dashboard/StatsCards';
import { SalesChart } from '@/components/Dashboard/SalesChart';
import { TopProducts } from '@/components/Dashboard/TopProducts';
import { DateRangeFilter, DateRange } from '@/components/Dashboard/DateRangeFilter';
import { SalesMetrics } from '@/components/Dashboard/SalesMetrics';
import { TopProductsMetrics } from '@/components/Dashboard/TopProductsMetrics';
import { ProfitMetrics } from '@/components/Dashboard/ProfitMetrics';
import { SalesByCategoryTable } from '@/components/Dashboard/SalesByCategoryTable';
import { PaymentMethodsReport } from '@/components/Dashboard/PaymentMethodsReport';
import { usePOSStore } from '@/stores/posStore';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent 
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  rectSortingStrategy 
} from '@dnd-kit/sortable';
import { useDashboardStore } from '@/stores/dashboardStore';
import { SortableWidget } from '@/components/Dashboard/SortableWidget';
import { DashboardControls } from '@/components/Dashboard/DashboardControls';

// Interface removed or empty
export function Dashboard() {
  const { sales, products } = usePOSStore();
  const { layout, updateLayout, isEditMode, hiddenWidgets } = useDashboardStore();
  
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date())
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Prevent accidental drags when clicking
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = layout.indexOf(active.id as string);
      const newIndex = layout.indexOf(over.id as string);
      updateLayout(arrayMove(layout, oldIndex, newIndex));
    }
  };

  const widgetComponents: Record<string, React.ReactNode> = {
    'stats-cards': <StatsCards dateRange={dateRange} />,
    'sales-metrics': <SalesMetrics sales={sales} dateRange={dateRange} />,
    'top-products-metrics': <TopProductsMetrics sales={sales} products={products} dateRange={dateRange} />,
    'profit-metrics': <ProfitMetrics sales={sales} dateRange={dateRange} />,
    'sales-by-category': <SalesByCategoryTable dateRange={dateRange} />,
    'payment-methods': <PaymentMethodsReport dateRange={dateRange} />,
    'sales-chart': <SalesChart dateRange={dateRange} />,
    'top-products-list': <TopProducts dateRange={dateRange} />,
  };

  const widgetSpans: Record<string, string> = {
    'stats-cards': 'col-span-1 md:col-span-6',
    'sales-metrics': 'col-span-1 md:col-span-2',
    'top-products-metrics': 'col-span-1 md:col-span-2',
    'profit-metrics': 'col-span-1 md:col-span-2',
    'sales-by-category': 'col-span-1 md:col-span-6',
    'payment-methods': 'col-span-1 md:col-span-6',
    'sales-chart': 'col-span-1 md:col-span-3',
    'top-products-list': 'col-span-1 md:col-span-3',
  };

  const visibleLayout = layout.filter(id => !hiddenWidgets.includes(id));

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <POSHeader />
      
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-xl sm:text-3xl font-bold tracking-tight truncate">Dashboard</h2>
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <p className="text-xs sm:text-base truncate">Resumen del rendimiento de tu tienda</p>
                <DashboardControls />
              </div>
            </div>
            <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-6 pb-24 lg:pb-6">
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter} 
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={visibleLayout} 
            strategy={rectSortingStrategy}
            disabled={!isEditMode}
          >
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              {visibleLayout.map((id) => (
                <SortableWidget 
                  key={id} 
                  id={id} 
                  isEditMode={isEditMode}
                  className={widgetSpans[id]}
                >
                  {widgetComponents[id]}
                </SortableWidget>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}