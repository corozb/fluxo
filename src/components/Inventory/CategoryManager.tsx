import { useState } from 'react';
import { useCategoriesStore } from '@/stores/categoriesStore';
import { usePOSStore } from '@/stores/posStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Trash2, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CategoryManager({ isOpen, onClose }: CategoryManagerProps) {
  const { categories, addCategory, deleteCategory } = useCategoriesStore();
  const { products } = usePOSStore();
  const { toast } = useToast();
  
  const [newCategory, setNewCategory] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) {
      toast({
        title: "Error",
        description: "El nombre de la categoría no puede estar vacío",
        variant: "destructive"
      });
      return;
    }

    if (categories.includes(trimmed)) {
      toast({
        title: "Error",
        description: "Esta categoría ya existe",
        variant: "destructive"
      });
      return;
    }

    addCategory(trimmed);
    setNewCategory('');
    toast({
      title: "Éxito",
      description: `Categoría "${trimmed}" agregada correctamente`
    });
  };

  const handleDeleteCategory = (category: string) => {
    // Check if any products use this category
    const productsUsingCategory = products.filter(p => p.category === category);
    if (productsUsingCategory.length > 0) {
      toast({
        title: "No se puede eliminar",
        description: `Hay ${productsUsingCategory.length} producto(s) usando esta categoría`,
        variant: "destructive"
      });
      setCategoryToDelete(null);
      return;
    }

    deleteCategory(category);
    setCategoryToDelete(null);
    toast({
      title: "Éxito",
      description: `Categoría "${category}" eliminada correctamente`
    });
  };

  const getCategoryProductCount = (category: string) => {
    return products.filter(p => p.category === category).length;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Gestionar Categorías
            </DialogTitle>
            <DialogDescription>
              Agregar o eliminar categorías de productos. No puedes eliminar categorías que estén en uso.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Add new category */}
            <div className="flex gap-2">
              <Input
                placeholder="Nueva categoría..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <Button onClick={handleAddCategory} variant="pos">
                <Plus className="h-4 w-4 mr-1" />
                Agregar
              </Button>
            </div>

            {/* Category list */}
            <div className="border rounded-lg divide-y max-h-[300px] overflow-auto">
              {categories.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No hay categorías
                </div>
              ) : (
                categories.map((category) => {
                  const productCount = getCategoryProductCount(category);
                  return (
                    <div
                      key={category}
                      className="flex items-center justify-between p-3 hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{category}</span>
                        <Badge variant="secondary" className="text-xs">
                          {productCount} producto{productCount !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCategoryToDelete(category)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={productCount > 0}
                        title={productCount > 0 ? "No se puede eliminar: categoría en uso" : "Eliminar categoría"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm delete dialog */}
      <AlertDialog open={!!categoryToDelete} onOpenChange={() => setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar la categoría "{categoryToDelete}"? 
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => categoryToDelete && handleDeleteCategory(categoryToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
