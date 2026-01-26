import { usePOSStore } from '@/stores/posStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Check } from 'lucide-react';

export function CategoryFilterDropdown() {
  const { products, selectedCategory, setSelectedCategory } = usePOSStore();

  // Get unique categories with product counts
  const categories = Array.from(new Set(products.map(p => p.category)));
  const categoriesWithCounts = categories.map(category => ({
    name: category,
    count: products.filter(p => p.category === category).length
  }));

  const totalProducts = products.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="min-w-[140px] justify-between">
          <span className="truncate">
            {selectedCategory === 'All' ? 'Todas las categorías' : selectedCategory}
          </span>
          <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-popover">
        <DropdownMenuItem
          onClick={() => setSelectedCategory('All')}
          className="flex items-center justify-between cursor-pointer"
        >
          <span>Todas las categorías</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">({totalProducts})</span>
            {selectedCategory === 'All' && <Check className="h-4 w-4" />}
          </div>
        </DropdownMenuItem>
        {categoriesWithCounts.map(({ name, count }) => (
          <DropdownMenuItem
            key={name}
            onClick={() => setSelectedCategory(name)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span>{name}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">({count})</span>
              {selectedCategory === name && <Check className="h-4 w-4" />}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
