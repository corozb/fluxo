import { usePOSStore } from '@/stores/posStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Minus, Plus, Trash2, CreditCard, DollarSign, Smartphone, Edit3, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export function MobileCartContent() {
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
    <div className="flex flex-col h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span>Tu Carrito</span>
          <Badge variant="secondary">{cart.length} items</Badge>
        </CardTitle>
      </CardHeader>

      <div className="flex-1 flex flex-col min-h-0">
        {cart.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center">
            <div className="text-muted-foreground">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-lg mb-1">Tu carrito está vacío</p>
              <p className="text-sm">Agrega productos para comenzar</p>
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
                            {formatNumber(item.subtotal / item.quantity, '$')} c/u promedio
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
                            {formatNumber(item.subtotal, '$')}
                          </p>
                        </div>
                      </div>

                      {/* Unit prices section - only for admin and multiple units */}
                      {isAdmin && item.quantity > 1 && (
                        <Collapsible 
                          open={expandedItems.has(item.id)}
                          onOpenChange={() => toggleExpanded(item.id)}
                          className="mt-3"
                        >
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-full h-8 text-sm">
                              {expandedItems.has(item.id) ? (
                                <>
                                  <ChevronUp className="h-4 w-4 mr-1" />
                                  Ocultar precios por unidad
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4 mr-1" />
                                  Ver precios por unidad
                                </>
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-2">
                            <div className="space-y-2 p-3 bg-background rounded-lg border">
                              {item.unitPrices.map((unitPrice, index) => (
                                <div key={index} className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">Unidad {index + 1}:</span>
                                  {editingUnit?.productId === item.id && editingUnit?.unitIndex === index ? (
                                    <div className="flex items-center space-x-2">
                                      <span className="text-sm">$</span>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        value={tempPrice}
                                        onChange={(e) => setTempPrice(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') saveUnitPrice();
                                          if (e.key === 'Escape') cancelEdit();
                                        }}
                                        className="h-8 w-20 text-sm"
                                        autoFocus
                                      />
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={saveUnitPrice}
                                        className="h-8 w-8 p-0 text-green-600"
                                      >
                                        ✓
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={cancelEdit}
                                        className="h-8 w-8 p-0 text-destructive"
                                      >
                                        ✕
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center space-x-2">
                                      <span className="font-medium text-sm">{formatNumber(unitPrice, '$')}</span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => startEditingUnit(item.id, index, unitPrice)}
                                        className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                                      >
                                        <Edit3 className="h-3 w-3" />
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
                        <div className="mt-3 flex items-center justify-end">
                          {editingUnit?.productId === item.id && editingUnit?.unitIndex === 0 ? (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">$</span>
                              <Input
                                type="number"
                                step="0.01"
                                value={tempPrice}
                                onChange={(e) => setTempPrice(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveUnitPrice();
                                  if (e.key === 'Escape') cancelEdit();
                                }}
                                className="h-8 w-20 text-sm"
                                autoFocus
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={saveUnitPrice}
                                className="h-8 w-8 p-0 text-green-600"
                              >
                                ✓
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={cancelEdit}
                                className="h-8 w-8 p-0 text-destructive"
                              >
                                ✕
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditingUnit(item.id, 0, item.unitPrices[0])}
                              className="h-8 text-sm text-muted-foreground hover:text-primary"
                            >
                              <Edit3 className="h-4 w-4 mr-1" />
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

            <div className="space-y-4 p-4 border-t border-border bg-card">
              <div className="space-y-3">
                <div className="flex justify-between text-base">
                  <span>Subtotal</span>
                  <span>{formatNumber(cartSubtotal, '$')}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span>Impuesto (9%)</span>
                  <span>{formatNumber(cartTax, '$')}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-xl">
                  <span>Total</span>
                  <span className="text-pos-total">{formatNumber(cartTotal, '$')}</span>
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
                  {isProcessing ? 'Procesando...' : 'Pagar en Efectivo'}
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="border-2 h-12"
                    onClick={() => handlePayment('card')}
                    disabled={isProcessing}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Tarjeta
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
                Vaciar Carrito
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
