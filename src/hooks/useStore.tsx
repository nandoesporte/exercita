
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductCategory } from '@/types/store';
import { toast } from '@/lib/toast-wrapper';

export const useStore = () => {
  // Fetch all products
  const { 
    data: products = [], 
    isLoading: isLoadingProducts 
  } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      console.log('Fetching store products');
      const { data, error } = await supabase
        .from('products')
        .select('*, categories:workout_categories(name)')
        .eq('is_active', true)  // Only fetch active products for the store
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        toast('Erro ao carregar produtos');
        return [];
      }

      console.log('Store products fetched:', data);

      // Map database fields to our Product interface with proper type safety
      return (data || []).map(item => {
        // Create a properly typed product object
        const product: Product = {
          id: item.id,
          name: item.name,
          description: item.description || '',
          price: item.price,
          image_url: item.image_url || null,
          is_active: item.is_active === undefined ? true : item.is_active,
          is_featured: item.is_featured === undefined ? false : item.is_featured,
          created_at: item.created_at,
          updated_at: item.updated_at,
          sale_url: item.sale_url || '',
          category_id: item.category_id || null,
          // Handle categories safely
          categories: item.categories && !(item.categories as any).error 
            ? { name: (item.categories as any).name } 
            : null
        };
        return product;
      });
    },
  });

  // Fetch a specific product with cacheTime and staleTime to prevent repeated requests
  const fetchProduct = async (id: string): Promise<Product> => {
    console.log('Fetching product with ID:', id);
    const { data, error } = await supabase
      .from('products')
      .select('*, categories:workout_categories(name)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      toast('Erro ao carregar produto');
      throw error;
    }

    console.log('Product detail fetched:', data);
    
    // Map database fields to our Product interface with proper type safety
    const product: Product = {
      id: data.id,
      name: data.name,
      description: data.description || '',
      price: data.price,
      image_url: data.image_url || null,
      is_active: data.is_active === undefined ? true : data.is_active,
      is_featured: data.is_featured === undefined ? false : data.is_featured,
      created_at: data.created_at,
      updated_at: data.updated_at,
      sale_url: data.sale_url || '',
      category_id: data.category_id || null,
      // Handle categories safely
      categories: data.categories && !(data.categories as any).error 
        ? { name: (data.categories as any).name } 
        : null
    };
    
    return product;
  };

  // Fetch product categories
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
        toast('Erro ao carregar categorias');
        return [];
      }

      return data as ProductCategory[];
    },
  });

  // Fetch featured products
  const { 
    data: featuredProducts = [], 
    isLoading: isLoadingFeaturedProducts 
  } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      console.log('Fetching featured products');
      const { data, error } = await supabase
        .from('products')
        .select('*, categories:workout_categories(name)')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Error fetching featured products:', error);
        toast('Erro ao carregar produtos em destaque');
        return [];
      }

      console.log('Featured products fetched:', data);

      // Map database fields to our Product interface with proper type safety
      return (data || []).map(item => {
        // Create a properly typed product object
        const product: Product = {
          id: item.id,
          name: item.name,
          description: item.description || '',
          price: item.price,
          image_url: item.image_url || null,
          is_active: item.is_active === undefined ? true : item.is_active,
          is_featured: item.is_featured === undefined ? false : item.is_featured,
          created_at: item.created_at,
          updated_at: item.updated_at,
          sale_url: item.sale_url || '',
          category_id: item.category_id || null,
          // Handle categories safely
          categories: item.categories && !(item.categories as any).error 
            ? { name: (item.categories as any).name } 
            : null
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
