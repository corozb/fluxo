import { useState } from 'react';
// import { useCategoriesStore } from '@/stores/categoriesStore';
import { useInventory } from '@/hooks/useInventory';
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
  // const { categories, addCategory, deleteCategory } = useCategoriesStore();
  const { categories, createCategory, deleteCategory, products } = useInventory();
  // const { products } = usePOSStore(); // Products now come from useInventory or passed in? Store has cart, hook has data.
  // Actually, useInventory returns products too.
  
  const { toast } = useToast();
  
  const [newCategory, setNewCategory] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const handleAddCategory = async () => {
    const trimmed = newCategory.trim();
    if (!trimmed) {
      toast({
        title: "Error",
        description: "El nombre de la categoría no puede estar vacío",
        variant: "destructive"
      });
      return;
    }

    // Check if category exists (case insensitive?)
    // Note: Database check is better but we can check local list from hook
    if (categories.some((c: any) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      toast({
        title: "Error",
        description: "Esta categoría ya existe",
        variant: "destructive"
      });
      return;
    }

    await createCategory(trimmed);
    // Success toast handled in hook or here? Hook has it.
    setNewCategory('');
  };

  const handleDeleteCategory = async (categoryId: string) => {
    // Check if any products use this category
    // Since we only have ID, we need to find the name to check against products (which currently use flattened name)
    // OR we should be checking against categoryId if products had it.
    // products from useInventory has flattened category name.
    
    const categoryName = categories.find((c: any) => c.id === categoryId)?.name;
    if (!categoryName) return;

    const productsUsingCategory = products.filter((p: any) => p.category === categoryName);
    if (productsUsingCategory.length > 0) {
      toast({
        title: "No se puede eliminar",
        description: `Hay ${productsUsingCategory.length} producto(s) usando esta categoría`,
        variant: "destructive"
      });
      setCategoryToDelete(null);
      return;
    }

    await deleteCategory(categoryId);
    setCategoryToDelete(null);
  };

  const getCategoryProductCount = (category: string) => {
    return products?.filter((p: any) => p?.category === category).length;
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
                categories.map((category: any) => {
                  const productCount = getCategoryProductCount(category.name);
                  return (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{category.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {productCount} producto{productCount !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCategoryToDelete(category.id)} // Store ID to delete
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
