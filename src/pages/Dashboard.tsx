import { POSHeader } from '@/components/POS/POSHeader';
import { StatsCards } from '@/components/Dashboard/StatsCards';
import { SalesChart } from '@/components/Dashboard/SalesChart';
import { TopProducts } from '@/components/Dashboard/TopProducts';

interface DashboardProps {
  onNavigate: (page: 'pos' | 'dashboard' | 'inventory') => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <div className="h-screen flex flex-col bg-background">
      <POSHeader onNavigate={onNavigate} currentPage="dashboard" />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">
              Overview of your store's performance and analytics
            </p>
          </div>

          <StatsCards />

          <div className="grid gap-6 md:grid-cols-2">
            <SalesChart />
            <TopProducts />
          </div>
        </div>
      </div>
    </div>
  );
}