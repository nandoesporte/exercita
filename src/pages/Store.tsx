
import React from 'react';
import { useStore } from '@/hooks/useStore';
import { ProductCard } from '@/components/ui/product-card';
import { Skeleton } from '@/components/ui/skeleton';

const Store = () => {
  const { products, isLoadingProducts, addToCart } = useStore();
  
  const handleAddToCart = (product) => {
    addToCart(product);
  };
  
  // Loading state
  if (isLoadingProducts) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Loja</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[200px] w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-8 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Loja</h1>
      <p className="text-muted-foreground mb-8">
        Descubra nossos produtos fitness para melhorar sua experiência de treino!
      </p>
      
      {products.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl mb-2">Nenhum produto disponível ainda</h3>
          <p className="text-muted-foreground">
            Volte em breve para novos produtos!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Store;
