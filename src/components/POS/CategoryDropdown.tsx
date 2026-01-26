import { useState } from 'react';
import { useCategoriesStore } from '@/stores/categoriesStore';
import { usePOSStore } from '@/stores/posStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Settings2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function CategoryDropdown() {
  const { categories, addCategory, deleteCategory } = useCategoriesStore();
  const { products } = usePOSStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      if (categories.includes(newCategoryName.trim())) {
        toast.error('La categoría ya existe');
        return;
      }
      addCategory(newCategoryName.trim());
      toast.success('Categoría agregada');
      setNewCategoryName('');
      setIsAddDialogOpen(false);
    }
  };

  const handleDeleteCategory = (category: string) => {
    const productsInCategory = products.filter(p => p.category === category);
    if (productsInCategory.length > 0) {
      toast.error(`No se puede eliminar. Hay ${productsInCategory.length} producto(s) en esta categoría`);
      return;
    }
    deleteCategory(category);
    toast.success('Categoría eliminada');
    setCategoryToDelete(null);
  };

  const getCategoryProductCount = (category: string) => {
    return products.filter(p => p.category === category).length;
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" title="Gestionar categorías">
            <Settings2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Gestionar Categorías</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar categoría
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <div className="max-h-48 overflow-y-auto">
            {categories.map((category) => {
              const count = getCategoryProductCount(category);
              return (
                <DropdownMenuItem
                  key={category}
                  className="flex items-center justify-between"
                  onSelect={(e) => e.preventDefault()}
                >
                  <span className="flex-1 truncate">{category}</span>
                  <span className="text-xs text-muted-foreground mx-2">({count})</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={() => setCategoryToDelete(category)}
                    disabled={count > 0}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </DropdownMenuItem>
              );
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Categoría</DialogTitle>
            <DialogDescription>
              Ingresa el nombre de la nueva categoría
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Nombre de la categoría"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddCategory}>Agregar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!categoryToDelete} onOpenChange={() => setCategoryToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Categoría</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar la categoría "{categoryToDelete}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryToDelete(null)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => categoryToDelete && handleDeleteCategory(categoryToDelete)}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
