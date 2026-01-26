import { useState } from 'react';
import { usePOSStore } from '@/stores/posStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, ScanBarcode } from 'lucide-react';
import { BarcodeScanner } from './BarcodeScanner';
import { CategoryDropdown } from './CategoryDropdown';
import { CategoryFilterDropdown } from './CategoryFilterDropdown';

export function SearchBar() {
  const { searchQuery, setSearchQuery } = usePOSStore();
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  return (
    <div className="bg-pos-header">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nombre o código de barras..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsScannerOpen(true)}
          title="Escanear código de barras"
        >
          <ScanBarcode className="h-4 w-4" />
        </Button>
        <CategoryFilterDropdown />
        <CategoryDropdown />
      </div>

      <BarcodeScanner 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
      />
    </div>
  );
}