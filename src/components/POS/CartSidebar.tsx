import { usePOSStore } from '@/stores/posStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Minus, Plus, Trash2, CreditCard, DollarSign, Smartphone, Edit3, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export function CartSidebar() {
  const {
    cart,
    cartSubtotal,
    cartTax,
    cartTotal,
    currentUser,
    updateCartQuantity,
    updateCartUnitPrice,
    removeFromCart,
    completeSale,
    clearCart
  } = usePOSStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [editingUnit, setEditingUnit] = useState<{ productId: string; unitIndex: number } | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const isAdmin = currentUser?.role === 'admin';

  const handlePayment = async (method: 'cash' | 'card' | 'digital') => {
    setIsProcessing(true);
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

  const startEditingUnit = (productId: string, unitIndex: number, currentPrice: number) => {
    setEditingUnit({ productId, unitIndex });
    setTempPrice(currentPrice.toFixed(2));
  };

  const saveUnitPrice = () => {
    if (!editingUnit) return;
    const price = parseFloat(tempPrice);
    if (!isNaN(price) && price > 0) {
      updateCartUnitPrice(editingUnit.productId, editingUnit.unitIndex, price);
    }
    setEditingUnit(null);
    setTempPrice('');
  };

  const cancelEdit = () => {
    setEditingUnit(null);
    setTempPrice('');
  };

  const toggleExpanded = (productId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="w-80 border-l border-border bg-card flex flex-col h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span>Carrito</span>
          <Badge variant="secondary">{cart.length} items</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {cart.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center">
            <div className="text-muted-foreground">
              <div className="text-4xl mb-2">🛒</div>
              <p className="text-sm">Tu carrito está vacío</p>
              <p className="text-xs">Agrega productos para comenzar</p>
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
                            ${(item.subtotal / item.quantity).toFixed(2)} c/u prom.
                          </p>
                        </div>
                      </div>

                      {/* Unit prices section - only for admin and multiple units */}
                      {isAdmin && item.quantity > 1 && (
                        <Collapsible 
                          open={expandedItems.has(item.id)}
                          onOpenChange={() => toggleExpanded(item.id)}
                          className="mt-2"
                        >
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-full h-6 text-xs">
                              {expandedItems.has(item.id) ? (
                                <>
                                  <ChevronUp className="h-3 w-3 mr-1" />
                                  Ocultar precios por unidad
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-3 w-3 mr-1" />
                                  Ver precios por unidad
                                </>
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-2">
                            <div className="space-y-1 p-2 bg-background rounded border">
                              {item.unitPrices.map((unitPrice, index) => (
                                <div key={index} className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">Unidad {index + 1}:</span>
                                  {editingUnit?.productId === item.id && editingUnit?.unitIndex === index ? (
                                    <div className="flex items-center space-x-1">
                                      <span>$</span>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        value={tempPrice}
                                        onChange={(e) => setTempPrice(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') saveUnitPrice();
                                          if (e.key === 'Escape') cancelEdit();
                                        }}
                                        className="h-5 w-14 text-xs p-1"
                                        autoFocus
                                      />
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={saveUnitPrice}
                                        className="h-5 w-5 p-0 text-green-600"
                                      >
                                        ✓
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={cancelEdit}
                                        className="h-5 w-5 p-0 text-destructive"
                                      >
                                        ✕
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center space-x-1">
                                      <span className="font-medium">${unitPrice.toFixed(2)}</span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => startEditingUnit(item.id, index, unitPrice)}
                                        className="h-4 w-4 p-0 text-muted-foreground hover:text-primary"
                                      >
                                        <Edit3 className="h-2.5 w-2.5" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      )}

                      {/* Single unit price edit - only for admin */}
                      {isAdmin && item.quantity === 1 && (
                        <div className="mt-2 flex items-center justify-end">
                          {editingUnit?.productId === item.id && editingUnit?.unitIndex === 0 ? (
                            <div className="flex items-center space-x-1">
                              <span className="text-xs">$</span>
                              <Input
                                type="number"
                                step="0.01"
                                value={tempPrice}
                                onChange={(e) => setTempPrice(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveUnitPrice();
                                  if (e.key === 'Escape') cancelEdit();
                                }}
                                className="h-5 w-14 text-xs p-1"
                                autoFocus
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={saveUnitPrice}
                                className="h-5 w-5 p-0 text-green-600"
                              >
                                ✓
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={cancelEdit}
                                className="h-5 w-5 p-0 text-destructive"
                              >
                                ✕
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditingUnit(item.id, 0, item.unitPrices[0])}
                              className="h-5 text-xs text-muted-foreground hover:text-primary"
                            >
                              <Edit3 className="h-3 w-3 mr-1" />
                              Editar precio
                            </Button>
                          )}
                        </div>
                      )}
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
                  <span>Impuesto (9%)</span>
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
                  variant="pos-success"
                  className="w-full"
                  onClick={() => handlePayment('cash')}
                  disabled={isProcessing}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Procesando...' : 'Pagar en Efectivo'}
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full border-2"
                  onClick={() => handlePayment('card')}
                  disabled={isProcessing}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pagar con Tarjeta
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full border-2"
                  onClick={() => handlePayment('digital')}
                  disabled={isProcessing}
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  Pago Digital
                </Button>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={clearCart}
                disabled={isProcessing}
              >
                Vaciar Carrito
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </div>
  );
}
