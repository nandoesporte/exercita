
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
      return (data || []).map(item => {
        // Create a properly typed product object
        const product: Product = {
          id: item.id,
          name: item.name,
          description: item.description || '',
          price: item.price,
          image_url: item.image_url || '',
          is_active: item.is_active === undefined ? true : item.is_active,
          created_at: item.created_at || '',
          updated_at: item.updated_at || '',
          // Add optional fields with proper handling
          sale_url: item.sale_url || '',
          category_id: item.category_id || null,
          // Handle categories properly
          categories: item.categories?.name ? { name: item.categories.name } : null
        };
        return product;
      });
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
    const product: Product = {
      id: data.id,
      name: data.name,
      description: data.description || '',
      price: data.price,
      image_url: data.image_url || '',
      is_active: data.is_active === undefined ? true : data.is_active,
      created_at: data.created_at || '',
      updated_at: data.updated_at || '',
      // Add optional fields with proper handling
      sale_url: data.sale_url || '',
      category_id: data.category_id || null,
      // Handle categories properly
      categories: data.categories?.name ? { name: data.categories.name } : null
    };
    
    return product;
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

  // Buscar produtos ativos
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
          title: 'Erro ao carregar produtos em destaque',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }

      // Map database fields to our Product interface
      return (data || []).map(item => {
        // Create a properly typed product object
        const product: Product = {
          id: item.id,
          name: item.name,
          description: item.description || '',
          price: item.price,
          image_url: item.image_url || '',
          is_active: item.is_active === undefined ? true : item.is_active,
          created_at: item.created_at || '',
          updated_at: item.updated_at || '',
          // Add optional fields with proper handling
          sale_url: item.sale_url || '',
          category_id: item.category_id || null,
          // Handle categories properly
          categories: item.categories?.name ? { name: item.categories.name } : null
        };
        return product;
      });
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
