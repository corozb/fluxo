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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
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
                <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {product.name}
                </h3>
                {product.stock <= product.lowStockThreshold && (
                  <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 ml-1" />
                )}
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2">
                {product.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-primary">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Stock: {product.stock}
                  </span>
                </div>
                
                <Badge variant={product.stock > product.lowStockThreshold ? "secondary" : "destructive"}>
                  {product.category}
                </Badge>
              </div>
              
              <Button
                size="sm"
                variant="pos"
                className="w-full"
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
  );
}