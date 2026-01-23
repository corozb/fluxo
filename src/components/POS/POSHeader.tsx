import { usePOSStore } from '@/stores/posStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BarChart3, Settings, LogOut, User } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

interface POSHeaderProps {
  onNavigate: (page: 'pos' | 'dashboard' | 'inventory') => void;
  currentPage: string;
}

export function POSHeader({ onNavigate, currentPage }: POSHeaderProps) {
  const { currentUser, logout } = usePOSStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="border-b border-border bg-pos-header px-6 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">P</span>
          </div>
          <h1 className="text-xl font-bold text-card-foreground">ProPOS</h1>
        </div>

        <nav className="hidden lg:flex items-center space-x-1">
          <Button
            variant={currentPage === 'pos' ? 'default' : 'ghost'}
            onClick={() => onNavigate('pos')}
            className="text-sm"
          >
            POS
          </Button>
          <Button
            variant={currentPage === 'dashboard' ? 'default' : 'ghost'}
            onClick={() => onNavigate('dashboard')}
            className="text-sm"
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            Dashboard
          </Button>
          <Button
            variant={currentPage === 'inventory' ? 'default' : 'ghost'}
            onClick={() => onNavigate('inventory')}
            className="text-sm"
          >
            <Settings className="h-4 w-4 mr-1" />
            Inventory
          </Button>
        </nav>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        <ThemeToggle />
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-card-foreground">
            {new Date().toLocaleDateString()}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date().toLocaleTimeString()}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {currentUser?.name.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium">{currentUser?.name}</p>
                <Badge variant="outline" className="text-xs">
                  {currentUser?.role}
                </Badge>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}