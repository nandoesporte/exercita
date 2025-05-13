
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductCategory, ProductFormData } from '@/types/store';
import { toast } from '@/components/ui/use-toast';

export const useAdminStore = () => {
  const queryClient = useQueryClient();

  // Buscar todos os produtos (admin)
  const { 
    data: products = [], 
    isLoading: isLoadingProducts 
  } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories:category_id(name)')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: 'Erro ao carregar produtos',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }

      return data as Product[];
    },
  });

  // Buscar um produto específico
  const fetchProduct = async (id: string): Promise<Product> => {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories:category_id(name)')
      .eq('id', id)
      .single();

    if (error) {
      toast({
        title: 'Erro ao carregar produto',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }

    return data as Product;
  };

  // Buscar categorias de produtos
  const { 
    data: categories = [], 
    isLoading: isLoadingCategories 
  } = useQuery({
    queryKey: ['admin-product-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('name');

      if (error) {
        toast({
          title: 'Erro ao carregar categorias',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }

      return data as ProductCategory[];
    },
  });

  // Criar um produto
  const { mutateAsync: createProduct, isPending: isCreating } = useMutation({
    mutationFn: async (product: ProductFormData) => {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();

      if (error) {
        toast({
          title: 'Erro ao criar produto',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      toast({
        title: 'Produto criado com sucesso',
        variant: 'default',
      });

      return data as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Atualizar um produto
  const { mutateAsync: updateProduct, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, ...product }: ProductFormData & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        toast({
          title: 'Erro ao atualizar produto',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      toast({
        title: 'Produto atualizado com sucesso',
        variant: 'default',
      });

      return data as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Excluir um produto
  const { mutateAsync: deleteProduct, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        toast({
          title: 'Erro ao excluir produto',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      toast({
        title: 'Produto excluído com sucesso',
        variant: 'default',
      });

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return {
    products,
    isLoadingProducts,
    fetchProduct,
    categories,
    isLoadingCategories,
    createProduct,
    isCreating,
    updateProduct,
    isUpdating,
    deleteProduct,
    isDeleting,
  };
};
