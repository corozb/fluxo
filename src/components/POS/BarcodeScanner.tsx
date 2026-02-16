import { useState, useEffect } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePOSStore } from "@/stores/posStore";
import { toast } from "@/hooks/use-toast";
import { Camera, XCircle } from "lucide-react";

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult?: (barcode: string) => void;
}

export function BarcodeScanner({ isOpen, onClose, onScanResult }: BarcodeScannerProps) {
  const { products, addToCart } = usePOSStore();
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setScanning(true);
      setError(null);
    }
  }, [isOpen]);

  const handleScan = (err: unknown, result: unknown) => {
    if (err) {
      console.error("Barcode scan error:", err);
      return;
    }

    if (result && scanning) {
      const barcodeResult = result as { getText?: () => string; text?: string };
      const barcode = barcodeResult.getText?.() || barcodeResult.text || "";

      if (!barcode) return;

      setScanning(false);

      // If onScanResult is provided, just return the barcode value
      if (onScanResult) {
        onScanResult(barcode);
        onClose();
        return;
      }

      // Default behavior: find product and add to cart
      const product = products.find((p) => p.barcode === barcode);

      if (product) {
        addToCart(product);
        toast({
          title: "Producto agregado",
          description: `${product.name} se agregó al carrito`,
        });
        onClose();
      } else {
        toast({
          title: "Producto no encontrado",
          description: `No se encontró un producto con el código: ${barcode}`,
          variant: "destructive",
        });
        // Allow scanning again after a short delay
        setTimeout(() => setScanning(true), 2000);
      }
    }
  };

  const handleError = () => {
    setError("No se pudo acceder a la cámara. Verifica los permisos.");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Escanear Código de Barras
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4">
          {error ? (
            <div className="flex flex-col items-center space-y-4 p-8">
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="text-center text-muted-foreground">{error}</p>
              <Button
                onClick={() => {
                  setError(null);
                  setScanning(true);
                }}
              >
                Reintentar
              </Button>
            </div>
          ) : (
            <>
              <div className="w-full aspect-square max-w-sm rounded-lg overflow-hidden bg-muted relative">
                <BarcodeScannerComponent width="100%" height="100%" onUpdate={handleScan} onError={handleError} />
                {/* Scanning overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-primary animate-pulse" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Apunta la cámara hacia el código de barras del producto
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
