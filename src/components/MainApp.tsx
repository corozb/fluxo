import { useState, useEffect } from 'react';
import { POS } from '@/pages/POS';
import { Dashboard } from '@/pages/Dashboard';
import { Inventory } from '@/pages/Inventory';
import { Login } from '@/pages/Login';
import { usePOSStore } from '@/stores/posStore';

export function MainApp() {
  const [currentPage, setCurrentPage] = useState<'pos' | 'dashboard' | 'inventory'>('pos');
  const { currentUser } = usePOSStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in from persisted state
    if (currentUser) {
      setIsAuthenticated(true);
    }
  }, [currentUser]);

  const handleNavigate = (page: 'pos' | 'dashboard' | 'inventory') => {
    setCurrentPage(page);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {currentPage === 'pos' && <POS onNavigate={handleNavigate} />}
      {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
      {currentPage === 'inventory' && <Inventory onNavigate={handleNavigate} />}
    </div>
  );
}