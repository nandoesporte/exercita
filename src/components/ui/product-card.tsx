
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Eye } from 'lucide-react';
import { Product } from '@/hooks/useStore';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  className?: string;
}

export function ProductCard({ product, onAddToCart, className }: ProductCardProps) {
  const { id, name, price, image_url, description } = product;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(product);
  };

  return (
    <Card className={cn("overflow-hidden h-full transition-all duration-200 hover:shadow-lg", className)}>
      <Link to={`/product/${id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          {image_url ? (
            <img 
              src={image_url} 
              alt={name}
              className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-muted">
              <span className="text-muted-foreground">Sem Imagem</span>
            </div>
          )}
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg truncate">{name}</h3>
          <p className="text-muted-foreground text-sm line-clamp-2 h-10 mt-1">
            {description || 'Sem descrição disponível'}
          </p>
          <p className="font-bold text-xl text-primary mt-2">{formatCurrency(price)}</p>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex gap-2">
          {onAddToCart && (
            <Button 
              variant="default" 
              size="sm" 
              className="w-full" 
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Adicionar ao Carrinho
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="px-2" 
            asChild
          >
            <Link to={`/product/${id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Link>
    </Card>
  );
}
