import { usePOSStore } from '@/stores/posStore';
import { formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { MobileCartContent } from './MobileCartContent';
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export function MobileCartButton() {
  const { cart, cartTotal } = usePOSStore();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  // Close sheet when screen becomes desktop size
  useEffect(() => {
    if (!isMobile) {
      setIsOpen(false);
    }
  }, [isMobile]);

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            size="icon"
            className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center p-0"
            variant="pos"
          >
            <div className="relative">
              <ShoppingCart className="h-6 w-6" />
              {cart.length > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-6 w-6 rounded-full p-0 text-xs flex items-center justify-center border-2 border-background"
                >
                  {cart.length}
                </Badge>
              )}
            </div>
          </Button>
        </SheetTrigger>
        
        <SheetContent side="bottom" className="h-[80vh] rounded-t-xl">
          <MobileCartContent onClose={() => setIsOpen(false)} />
        </SheetContent>
      </Sheet>
      
      {cart.length > 0 && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-pos-total text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
          {formatNumber(cartTotal, '$')}
        </div>
      )}
    </div>
  );
}