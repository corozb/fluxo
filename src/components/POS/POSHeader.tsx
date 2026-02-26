import { usePOSStore } from '@/stores/posStore';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
import { BarChart3, Settings, LogOut, User, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { SaleDatePicker } from '@/components/POS/SaleDatePicker';

interface POSHeaderProps {
  // onNavigate removed
  // currentPage removed (using usePathname)
}

export function POSHeader() {
  const pathname = usePathname();
  const currentPage = pathname?.split('/').pop() || 'pos'; // naive check or use strict matching
  const { currentUser, logout } = usePOSStore();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="glass-header px-6 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">F</span>
          </div>
          <h1 className="text-xl font-bold text-card-foreground">Fluxo</h1>
        </div>

        <nav className="hidden lg:flex items-center space-x-1">
          <Button
            variant={pathname === '/pos' ? 'default' : 'ghost'}
            asChild
            className="text-sm"
          >
            <Link href="/pos">POS</Link>
          </Button>
          <Button
            variant={pathname === '/dashboard' ? 'default' : 'ghost'}
            asChild
            className="text-sm"
          >
            <Link href="/dashboard">
              <BarChart3 className="h-4 w-4 mr-1" />
              Dashboard
            </Link>
          </Button>
          <Button
            variant={pathname === '/inventory' ? 'default' : 'ghost'}
            asChild
            className="text-sm"
          >
            <Link href="/inventory">
              <Settings className="h-4 w-4 mr-1" />
              Inventory
            </Link>
          </Button>
        </nav>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        <div className="text-right">
          {currentPage === 'pos' && <SaleDatePicker />}
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
            <DropdownMenuItem onClick={toggleTheme}>
              {theme === 'light' ? (
                <Moon className="mr-2 h-4 w-4" />
              ) : (
                <Sun className="mr-2 h-4 w-4" />
              )}
              <span>{theme === 'light' ? 'Modo oscuro' : 'Modo claro'}</span>
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