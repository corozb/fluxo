import { usePOSStore } from '@/stores/posStore';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { MobileCartContent } from './MobileCartContent';

export function MobileCartButton() {
  const { cart, cartTotal } = usePOSStore();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            size="lg"
            className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-200"
            variant="pos"
          >
            <div className="relative">
              <ShoppingCart className="h-6 w-6" />
              {cart.length > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                >
                  {cart.length}
                </Badge>
              )}
            </div>
          </Button>
        </SheetTrigger>
        
        <SheetContent side="bottom" className="h-[80vh] rounded-t-xl">
          <MobileCartContent />
        </SheetContent>
      </Sheet>
      
      {cart.length > 0 && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-pos-total text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
          ${cartTotal.toFixed(2)}
        </div>
      )}
    </div>
  );
}