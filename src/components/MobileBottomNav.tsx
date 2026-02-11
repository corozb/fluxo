"use client";

import { useState } from 'react';
import { ShoppingCart, BarChart3, Package, ScanBarcode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarcodeScanner } from '@/components/POS/BarcodeScanner';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function MobileBottomNav() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { id: 'pos', label: 'POS', icon: ShoppingCart, href: '/pos' },
    { id: 'scan', label: 'Escanear', icon: ScanBarcode, action: () => setIsScannerOpen(true) },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '/dashboard' },
    { id: 'inventory', label: 'Inventario', icon: Package, href: '/inventory' },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border lg:hidden">
        <div className="flex items-center justify-around h-16 px-1">
          {navItems.map((item) => {
            const isActive = item.href ? pathname === item.href : false;
            
            if (item.action) {
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={item.action}
                  className="flex-1 flex flex-col items-center justify-center h-14 gap-0.5 mx-0.5 px-1"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-[10px]">{item.label}</span>
                </Button>
              );
            }

            return (
              <Button
                key={item.id}
                asChild
                variant={isActive ? 'default' : 'ghost'}
                className="flex-1 flex flex-col items-center justify-center h-14 gap-0.5 mx-0.5 px-1"
              >
                <Link href={item.href!}>
                  <item.icon className="h-5 w-5" />
                  <span className="text-[10px]">{item.label}</span>
                </Link>
              </Button>
            );
          })}
        </div>
      </nav>

      <BarcodeScanner 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
      />
    </>
  );
}
