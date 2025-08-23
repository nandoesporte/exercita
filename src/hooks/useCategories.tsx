import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProductCategory } from '@/types/store';
import { toast } from '@/lib/toast-wrapper';

export const useCategories = () => {
  const queryClient = useQueryClient();

  // Fetch all categories
  const { 
    data: categories = [], 
    isLoading: isLoadingCategories,
    error: categoriesError 
  } = useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      return data as ProductCategory[];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Create category mutation
  const { mutateAsync: createCategory, isPending: isCreating } = useMutation({
    mutationFn: async (category: Omit<ProductCategory, 'id'>) => {
      const { data, error } = await supabase
        .from('product_categories')
        .insert(category)
        .select()
        .single();

      if (error) throw error;
      return data as ProductCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      toast('Categoria criada com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating category:', error);
      toast('Erro ao criar categoria');
    },
  });

  // Update category mutation
  const { mutateAsync: updateCategory, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, ...category }: ProductCategory) => {
      const { data, error } = await supabase
        .from('product_categories')
        .update(category)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ProductCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      toast('Categoria atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating category:', error);
      toast('Erro ao atualizar categoria');
    },
  });

  // Delete category mutation
  const { mutateAsync: deleteCategory, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      toast('Categoria excluída com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting category:', error);
      toast('Erro ao excluir categoria');
    },
  });

  return {
    categories,
    isLoadingCategories,
    categoriesError,
    createCategory,
    isCreating,
    updateCategory,
    isUpdating,
    deleteCategory,
    isDeleting,
  };
};