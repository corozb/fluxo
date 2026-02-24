import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getProducts, 
  getCategories, 
  createProduct,
  updateProduct,
  updateStock, 
  deleteProduct,
  createCategory,
  deleteCategory
} from "@/actions/inventory.actions";
import { createSale } from "@/actions/sales.actions";
import { useToast } from "@/hooks/use-toast";

export function useInventory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const products = await getProducts();
      // Transform Prisma product to fit UI interface if needed, or update UI interface
      // Prisma Product includes category relation object, we might need to flatten or keep as is.
      // For now, let's return as is and handle in UI.
      return products.map(p => ({
        ...p,
        price: Number(p.price), // Decimal to Number
        cost: Number(p.cost) || 0,
        stock: p.inventory?.quantity || 0,
        category: p.category.name // Flatten category name
      }));
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      // Return full category objects so we have access to ID and Name
      return await getCategories();
    },
  });

  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({ queryKey: ["categories"] }); // In case new category was used? (Not applicable here but good practice)
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to create product", variant: "destructive" });
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, productData }: { id: string; productData: FormData }) => updateProduct(id, productData),
    onSuccess: (result: any) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["products"] });
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to update product", variant: "destructive" });
    }
  });

  const updateStockMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) => updateStock(id, quantity),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["products"] });
      }
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["products"] });
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    }
  });

  const createCategoryMutation = useMutation({
    mutationFn: (name: string) => createCategory(name),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        toast({ title: "Éxito", description: "Categoría creada correctamente" });
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        toast({ title: "Éxito", description: "Categoría eliminada correctamente" });
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    }
  });

  const createSaleMutation = useMutation({
    mutationFn: createSale,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["products"] }); // Update stock
        toast({ 
          title: "Venta Exitosa", 
          description: "La venta ha sido registrada correctamente",
          className: "bg-green-600 text-white border-green-700"
        });
      } else {
        toast({ title: "Error", description: "No se pudo registrar la venta", variant: "destructive" });
      }
    }
  });

  return {
    products: productsQuery.data || [],
    isLoadingProducts: productsQuery.isLoading,
    categories: categoriesQuery.data || [],
    isLoadingCategories: categoriesQuery.isLoading,
    createProduct: createProductMutation.mutateAsync,
    updateProduct: updateProductMutation.mutateAsync,
    updateStock: updateStockMutation.mutateAsync,
    deleteProduct: deleteProductMutation.mutateAsync,
    createCategory: createCategoryMutation.mutateAsync,
    deleteCategory: deleteCategoryMutation.mutateAsync,
    createSale: createSaleMutation.mutateAsync,
  };
}
