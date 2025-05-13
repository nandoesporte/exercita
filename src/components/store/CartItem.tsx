
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash, Plus, Minus } from 'lucide-react';
import { CartItem as CartItemType } from '@/hooks/useStore';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export function CartItemComponent({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const { product, quantity } = item;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };
  
  const handleIncrease = () => {
    onUpdateQuantity(product.id, quantity + 1);
  };
  
  const handleDecrease = () => {
    if (quantity > 1) {
      onUpdateQuantity(product.id, quantity - 1);
    }
  };
  
  const handleRemove = () => {
    onRemove(product.id);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
            {product.image_url ? (
              <img 
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover object-center"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <span className="text-muted-foreground text-xs">No Image</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-1 flex-col">
            <div className="flex justify-between">
              <Link to={`/product/${product.id}`}>
                <h3 className="text-base font-medium hover:underline">{product.name}</h3>
              </Link>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleRemove} 
                className="h-6 w-6 text-destructive"
              >
                <Trash className="h-4 w-4" />
                <span className="sr-only">Remove</span>
              </Button>
            </div>
            
            <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
              {product.description || 'No description'}
            </p>
            
            <div className="mt-2 flex justify-between items-center">
              <p className="text-sm font-medium">
                {formatCurrency(product.price)}
              </p>
              
              <div className="flex items-center border rounded-md">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleDecrease}
                  className="h-8 w-8 rounded-r-none"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-3 w-3" />
                  <span className="sr-only">Decrease</span>
                </Button>
                
                <span className="w-8 text-center text-sm">{quantity}</span>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleIncrease}
                  className="h-8 w-8 rounded-l-none"
                >
                  <Plus className="h-3 w-3" />
                  <span className="sr-only">Increase</span>
                </Button>
              </div>
            </div>
            
            <p className="mt-1 text-sm font-semibold text-right">
              Subtotal: {formatCurrency(product.price * quantity)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
