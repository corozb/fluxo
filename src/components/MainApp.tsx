import { useState } from 'react';
import { POS } from '@/pages/POS';
import { Dashboard } from '@/pages/Dashboard';
import { Inventory } from '@/pages/Inventory';

export function MainApp() {
  const [currentPage, setCurrentPage] = useState<'pos' | 'dashboard' | 'inventory'>('pos');

  const handleNavigate = (page: 'pos' | 'dashboard' | 'inventory') => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-background">
      {currentPage === 'pos' && <POS onNavigate={handleNavigate} />}
      {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
      {currentPage === 'inventory' && <Inventory onNavigate={handleNavigate} />}
    </div>
  );
}