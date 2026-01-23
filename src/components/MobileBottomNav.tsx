import { ShoppingCart, BarChart3, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileBottomNavProps {
  currentPage: 'pos' | 'dashboard' | 'inventory';
  onNavigate: (page: 'pos' | 'dashboard' | 'inventory') => void;
}

export function MobileBottomNav({ currentPage, onNavigate }: MobileBottomNavProps) {
  const navItems = [
    { id: 'pos' as const, label: 'POS', icon: ShoppingCart },
    { id: 'dashboard' as const, label: 'Dashboard', icon: BarChart3 },
    { id: 'inventory' as const, label: 'Inventario', icon: Package },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant={currentPage === item.id ? 'default' : 'ghost'}
            onClick={() => onNavigate(item.id)}
            className="flex-1 flex flex-col items-center justify-center h-14 gap-1 mx-1"
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs">{item.label}</span>
          </Button>
        ))}
      </div>
    </nav>
  );
}
