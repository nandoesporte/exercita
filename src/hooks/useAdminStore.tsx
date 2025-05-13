
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
        .select('*, categories:workout_categories(name)')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: 'Erro ao carregar produtos',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }

      // Map database fields to our Product interface
      return (data || []).map(item => ({
        ...item,
        sale_url: item.sale_url || '', 
        category_id: item.category_id || null,
        is_active: item.is_active === undefined ? true : item.is_active
      })) as Product[];
    },
  });

  // Buscar um produto específico
  const fetchProduct = async (id: string): Promise<Product> => {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories:workout_categories(name)')
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

    // Map database fields to our Product interface
    return {
      ...data,
      sale_url: data.sale_url || '',
      category_id: data.category_id || null, 
      is_active: data.is_active === undefined ? true : data.is_active
    } as Product;
  };

  // Buscar categorias de produtos
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
      // Convert ProductFormData to match the database columns
      const dbProduct = {
        name: product.name,
        description: product.description,
        price: product.price,
        image_url: product.image_url,
        sale_url: product.sale_url,
        category_id: product.category_id,
        is_active: product.is_active
      };

      const { data, error } = await supabase
        .from('products')
        .insert([dbProduct])
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

      // Map database fields to our Product interface
      return {
        ...data,
        sale_url: data.sale_url || '',
        category_id: data.category_id || null,
        is_active: data.is_active === undefined ? true : data.is_active
      } as Product;
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
      // Convert ProductFormData to match the database columns
      const dbProduct = {
        name: product.name,
        description: product.description,
        price: product.price,
        image_url: product.image_url,
        sale_url: product.sale_url,
        category_id: product.category_id,
        is_active: product.is_active
      };

      const { data, error } = await supabase
        .from('products')
        .update(dbProduct)
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

      // Map database fields to our Product interface
      return {
        ...data,
        sale_url: data.sale_url || '',
        category_id: data.category_id || null,
        is_active: data.is_active === undefined ? true : data.is_active
      } as Product;
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
