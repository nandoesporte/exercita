// Add this to the useStore.tsx file to handle the case when is_featured might not exist

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/store';

export const useStore = () => {
  // Fetch featured products with error handling for missing column
  const { 
    data: featuredProducts = [], 
    isLoading: isLoadingFeaturedProducts 
  } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      try {
        // Try to fetch products with is_featured=true
        const { data, error } = await supabase
          .from('products')
          .select('*, categories:workout_categories(name)')
          .eq('is_active', true)
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) {
          console.error('Error fetching featured products:', error);
          
          // If the column doesn't exist, fall back to regular products
          if (error.message?.includes('column') && error.message?.includes('does not exist')) {
            console.log('The is_featured column does not exist yet, falling back to regular products');
            
            const { data: regularProducts, error: regularError } = await supabase
              .from('products')
              .select('*, categories:workout_categories(name)')
              .eq('is_active', true)
              .order('created_at', { ascending: false })
              .limit(6);
            
            if (regularError) {
              throw regularError;
            }
            
            return regularProducts as Product[];
          }
          
          throw error;
        }

        return data as Product[];
      } catch (error) {
        console.error('Error in featuredProducts query:', error);
        return []; // Return empty array on error
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    featuredProducts,
    isLoadingFeaturedProducts,
  };
};
