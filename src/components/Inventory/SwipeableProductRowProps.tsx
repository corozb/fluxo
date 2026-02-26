import { useState, useRef, useCallback } from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface Product {
  id: string;
  name: string;
  barcode?: string;
  category: string;
  cost?: number;
  price: number;
  stock: number;
  lowStockThreshold: number;
}

interface SwipeableProductRowProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  isTabletOrMobile: boolean;
}

export function SwipeableProductRow({ product, onEdit, onDelete, isTabletOrMobile }: SwipeableProductRowProps) {
  const isMobile = useIsMobile();
  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isSwipingRef = useRef(false);
  const rowRef = useRef<HTMLTableRowElement>(null);

  const margin = product.cost
    ? ((product.price - product.cost) / product.price * 100).toFixed(1)
    : null;

  const SWIPE_THRESHOLD = -80;
  const DELETE_THRESHOLD = -140;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isMobile) return;
    startXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
    isSwipingRef.current = false;
  }, [isMobile]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isMobile) return;
    const deltaX = e.touches[0].clientX - startXRef.current;
    const deltaY = e.touches[0].clientY - startYRef.current;

    // Only horizontal swipe
    if (!isSwipingRef.current && Math.abs(deltaX) > 10 && Math.abs(deltaX) > Math.abs(deltaY)) {
      isSwipingRef.current = true;
      setIsSwiping(true);
    }

    if (isSwipingRef.current) {
      e.preventDefault();
      const clampedX = Math.min(0, Math.max(-180, deltaX));
      setSwipeX(clampedX);
    }
  }, [isMobile]);

  const handleTouchEnd = useCallback(() => {
    if (!isMobile || !isSwipingRef.current) return;

    if (swipeX <= DELETE_THRESHOLD) {
      // Animate out and delete
      setSwipeX(-300);
      setTimeout(() => {
        onDelete(product);
      }, 200);
    } else if (swipeX <= SWIPE_THRESHOLD) {
      // Snap to show delete button
      setSwipeX(SWIPE_THRESHOLD);
    } else {
      // Snap back
      setSwipeX(0);
    }
    setIsSwiping(false);
    isSwipingRef.current = false;
  }, [isMobile, swipeX, onDelete, product]);

  const handleRowClick = () => {
    if (isSwipingRef.current || Math.abs(swipeX) > 5) return;
    if (isTabletOrMobile) {
      onEdit(product);
    }
  };

  if (!isMobile) {
    return (
      <TableRow
        className={isTabletOrMobile ? 'cursor-pointer active:bg-muted/70' : ''}
        onClick={handleRowClick}
      >
        <TableCell>
          <div>
            <p className="font-medium ml-2">{product.name}</p>
            {product.barcode && (
              <p className="text-xs mt-1 ml-2 text-muted-foreground">{product.barcode}</p>
            )}

          <Badge className="mt-2" variant="outline">{product.category}</Badge>
          </div>
        </TableCell>
        <TableCell className="font-medium">
          {formatNumber(product.price, '$')}
        </TableCell>
        <TableCell className="text-muted-foreground">
          {product.cost ? formatNumber(product.cost, '$') : '-'}
        </TableCell>
        <TableCell>
          {margin ? (
            <Badge variant={parseFloat(margin) >= 30 ? "secondary" : "outline"}>
              {margin}%
            </Badge>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </TableCell>
        <TableCell>
          <div className="flex items-center space-x-2">
            <span>{product.stock}</span>
            {product.stock <= product.lowStockThreshold && (
              <AlertTriangle className="h-4 w-4 text-warning" />
            )}
          </div>
        </TableCell>
        <TableCell>
          <Badge variant={product.stock > product.lowStockThreshold ? "secondary" : "destructive"}>
            {product.stock > product.lowStockThreshold ? "En Stock" : "Stock Bajo"}
          </Badge>
        </TableCell>
          <TableCell className="font-medium">
            {product.cost
              ? formatNumber(product.cost * product.stock, "$")
              : "-"}
          </TableCell>
        {!isTabletOrMobile && (
          <TableCell className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(product)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(product)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        )}
      </TableRow>
    );
  }

  // Mobile: swipeable row
  return (
    <>
      <tr className="relative h-0 border-0">
        <td
          colSpan={5}
          className="p-0 border-0"
          style={{ position: 'relative', height: 0, overflow: 'visible' }}
        >
          {swipeX < 0 && (
            <div
              className="absolute right-0 top-0 flex items-center justify-center bg-destructive text-destructive-foreground z-10"
              style={{
                width: `${Math.abs(swipeX)}px`,
                height: '100%',
                top: 0,
              }}
            >
              <Trash2 className="h-5 w-5" />
              {swipeX <= DELETE_THRESHOLD && (
                <span className="ml-2 text-sm font-medium">Soltar</span>
              )}
            </div>
          )}
        </td>
      </tr>
      <TableRow
        ref={rowRef}
        className="cursor-pointer active:bg-muted/70"
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s ease-out',
          position: 'relative',
          zIndex: 20,
        }}
        onClick={handleRowClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <TableCell>
          <div>
            <p className="font-medium ml-2">{product.name}</p>
            {product.barcode && (
              <p className="text-xs mt-1 ml-2 text-muted-foreground">{product.barcode}</p>
            )}

          <Badge className="mt-2" variant="outline">{product.category}</Badge>
          </div>
        </TableCell>
        <TableCell className="font-medium text-left">
          {formatNumber(product.cost, '$')}
        </TableCell>
        <TableCell>
          <div className="flex items-center space-x-2">
            <span>{product.stock}</span>
            {product.stock <= product.lowStockThreshold && (
              <AlertTriangle className="h-4 w-4 text-warning" />
            )}
          </div>
        </TableCell>
        <TableCell>
          <Badge variant={product.stock > product.lowStockThreshold ? "secondary" : "destructive"}>
            {product.stock > product.lowStockThreshold ? "En Stock" : "Stock Bajo"}
          </Badge>
        </TableCell>
       <TableCell className="font-medium">
            {product.cost
              ? formatNumber(product.cost * product.stock, "$")
              : "-"}
          </TableCell>
      </TableRow>
    </>
  );
}