import { usePOSStore } from '@/stores/posStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, AlertTriangle } from 'lucide-react';

export function ProductGrid() {
  const { filteredProducts, addToCart } = usePOSStore();

  const handleAddToCart = (product: any) => {
    addToCart(product);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 p-3 sm:p-4 pb-24 lg:pb-4">
      {filteredProducts.map((product) => (
        <Card
          key={product.id}
          className="group hover:shadow-lg transition-all duration-200 cursor-pointer bg-gradient-to-br from-card to-muted border-border"
          onClick={() => handleAddToCart(product)}
        >
          <CardContent className="p-3 sm:p-4">
            <div className="aspect-square bg-muted rounded-lg mb-2 sm:mb-3 flex items-center justify-center text-3xl sm:text-4xl text-muted-foreground">
              {product.category === 'Coffee' && '☕'}
              {product.category === 'Pastry' && '🥐'}
              {product.category === 'Tea' && '🍵'}
              {!['Coffee', 'Pastry', 'Tea'].includes(product.category) && '🍽️'}
            </div>
            
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-sm sm:text-base text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {product.name}
                </h3>
                {product.stock <= product.lowStockThreshold && (
                  <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 ml-1" />
                )}
              </div>
              
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 sm:line-clamp-2 hidden sm:block">
                {product.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-base sm:text-lg font-bold text-primary">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    Stock: {product.stock}
                  </span>
                </div>
                
                <Badge 
                  variant={product.stock > product.lowStockThreshold ? "secondary" : "destructive"}
                  className="text-xs hidden sm:inline-flex"
                >
                  {product.category}
                </Badge>
              </div>
              
              <Button
                size="sm"
                variant="pos"
                className="w-full h-8 sm:h-9 text-xs sm:text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(product);
                }}
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Add to Cart</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}