
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductCategory, ProductFormData } from '@/types/store';
import { toast } from '@/lib/toast-wrapper';

export const useAdminStore = () => {
  const queryClient = useQueryClient();

  // Fetch all products (admin)
  const { 
    data: products = [], 
    isLoading: isLoadingProducts 
  } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      console.log('Products feature disabled - table does not exist');
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        toast('Erro ao carregar produtos');
        return [];
      }

      return { id: 'disabled', name: 'Products disabled', description: 'Products table does not exist', price: 0, image_url: null, is_active: false, is_featured: false, created_at: '', updated_at: '', sale_url: '', category_id: null, categories: null };
    },
  });

  // Fetch a specific product with cacheTime and staleTime to prevent repeated requests
  const fetchProduct = async (id: string): Promise<Product> => {
    console.log('Product fetching disabled - table does not exist');
    throw new Error('Products table does not exist');
  };

  // Fetch product categories
  const { 
    data: categories = [], 
    isLoading: isLoadingCategories 
  } = useQuery({
    queryKey: ['admin-product-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_categories') // Using workout_categories instead of product_categories
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        toast('Erro ao carregar categorias');
        return [];
      }

      return data as ProductCategory[];
    },
  });

  // Create a category
  const { mutateAsync: createCategory, isPending: isCreatingCategory } = useMutation({
    mutationFn: async (categoryData: Omit<ProductCategory, 'id'>) => {
      const { data, error } = await supabase
        .from('workout_categories')
        .insert([categoryData])
        .select()
        .single();

      if (error) {
        console.error('Error creating category:', error);
        toast('Erro ao criar categoria');
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-product-categories'] });
    }
  });

  // Update a category
  const { mutateAsync: updateCategory, isPending: isUpdatingCategory } = useMutation({
    mutationFn: async (category: ProductCategory) => {
      const { data, error } = await supabase
        .from('workout_categories')
        .update({
          name: category.name,
          color: category.color,
          icon: category.icon
        })
        .eq('id', category.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating category:', error);
        toast('Erro ao atualizar categoria');
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-product-categories'] });
    }
  });

  // Delete a category
  const { mutateAsync: deleteCategory, isPending: isDeletingCategory } = useMutation({
    mutationFn: async (id: string) => {
      try {
        // First update any products using this category to set category_id to null
        const { error: productsError } = await supabase
          .from('products')
          .update({ category_id: null })
          .eq('category_id', id);
          
        if (productsError) {
          console.error('Error updating products:', productsError);
          throw productsError;
        }
        
        // Then update any exercises using this category to set category_id to null
        const { error: exercisesError } = await supabase
          .from('exercises')
          .update({ category_id: null })
          .eq('category_id', id);
          
        if (exercisesError) {
          console.error('Error updating exercises:', exercisesError);
          throw exercisesError;
        }
        
        // Finally, delete the category
        const { error } = await supabase
          .from('workout_categories')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting category:', error);
          throw error;
        }

        return id;
      } catch (error) {
        console.error('Error in delete operation:', error);
        toast('Erro ao excluir categoria');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-product-categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    }
  });

  // Create a product
  const { mutateAsync: createProduct, isPending: isCreating } = useMutation({
    mutationFn: async (product: ProductFormData) => {
      throw new Error('Products table does not exist - cannot create product');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });

  // Update a product
  const { mutateAsync: updateProduct, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, ...product }: ProductFormData & { id: string }) => {
      throw new Error('Products table does not exist - cannot update product');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });

  // Delete a product
  const { mutateAsync: deleteProduct, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      throw new Error('Products table does not exist - cannot delete product');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });

  // Toggle product featured status - Disabled since products table doesn't exist
  const { mutateAsync: toggleFeaturedProduct } = useMutation({
    mutationFn: async (params: { id: string; isFeatured: boolean }) => {
      throw new Error('Products table does not exist - cannot toggle featured status');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });

  return {
    products,
    isLoadingProducts,
    fetchProduct,
    categories,
    isLoadingCategories,
    createCategory,
    isCreatingCategory,
    updateCategory,
    isUpdatingCategory,
    deleteCategory,
    isDeletingCategory,
    createProduct,
    isCreating,
    updateProduct,
    isUpdating,
    deleteProduct,
    isDeleting,
    toggleFeaturedProduct,
  };
};
