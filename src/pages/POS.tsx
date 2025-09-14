import { POSHeader } from '@/components/POS/POSHeader';
import { SearchBar } from '@/components/POS/SearchBar';
import { ProductGrid } from '@/components/POS/ProductGrid';
import { CartSidebar } from '@/components/POS/CartSidebar';

interface POSProps {
  onNavigate: (page: 'pos' | 'dashboard' | 'inventory') => void;
}

export function POS({ onNavigate }: POSProps) {
  return (
    <div className="h-screen flex flex-col bg-background">
      <POSHeader onNavigate={onNavigate} currentPage="pos" />
      
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
          <SearchBar />
          <div className="flex-1 overflow-auto">
            <ProductGrid />
          </div>
        </div>
        
        <CartSidebar />
      </div>
    </div>
  );
}