import { usePOSStore } from '@/stores/posStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, AlertTriangle, Barcode } from 'lucide-react';

export function ProductGrid() {
  const { filteredProducts, addToCart } = usePOSStore();

  const handleAddToCart = (product: any) => {
    addToCart(product);
  };

  return (
    <div className="p-3 sm:p-4 pb-24 lg:pb-4">
      {/* Mobile Row Layout */}
      <div className="flex flex-col space-y-3 sm:hidden">
        {filteredProducts.map((product) => (
          <Card
            key={product.id}
            className="group hover:shadow-lg transition-all duration-200 cursor-pointer bg-gradient-to-r from-card to-muted border-border"
            onClick={() => handleAddToCart(product)}
          >
            <CardContent className="p-3">
              <div className="flex items-center space-x-3">
                {/* Product Icon */}
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-2xl text-muted-foreground flex-shrink-0">
                  {product.category === 'Coffee' && '☕'}
                  {product.category === 'Pastry' && '🥐'}
                  {product.category === 'Tea' && '🍵'}
                  {!['Coffee', 'Pastry', 'Tea'].includes(product.category) && '🍽️'}
                </div>
                
                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-sm text-card-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    {product.stock <= product.lowStockThreshold && (
                      <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 ml-1" />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base font-bold text-primary">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Stock: {product.stock}
                    </span>
                  </div>
                  
                  {product.barcode && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Barcode className="h-3 w-3" />
                      <span className="truncate">{product.barcode}</span>
                    </div>
                  )}
                </div>
                
                {/* Add Button */}
                <Button
                  size="sm"
                  variant="pos"
                  className="h-8 px-3 text-xs flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Grid Layout */}
      <div className="hidden sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredProducts.map((product) => (
          <Card
            key={product.id}
            className="group hover:shadow-lg transition-all duration-200 cursor-pointer bg-gradient-to-br from-card to-muted border-border"
            onClick={() => handleAddToCart(product)}
          >
            <CardContent className="p-4">
              <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center text-4xl text-muted-foreground">
                {product.category === 'Coffee' && '☕'}
                {product.category === 'Pastry' && '🥐'}
                {product.category === 'Tea' && '🍵'}
                {!['Coffee', 'Pastry', 'Tea'].includes(product.category) && '🍽️'}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-base text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  {product.stock <= product.lowStockThreshold && (
                    <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 ml-1" />
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
                
                {product.barcode && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Barcode className="h-3 w-3" />
                    <span className="truncate">{product.barcode}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-primary">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Stock: {product.stock}
                    </span>
                  </div>
                  
                  <Badge 
                    variant={product.stock > product.lowStockThreshold ? "secondary" : "destructive"}
                    className="text-xs"
                  >
                    {product.category}
                  </Badge>
                </div>
                
                <Button
                  size="sm"
                  variant="pos"
                  className="w-full h-9 text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add to Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}