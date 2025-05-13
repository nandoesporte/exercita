
import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from '@/types/store';
import { formatCurrency } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="overflow-hidden rounded-lg border border-fitness-darkGray/30 h-full flex flex-col transition-all hover:shadow-lg hover:scale-[1.02] hover:border-fitness-green/40">
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={product.image_url || '/placeholder.svg'} 
          alt={product.title}
          className="object-cover w-full h-full transition-transform hover:scale-105"
          loading="lazy"
        />
        
        {product.is_featured && (
          <div className="absolute top-2 right-2 bg-fitness-green text-white text-xs font-medium px-2 py-1 rounded-full">
            Destaque
          </div>
        )}
      </div>
      
      <CardContent className="py-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-lg line-clamp-2 mb-1">
          {product.title}
        </h3>
        
        <p className="text-muted-foreground text-sm line-clamp-3 flex-grow mb-3">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-fitness-green">
            {formatCurrency(product.price)}
          </span>
          
          {product.category_id && (
            <span className="text-xs bg-fitness-dark/20 px-2 py-1 rounded-full">
              {(product as any).categories?.name || 'Geral'}
            </span>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pb-4 px-4 pt-0 gap-2 flex">
        <Button 
          asChild
          variant="default" 
          size="sm"
          className="w-full bg-fitness-green hover:bg-fitness-green/80 text-white"
        >
          <a 
            href={product.sale_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
          >
            Comprar Agora
            <ExternalLink size={16} />
          </a>
        </Button>
        
        <Button 
          asChild
          variant="outline" 
          size="sm"
          className="w-full"
        >
          <Link to={`/store/${product.id}`}>
            Detalhes
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
