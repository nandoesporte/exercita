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

  // Fetch all products
  const { data: products, isLoading: isLoadingProducts, error: productsError } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      return data as Product[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: singleProduct, isLoading: isLoadingSingleProduct } = useQuery({
    queryKey: ['admin-product', productId],
    queryFn: async (): Promise<Product> => {
      if (!productId) throw new Error('Product ID is required');
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;
      return data as Product;
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Create a product
  const { mutateAsync: createProduct, isPending: isCreating } = useMutation({
    mutationFn: async (product: ProductFormData): Promise<Product> => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select('*')
        .single();

      if (error) throw error;
      return data as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast('Produto criado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating product:', error);
      toast('Erro ao criar produto');
    },
  });

  // Update a product
  const { mutateAsync: updateProduct, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, ...product }: ProductFormData & { id: string }): Promise<Product> => {
      const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      return data as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast('Produto atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating product:', error);
      toast('Erro ao atualizar produto');
    },
  });

  // Delete a product
  const { mutateAsync: deleteProduct, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string): Promise<string> => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast('Produto excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
      toast('Erro ao excluir produto');
    },
  });

  // Toggle product featured status
  const { mutateAsync: toggleFeaturedProduct } = useMutation({
    mutationFn: async (params: { id: string; isFeatured: boolean }) => {
      const { data, error } = await supabase
        .from('products')
        .update({ is_featured: params.isFeatured })
        .eq('id', params.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast('Status destacado atualizado!');
    },
    onError: (error) => {
      console.error('Error toggling featured status:', error);
      toast('Erro ao atualizar status destacado');
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