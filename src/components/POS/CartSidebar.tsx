import { usePOSStore } from '@/stores/posStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Minus, Plus, Trash2, CreditCard, DollarSign, Smartphone } from 'lucide-react';
import { useState } from 'react';

export function CartSidebar() {
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
      // Show success toast or redirect to receipt
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
    <div className="w-80 border-l border-border bg-card flex flex-col h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span>Cart</span>
          <Badge variant="secondary">{cart.length} items</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {cart.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center">
            <div className="text-muted-foreground">
              <div className="text-4xl mb-2">🛒</div>
              <p className="text-sm">Your cart is empty</p>
              <p className="text-xs">Add items to get started</p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-3">
                {cart.map((item) => (
                  <Card key={item.id} className="bg-muted/50">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          
                          <span className="min-w-[2rem] text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm font-medium">${item.subtotal.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            ${item.price.toFixed(2)} each
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            <div className="space-y-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (9%)</span>
                  <span>${cartTax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-pos-total">${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full bg-success hover:bg-success-light text-success-foreground"
                  onClick={() => handlePayment('cash')}
                  disabled={isProcessing}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Pay with Cash'}
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handlePayment('card')}
                  disabled={isProcessing}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay with Card
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handlePayment('digital')}
                  disabled={isProcessing}
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  Digital Payment
                </Button>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={clearCart}
                disabled={isProcessing}
              >
                Clear Cart
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </div>
  );
}