
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAdminStore } from '@/hooks/useAdminStore';
import { ProductForm } from '@/components/store/ProductForm';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const { updateProduct, isUpdatingProduct, products } = useAdminStore();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true);
        
        // First check if we already have the product in our cached list
        const cachedProduct = products.find(p => p.id === id);
        
        if (cachedProduct) {
          setProduct(cachedProduct);
        } else if (id) {
          // If not in cache, fetch from API
          const { fetchProduct } = useAdminStore.getState();
          const result = await fetchProduct(id);
          setProduct(result);
        }
        
      } catch (error) {
        console.error('Failed to load product:', error);
        toast.error('Failed to load product details');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProduct();
  }, [id, products]);
  
  const handleSubmit = async (data) => {
    try {
      if (!id) return;
      
      await updateProduct({
        id,
        ...data,
      });
      
      toast.success('Product updated successfully!');
      navigate('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
      // Error is already handled in the mutation
    }
  };
  
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Skeleton className="h-9 w-32" />
        </div>
        
        <div className="mb-6">
          <Skeleton className="h-10 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        
        <div className="border rounded-lg p-6 space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-auto">
            <Link to="/admin/products">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </Button>
        </div>
        
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The product you're trying to edit couldn't be found.
          </p>
          <Button asChild>
            <Link to="/admin/products">Return to Products</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-auto">
          <Link to="/admin/products">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>
      </div>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
        <p className="text-muted-foreground">
          Update details for {product.name}
        </p>
      </div>
      
      <div className="border rounded-lg p-6">
        <ProductForm 
          defaultValues={product} 
          onSubmit={handleSubmit} 
          isSubmitting={isUpdatingProduct} 
        />
      </div>
    </div>
  );
};

export default EditProduct;
