
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminStore } from '@/hooks/useAdminStore';
import { ProductForm } from '@/components/store/ProductForm';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

const CreateProduct = () => {
  const { createProduct, isCreatingProduct } = useAdminStore();
  const navigate = useNavigate();
  
  const handleSubmit = async (data) => {
    try {
      await createProduct(data);
      toast.success('Product created successfully!');
      navigate('/admin/products');
    } catch (error) {
      console.error('Error creating product:', error);
      // Error is already handled in the mutation
    }
  };

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
        <h1 className="text-3xl font-bold tracking-tight">Create New Product</h1>
        <p className="text-muted-foreground">
          Add a new product to your store
        </p>
      </div>
      
      <div className="border rounded-lg p-6">
        <ProductForm onSubmit={handleSubmit} isSubmitting={isCreatingProduct} />
      </div>
    </div>
  );
};

export default CreateProduct;
