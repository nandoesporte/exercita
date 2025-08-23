
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductCategory } from '@/types/store';

export const useStore = () => {
  // Fetch featured products
  const { 
    data: featuredProducts = [], 
    isLoading: isLoadingFeaturedProducts 
  } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching featured products:', error);
        throw error;
      }

      return data as Product[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch all products
  const { 
    data: products = [], 
    isLoading: isLoadingProducts 
  } = useQuery({
    queryKey: ['all-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      return data as Product[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch product categories
  const { 
    data: categories = [], 
    isLoading: isLoadingCategories 
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

  // Fetch a single product
  const fetchProduct = async (id: string): Promise<Product> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      throw error;
    }

    return data as Product;
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
