import { useState, useMemo } from "react";
import { formatNumber } from "@/lib/utils";
import { usePOSStore } from "@/stores/posStore";
// import { useCategoriesStore } from "@/stores/categoriesStore"; // Deprecated
import { useInventory } from "@/hooks/useInventory";
import { POSHeader } from "@/components/POS/POSHeader";
import { ProductForm } from "@/components/Inventory/ProductForm";
import { CategoryManager } from "@/components/Inventory/CategoryManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BarcodeScanner } from "@/components/POS/BarcodeScanner";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Search, MoreHorizontal, Edit, Trash2, AlertTriangle, Tag, X, ScanBarcode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Interface removed or empty
export function Inventory() {
  const { addToCart, currentUser } = usePOSStore();
  const { 
    products, 
    isLoadingProducts, 
    deleteProduct, 
    categories 
  } = useInventory();
  
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const isAdmin = currentUser?.role === "admin";

  // Calculate product counts per category
  const categoryProductCounts = useMemo(() => {
    const counts: Record<string, number> = { All: products.length };
    products.forEach((product) => {
      counts[product.category] = (counts[product.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Get categories with their counts (only categories with products)
  const categoriesWithCounts = useMemo(() => {
    // Combine existing categories from DB with "All"
    // We use the categories from useInventory (which fetches from DB)
    // plus any categories that come from products directly to be safe
    // Fix: categories from useInventory are objects now {id, name}, map to name
    const categoryNames = categories.map((c: any) => c.name);
    const uniqueCategories = Array.from(new Set([...categoryNames, ...products.map(p => p.category)]));
    
    const categoriesWithProducts = uniqueCategories.filter((category) => (categoryProductCounts[category] || 0) > 0);
    return [
      { name: "All", count: products.length },
      ...categoriesWithProducts.map((category) => ({
        name: category,
        count: categoryProductCounts[category] || 0,
      })),
    ];
  }, [categories, categoryProductCounts, products.length]);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((product) => product.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          (product.barcode && product.barcode.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [products, selectedCategory, searchQuery]);

  const lowStockProducts = products.filter((p) => p.stock <= p.lowStockThreshold);

  const totalInventoryCost = useMemo(
    () => filteredProducts.reduce((acc, p) => acc + (p.cost ? p.cost * p.stock : 0), 0),
    [filteredProducts]
  );

  const costByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filteredProducts.forEach((p) => {
      if (p.cost) {
        map[p.category] = (map[p.category] || 0) + p.cost * p.stock;
      }
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredProducts]);

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = async (product: any) => {
    if (confirm(`¿Estás seguro de eliminar ${product.name}?`)) {
      await deleteProduct(product.id);
      toast({
        title: "Éxito",
        description: `${product.name} ha sido eliminado`,
      });
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };


  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <POSHeader />

      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Gestión de Inventario</h2>
            <p className="text-muted-foreground">Administra tus productos y niveles de stock</p>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Button onClick={() => setIsCategoryManagerOpen(true)} variant="outline">
                <Tag className="h-4 w-4 mr-2" />
                Categorías
              </Button>
            )}
            <Button onClick={() => setIsFormOpen(true)} variant="pos" size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Producto
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 "
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-mute d-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
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
        </div>

        {/* Category filter tabs */}
        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent touch-pan-x cursor-grab active:cursor-grabbing">
          <div className="flex space-x-2 pb-2 min-w-min">
            {categoriesWithCounts.map(({ name, count }) => (
              <Badge
                key={name}
                variant={selectedCategory === name ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap px-3 py-1.5 text-sm flex-shrink-0"
                onClick={() => setSelectedCategory(name)}
              >
                {name === "All" ? "Todos" : name}
                <span className="ml-1.5 rounded-full bg-background/20 px-1.5 py-0.5 text-xs">{count}</span>
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 pb-24 lg:pb-6">
        <div className="space-y-6">
          {isAdmin && (() => {
            const CATEGORY_COLORS = [
              "text-blue-500",
              "text-violet-500",
              "text-emerald-500",
              "text-amber-500",
              "text-rose-500",
              "text-cyan-500",
              "text-orange-500",
              "text-teal-500",
            ];
            return (
              <Card>
                <CardContent className="p-0 px-4">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="cost-detail" className="border-b-0">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-2">
                          <span className="text-sm text-muted-foreground">Costo Total en Inventario</span>
                          <span className="text-2xl font-bold">{formatNumber(totalInventoryCost, "$")}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2.5 pb-2">
                          {costByCategory.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Sin datos de costo disponibles.</p>
                          ) : (
                            costByCategory.map(([category, total], idx) => (
                              <div key={category} className="flex items-baseline gap-2">
                                <span className={`text-sm font-semibold shrink-0 ${CATEGORY_COLORS[idx % CATEGORY_COLORS.length]}`}>
                                  {category}
                                </span>
                                <span className="flex-1 border-b border-dashed border-muted-foreground/40 mb-0.5" />
                                <span className="text-base font-semibold shrink-0">{formatNumber(total, "$")}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            );
          })()}

          {lowStockProducts.length > 0 && (
            <Card className="">
              <CardHeader>
                <CardTitle className="flex items-center text-warning">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Alerta de Stock Bajo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">Los siguientes productos tienen stock bajo:</p>
                <div className="flex flex-wrap gap-2">
                  {lowStockProducts.map((product) => (
                    <Badge key={product.id} variant="outline" className="border-warning text-warning">
                      {product.name} ({product.stock} restantes)
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    {isAdmin && <TableHead>Costo</TableHead>}
                    <TableHead>Precio</TableHead>
                    <TableHead>Margen</TableHead>
                    <TableHead>Stock</TableHead>
                    {isAdmin && <TableHead>Costo Total</TableHead>}
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const margin = product.cost
                      ? (((product.price - product.cost) / product.price) * 100).toFixed(1)
                      : null;

                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            {product.barcode && <p className="text-xs text-muted-foreground">{product.barcode}</p>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        {isAdmin && (
                          <TableCell className="text-muted-foreground">
                            {product.cost ? formatNumber(product.cost, "$") : "-"}
                          </TableCell>
                        )}
                        <TableCell className="font-medium">{formatNumber(product.price, "$")}</TableCell>
                        <TableCell>
                          {margin ? (
                            <Badge variant={parseFloat(margin) >= 30 ? "secondary" : "outline"}>{margin}%</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span>{product.stock}</span>
                            {product.stock <= product.lowStockThreshold && (
                              <AlertTriangle className="h-4 w-4 text-warning" />
                            )}
                          </div>
                        </TableCell>
                        {isAdmin && (
                          <TableCell className="font-medium">
                            {product.cost
                              ? formatNumber(product.cost * product.stock, "$")
                              : "-"}
                          </TableCell>
                        )}
                        <TableCell>
                          <Badge variant={product.stock > product.lowStockThreshold ? "secondary" : "destructive"}>
                            {product.stock > product.lowStockThreshold ? "En Stock" : "Stock Bajo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteProduct(product)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      <ProductForm isOpen={isFormOpen} onClose={handleCloseForm} product={editingProduct} />

      {isAdmin && <CategoryManager isOpen={isCategoryManagerOpen} onClose={() => setIsCategoryManagerOpen(false)} />}

      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanResult={(barcode) => {
          setSearchQuery(barcode);
          setIsScannerOpen(false);
        }}
      />
    </div>
  );
}
