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
import { usePOSStore } from '@/stores/posStore';

interface DashboardProps {
  onNavigate: (page: 'pos' | 'dashboard' | 'inventory') => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { sales, products } = usePOSStore();
  
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date())
  });

  return (
    <div className="h-screen flex flex-col bg-background">
      <POSHeader onNavigate={onNavigate} currentPage="dashboard" />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
              <p className="text-muted-foreground">
                Resumen del rendimiento de tu tienda
              </p>
            </div>
            <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
          </div>

          <StatsCards />

          <div className="grid gap-6 md:grid-cols-3">
            <SalesMetrics sales={sales} dateRange={dateRange} />
            <TopProductsMetrics sales={sales} products={products} dateRange={dateRange} />
            <ProfitMetrics sales={sales} dateRange={dateRange} />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <SalesChart />
            <TopProducts />
          </div>
        </div>
      </div>
    </div>
  );
}