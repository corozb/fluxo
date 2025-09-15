import { usePOSStore } from '@/stores/posStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Minus, Plus, Trash2, CreditCard, DollarSign, Smartphone } from 'lucide-react';
import { useState } from 'react';

export function MobileCartContent() {
  const {
    cart,
    cartSubtotal,
    cartTax,
    cartTotal,
    updateCartQuantity,
    removeFromCart,
    completeSale,
    clearCart
  } = usePOSStore();

  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async (method: 'cash' | 'card' | 'digital') => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const saleId = completeSale(method);
    setIsProcessing(false);
    
    if (saleId) {
      console.log(`Sale completed: ${saleId}`);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateCartQuantity(productId, newQuantity);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span>Your Cart</span>
          <Badge variant="secondary">{cart.length} items</Badge>
        </CardTitle>
      </CardHeader>

      <div className="flex-1 flex flex-col">
        {cart.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center">
            <div className="text-muted-foreground">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-lg mb-1">Your cart is empty</p>
              <p className="text-sm">Add items to get started</p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-3">
                {cart.map((item) => (
                  <Card key={item.id} className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-base mb-1">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            ${item.price.toFixed(2)} each
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="text-destructive hover:text-destructive ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          
                          <span className="min-w-[3rem] text-center text-base font-medium">
                            {item.quantity}
                          </span>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            ${item.subtotal.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            <div className="space-y-4 p-4 border-t border-border bg-card">
              <div className="space-y-3">
                <div className="flex justify-between text-base">
                  <span>Subtotal</span>
                  <span>${cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span>Tax (9%)</span>
                  <span>${cartTax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-xl">
                  <span>Total</span>
                  <span className="text-pos-total">${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button
                  variant="pos-success"
                  className="w-full h-12 text-base"
                  onClick={() => handlePayment('cash')}
                  disabled={isProcessing}
                >
                  <DollarSign className="h-5 w-5 mr-2" />
                  {isProcessing ? 'Processing...' : 'Pay with Cash'}
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="border-2 h-12"
                    onClick={() => handlePayment('card')}
                    disabled={isProcessing}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Card
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="border-2 h-12"
                    onClick={() => handlePayment('digital')}
                    disabled={isProcessing}
                  >
                    <Smartphone className="h-4 w-4 mr-2" />
                    Digital
                  </Button>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full h-10"
                onClick={clearCart}
                disabled={isProcessing}
              >
                Clear Cart
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}