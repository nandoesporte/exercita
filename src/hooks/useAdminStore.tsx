import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast-wrapper';

// Simplified Product type since the actual products table doesn't exist
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  sale_url: string;
  category_id: string | null;
  categories: { name: string } | null;
}

export interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  sale_url?: string;
  is_active: boolean;
  is_featured: boolean;
  category_id?: string;
}

export function useAdminStore(productId?: string) {
  const queryClient = useQueryClient();

  // Products functionality is disabled since the table doesn't exist
  const { data: products, isLoading: isLoadingProducts, error: productsError } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async (): Promise<Product[]> => {
      console.log('Products functionality disabled - table does not exist');
      return [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: singleProduct, isLoading: isLoadingSingleProduct } = useQuery({
    queryKey: ['admin-product', productId],
    queryFn: (): Promise<Product> => {
      throw new Error('Products table does not exist');
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Create a product - disabled
  const { mutateAsync: createProduct, isPending: isCreating } = useMutation({
    mutationFn: async (product: ProductFormData): Promise<Product> => {
      throw new Error('Products table does not exist - cannot create product');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });

  // Update a product - disabled
  const { mutateAsync: updateProduct, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, ...product }: ProductFormData & { id: string }): Promise<Product> => {
      throw new Error('Products table does not exist - cannot update product');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });

  // Delete a product - disabled
  const { mutateAsync: deleteProduct, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string): Promise<string> => {
      throw new Error('Products table does not exist - cannot delete product');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });

  // Toggle product featured status - disabled
  const { mutateAsync: toggleFeaturedProduct } = useMutation({
    mutationFn: async (params: { id: string; isFeatured: boolean }) => {
      throw new Error('Products table does not exist - cannot toggle featured status');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });

  return {
    // Product data
    products: products || [],
    singleProduct,
    isLoadingProducts,
    isLoadingSingleProduct,
    productsError,
    
    // Product mutations
    createProduct,
    isCreating,
    updateProduct,
    isUpdating,
    deleteProduct,
    isDeleting,
    toggleFeaturedProduct,
  };
}