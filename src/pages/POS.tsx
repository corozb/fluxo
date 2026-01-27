import { POSHeader } from '@/components/POS/POSHeader';
import { SearchBar } from '@/components/POS/SearchBar';
import { ProductGrid } from '@/components/POS/ProductGrid';
import { CartSidebar } from '@/components/POS/CartSidebar';
import { MobileCartButton } from '@/components/POS/MobileCartButton';

interface POSProps {
  onNavigate: (page: 'pos' | 'dashboard' | 'inventory') => void;
}

export function POS({ onNavigate }: POSProps) {
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <POSHeader onNavigate={onNavigate} currentPage="pos" />
      
      <div className="flex-1 flex overflow-hidden pb-16 lg:pb-0">
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-border">
            <SearchBar />
          </div>
          <div className="flex-1 overflow-auto">
            <ProductGrid />
          </div>
        </div>
        
        {/* Desktop Cart Sidebar */}
        <div className="hidden lg:block h-full">
          <CartSidebar />
        </div>
      </div>
      
      {/* Mobile Cart Button */}
      <div className="lg:hidden">
        <MobileCartButton />
      </div>
    </div>
  );
}