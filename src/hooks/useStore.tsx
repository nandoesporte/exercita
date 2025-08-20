
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductCategory } from '@/types/store';

export const useStore = () => {
  // Products functionality disabled - table doesn't exist
  const featuredProducts: Product[] = [];
  const isLoadingFeaturedProducts = false;
  const products: Product[] = [];
  const isLoadingProducts = false;

  // Fetch product categories (using workout_categories as fallback)
  const { 
    data: categories = [], 
    isLoading: isLoadingCategories 
  } = useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_categories')
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

  // Fetch a single product - disabled
  const fetchProduct = async (id: string): Promise<Product> => {
    throw new Error('Products functionality not available');
  };

  return {
    featuredProducts,
    isLoadingFeaturedProducts,
    products,
    isLoadingProducts,
    categories,
    isLoadingCategories,
    fetchProduct,
  };
};
