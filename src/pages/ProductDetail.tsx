import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '@/hooks/useStore';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ChevronLeft, Minus, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { products, addToCart, fetchProduct } = useStore();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  
  useEffect(() => {
    const loadProductData = async () => {
      try {
        setLoading(true);
        
        // First check if the product is already in the products list
        const existingProduct = products.find(p => p.id === id);
        if (existingProduct) {
          setProduct(existingProduct);
          setLoading(false);
          return;
        }
        
        // Fetch from API if not found locally
        if (id) {
          const result = await fetchProduct(id);
          setProduct(result);
        }
      } catch (error) {
        console.error('Failed to load product:', error);
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };
    
    loadProductData();
  }, [id, products, fetchProduct]);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };
  
  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };
  
  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const handleIncreaseQuantity = () => {
    setQuantity(quantity + 1);
  };
  
  if (loading) {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/store">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Store
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square w-full rounded-lg" />
          
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-32 w-full" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/store">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Store
            </Link>
          </Button>
        </div>
        
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/store">Return to Store</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/store">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Store
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square relative bg-muted rounded-lg overflow-hidden">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <span className="text-muted-foreground">No Image Available</span>
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-2xl font-semibold text-primary">
            {formatCurrency(product.price)}
          </p>
          
          <div className="prose max-w-none">
            <p>{product.description || 'No description available'}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center border rounded-md">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleDecreaseQuantity}
                className="h-10 w-10 rounded-r-none"
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <span className="w-12 text-center">{quantity}</span>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleIncreaseQuantity}
                className="h-10 w-10 rounded-l-none"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <Button 
              size="lg" 
              onClick={handleAddToCart}
              className="flex-1"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
