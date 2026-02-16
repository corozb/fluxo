import { useState, useEffect } from "react";
import { usePOSStore, Product } from "@/stores/posStore";
import { useCategoriesStore } from "@/stores/categoriesStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ScanBarcode } from "lucide-react";
import { BarcodeScanner } from "../POS/BarcodeScanner";

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

interface FormErrors {
  name?: boolean;
  price?: boolean;
  category?: boolean;
  stock?: boolean;
}

export function ProductForm({ isOpen, onClose, product }: ProductFormProps) {
  const { addProduct, updateProduct } = usePOSStore();
  const { categories } = useCategoriesStore();
  const { toast } = useToast();
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    cost: "",
    category: "",
    stock: "",
    lowStockThreshold: "10",
    description: "",
    barcode: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        price: product.price?.toString() || "",
        cost: product.cost?.toString() || "",
        category: product.category || "",
        stock: product.stock?.toString() || "",
        lowStockThreshold: product.lowStockThreshold?.toString() || "10",
        description: product.description || "",
        barcode: product.barcode || "",
      });
    } else {
      setFormData({
        name: "",
        price: "",
        cost: "",
        category: "",
        stock: "",
        lowStockThreshold: "10",
        description: "",
        barcode: "",
      });
    }
    setErrors({});
    setTouched({});
  }, [product, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = true;
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = true;
    if (!formData.category) newErrors.category = true;
    if (!formData.stock || parseInt(formData.stock) < 0) newErrors.stock = true;

    setErrors(newErrors);
    setTouched({ name: true, price: true, category: true, stock: true });

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      cost: formData.cost ? parseFloat(formData.cost) : undefined,
      category: formData.category,
      stock: parseInt(formData.stock),
      lowStockThreshold: parseInt(formData.lowStockThreshold),
      description: formData.description,
      barcode: formData.barcode,
    };

    if (product) {
      updateProduct(product.id, productData);
      toast({
        title: "Éxito",
        description: "Producto actualizado correctamente",
      });
    } else {
      addProduct(productData);
      toast({
        title: "Éxito",
        description: "Producto agregado correctamente",
      });
    }

    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      // Clear error when user starts typing
      setErrors((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    // Validate on blur
    if (field === "name" && !formData.name.trim()) {
      setErrors((prev) => ({ ...prev, name: true }));
    } else if (field === "price" && (!formData.price || parseFloat(formData.price) <= 0)) {
      setErrors((prev) => ({ ...prev, price: true }));
    } else if (field === "category" && !formData.category) {
      setErrors((prev) => ({ ...prev, category: true }));
    } else if (field === "stock" && (!formData.stock || parseInt(formData.stock) < 0)) {
      setErrors((prev) => ({ ...prev, stock: true }));
    }
  };

  const getFieldError = (field: keyof FormErrors) => {
    return errors[field] && touched[field];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{product ? "Editar Producto" : "Agregar Nuevo Producto"}</DialogTitle>
            <DialogDescription>
              {product ? "Actualizar información del producto" : "Crear un nuevo producto para tu inventario"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className={cn("text-right", getFieldError("name") && "text-destructive")}>
                Nombre *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                onBlur={() => handleBlur("name")}
                className={cn(
                  "col-span-3",
                  getFieldError("name") && "border-destructive ring-destructive focus-visible:ring-destructive"
                )}
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className={cn("text-right", getFieldError("price") && "text-destructive")}>
                Precio *
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
                onBlur={() => handleBlur("price")}
                className={cn(
                  "col-span-3",
                  getFieldError("price") && "border-destructive ring-destructive focus-visible:ring-destructive"
                )}
                placeholder="0.00"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cost" className="text-right">
                Costo
              </Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={(e) => handleChange("cost", e.target.value)}
                className="col-span-3"
                placeholder="0.00 (para calcular ganancia)"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className={cn("text-right", getFieldError("category") && "text-destructive")}>
                Categoría *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => {
                  handleChange("category", value);
                  setTouched((prev) => ({ ...prev, category: true }));
                  setErrors((prev) => ({ ...prev, category: false }));
                }}
              >
                <SelectTrigger
                  className={cn(
                    "col-span-3",
                    getFieldError("category") && "border-destructive ring-destructive focus-visible:ring-destructive"
                  )}
                >
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className={cn("text-right", getFieldError("stock") && "text-destructive")}>
                Stock *
              </Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => handleChange("stock", e.target.value)}
                onBlur={() => handleBlur("stock")}
                className={cn(
                  "col-span-3",
                  getFieldError("stock") && "border-destructive ring-destructive focus-visible:ring-destructive"
                )}
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lowStockThreshold" className="text-right">
                Alerta Stock
              </Label>
              <Input
                id="lowStockThreshold"
                type="number"
                min="0"
                value={formData.lowStockThreshold}
                onChange={(e) => handleChange("lowStockThreshold", e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="barcode" className="text-right">
                Código de Barras
              </Label>
              <div className="col-span-3 flex gap-2">
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) => handleChange("barcode", e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setIsScannerOpen(true)}
                  title="Escanear código de barras"
                >
                  <ScanBarcode className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descripción
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="pos">
              {product ? "Actualizar" : "Agregar"} Producto
            </Button>
          </DialogFooter>
        </form>

        <BarcodeScanner
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScanResult={(barcode) => handleChange("barcode", barcode)}
        />
      </DialogContent>
    </Dialog>
  );
}
