import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminPermissionsContext } from './useAdminPermissionsContext';
import { toast } from '@/lib/toast-wrapper';

interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  sale_url?: string | null;
  category_id?: string | null;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

interface ProductCategory {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
  created_at: string;
  updated_at: string;
}

interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  sale_url?: string;
  category_id?: string;
  is_active?: boolean;
  is_featured?: boolean;
}

export function useAdminStore() {
  const queryClient = useQueryClient();
  const { isSuperAdmin, isAdmin, adminId } = useAdminPermissionsContext();

  // Fetch all products
  const {
    data: products = [],
    isLoading: isLoadingProducts,
    error: productsError
  } = useQuery({
    queryKey: ['admin-products', adminId],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*');

      // If not super admin, apply filtering
      if (!isSuperAdmin && adminId) {
        // For now, just return all products for any admin
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      return data as Product[];
    },
    enabled: isAdmin,
  });

  const fetchProduct = async (id: string): Promise<Product> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      throw error;
    }

    return data as Product;
  };

  // Fetch categories
  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    error: categoriesError
  } = useQuery({
    queryKey: ['admin-categories', adminId],
    queryFn: async () => {
      let query = supabase
        .from('workout_categories')
        .select('*');

      // If not super admin, apply filtering (if needed)
      if (!isSuperAdmin && adminId) {
        // For now, return all categories for any admin
      }

      const { data, error } = await query.order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      return data as ProductCategory[];
    },
    enabled: isAdmin,
  });

  // Create category
  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: Omit<ProductCategory, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('workout_categories')
        .insert(categoryData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast("Categoria criada com sucesso");
    },
    onError: (error) => {
      console.error('Error creating category:', error);
      toast("Erro ao criar categoria");
    },
  });

  // Update category
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, ...categoryData }: Partial<ProductCategory> & { id: string }) => {
      const { data, error } = await supabase
        .from('workout_categories')
        .update(categoryData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast("Categoria atualizada com sucesso");
    },
    onError: (error) => {
      console.error('Error updating category:', error);
      toast("Erro ao atualizar categoria");
    },
  });

  // Delete category
  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      // First, remove category from products that use it
      await supabase
        .from('products')
        .update({ category_id: null })
        .eq('category_id', categoryId);

      // Then delete the category
      const { error } = await supabase
        .from('workout_categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast("Categoria deletada com sucesso");
    },
    onError: (error) => {
      console.error('Error deleting category:', error);
      toast("Erro ao deletar categoria");
    },
  });

  // Create product
  const createProductMutation = useMutation({
    mutationFn: async (productData: ProductFormData) => {
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast("Produto criado com sucesso");
    },
    onError: (error) => {
      console.error('Error creating product:', error);
      toast("Erro ao criar produto");
    },
  });

  // Update product
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, ...productData }: Partial<Product> & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast("Produto atualizado com sucesso");
    },
    onError: (error) => {
      console.error('Error updating product:', error);
      toast("Erro ao atualizar produto");
    },
  });

  // Delete product
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast("Produto deletado com sucesso");
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
      toast("Erro ao deletar produto");
    },
  });

  // Toggle featured product
  const toggleFeaturedProductMutation = useMutation({
    mutationFn: async ({ productId, isFeatured }: { productId: string; isFeatured: boolean }) => {
      const { data, error } = await supabase
        .from('products')
        .update({ is_featured: isFeatured })
        .eq('id', productId)
        .select()
        .single();

      if (error) {
        // Handle case where is_featured column might not exist
        if (error.message?.includes('column') && error.message?.includes('does not exist')) {
          console.log('is_featured column does not exist, skipping toggle');
          return null;
        }
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast("Status de destaque atualizado");
    },
    onError: (error) => {
      console.error('Error toggling featured status:', error);
      toast("Erro ao atualizar status de destaque");
    },
  });

  return {
    // Products
    products,
    isLoadingProducts,
    fetchProduct,
    createProduct: createProductMutation.mutate,
    updateProduct: updateProductMutation.mutate,
    deleteProduct: deleteProductMutation.mutate,
    toggleFeaturedProduct: toggleFeaturedProductMutation.mutate,
    isCreating: createProductMutation.isPending,
    isUpdating: updateProductMutation.isPending,
    isDeleting: deleteProductMutation.isPending,

    // Categories
    categories,
    isLoadingCategories,
    createCategory: createCategoryMutation.mutate,
    updateCategory: updateCategoryMutation.mutate,
    deleteCategory: deleteCategoryMutation.mutate,
    isCreatingCategory: createCategoryMutation.isPending,
    isUpdatingCategory: updateCategoryMutation.isPending,
    isDeletingCategory: deleteCategoryMutation.isPending,
  };
}