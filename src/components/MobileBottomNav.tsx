import { useState } from 'react';
import { ShoppingCart, BarChart3, Package, ScanBarcode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarcodeScanner } from '@/components/POS/BarcodeScanner';

interface MobileBottomNavProps {
  currentPage: 'pos' | 'dashboard' | 'inventory';
  onNavigate: (page: 'pos' | 'dashboard' | 'inventory') => void;
}

export function MobileBottomNav({ currentPage, onNavigate }: MobileBottomNavProps) {
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const navItems = [
    { id: 'pos' as const, label: 'POS', icon: ShoppingCart },
    { id: 'scan' as const, label: 'Escanear', icon: ScanBarcode, action: () => setIsScannerOpen(true) },
    { id: 'dashboard' as const, label: 'Dashboard', icon: BarChart3 },
    { id: 'inventory' as const, label: 'Inventario', icon: Package },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border lg:hidden">
        <div className="flex items-center justify-around h-16 px-1">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={item.id !== 'scan' && currentPage === item.id ? 'default' : 'ghost'}
              onClick={() => item.action ? item.action() : onNavigate(item.id as 'pos' | 'dashboard' | 'inventory')}
              className="flex-1 flex flex-col items-center justify-center h-14 gap-0.5 mx-0.5 px-1"
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px]">{item.label}</span>
            </Button>
          ))}
        </div>
      </nav>

      <BarcodeScanner 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
      />
    </>
  );
}
