
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductCategory } from '@/types/store';
import { toast } from '@/components/ui/use-toast';

export const useStore = () => {
  // Buscar todos os produtos
  const { 
    data: products = [], 
    isLoading: isLoadingProducts 
  } = useQuery({
    queryKey: ['products'],
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
        sale_url: item.sale_url || '', // Handle potentially missing field
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
    queryKey: ['product-categories'],
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

  // Buscar produtos destacados
  const { 
    data: featuredProducts = [], 
    isLoading: isLoadingFeaturedProducts 
  } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories:workout_categories(name)')
        .eq('is_active', true)
        .limit(6);

      if (error) {
        toast({
          title: 'Erro ao carregar produtos destacados',
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

  return {
    products,
    isLoadingProducts,
    fetchProduct,
    categories,
    isLoadingCategories,
    featuredProducts,
    isLoadingFeaturedProducts,
  };
};
