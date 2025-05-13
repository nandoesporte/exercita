
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductCategory, ProductFormData } from '@/types/store';
import { toast } from '@/components/ui/use-toast';

export const useAdminStore = () => {
  const queryClient = useQueryClient();

  // Fetch all products (admin)
  const { 
    data: products = [], 
    isLoading: isLoadingProducts 
  } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      console.log('Fetching admin products');
      const { data, error } = await supabase
        .from('products')
        .select('*, categories:workout_categories(name)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        toast({
          title: 'Erro ao carregar produtos',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }

      // Map database fields to our Product interface with proper type safety
      return (data || []).map(item => {
        // Create a properly typed product object
        const product: Product = {
          id: item.id,
          name: item.name,
          description: item.description || null,
          price: item.price,
          image_url: item.image_url || null,
          is_active: item.is_active === undefined ? true : item.is_active,
          created_at: item.created_at,
          updated_at: item.updated_at,
          sale_url: item.sale_url || '',
          category_id: item.category_id || null,
          // Categories is populated since we're fetching it
          categories: item.categories ? { name: (item.categories as any).name } : null
        };
        return product;
      });
    },
  });

  // Fetch a specific product
  const fetchProduct = async (id: string): Promise<Product> => {
    console.log('Fetching product with ID:', id);
    const { data, error } = await supabase
      .from('products')
      .select('*, categories:workout_categories(name)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      toast({
        title: 'Erro ao carregar produto',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }

    console.log('Product data received:', data);
    
    // Map database fields to our Product interface with proper type safety
    const product: Product = {
      id: data.id,
      name: data.name,
      description: data.description || null,
      price: data.price,
      image_url: data.image_url || null,
      is_active: data.is_active === undefined ? true : data.is_active,
      created_at: data.created_at,
      updated_at: data.updated_at,
      sale_url: data.sale_url || '',
      category_id: data.category_id || null,
      // Categories is populated since we're fetching it
      categories: data.categories ? { name: (data.categories as any).name } : null
    };
    
    return product;
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

  // Create a product
  const { mutateAsync: createProduct, isPending: isCreating } = useMutation({
    mutationFn: async (product: ProductFormData) => {
      console.log('Saving product to database:', product);
      
      // Convert ProductFormData to match the database columns
      const dbProduct = {
        name: product.name,
        description: product.description,
        price: product.price,
        image_url: product.image_url,
        sale_url: product.sale_url,
        is_active: product.is_active,
        category_id: product.category_id === 'null' ? null : product.category_id
      };

      console.log('Database product object to create:', dbProduct);

      const { data, error } = await supabase
        .from('products')
        .insert([dbProduct])
        .select()
        .single();

      if (error) {
        console.error('Error creating product:', error);
        toast({
          title: 'Erro ao criar produto',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      console.log('Product created successfully:', data);
      
      toast({
        title: 'Produto criado com sucesso',
        variant: 'default',
      });

      // Map database fields to our Product interface
      const newProduct: Product = {
        id: data.id,
        name: data.name,
        description: data.description || null,
        price: data.price,
        image_url: data.image_url || null,
        is_active: data.is_active === undefined ? true : data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at,
        sale_url: data.sale_url || '',
        category_id: data.category_id || null,
        categories: null // New product might not have categories loaded
      };
      
      return newProduct;
    },
    onSuccess: () => {
      console.log('Invalidating queries after product creation');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Update a product
  const { mutateAsync: updateProduct, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, ...product }: ProductFormData & { id: string }) => {
      console.log('Updating product with ID:', id);
      console.log('Update data:', product);
      
      // Convert ProductFormData to match the database columns
      const dbProduct = {
        name: product.name,
        description: product.description,
        price: product.price,
        image_url: product.image_url,
        sale_url: product.sale_url,
        is_active: product.is_active,
        category_id: product.category_id === 'null' ? null : product.category_id
      };

      console.log('Database product object to update:', dbProduct);

      const { data, error } = await supabase
        .from('products')
        .update(dbProduct)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating product:', error);
        toast({
          title: 'Erro ao atualizar produto',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      console.log('Product updated successfully:', data);
      
      toast({
        title: 'Produto atualizado com sucesso',
        variant: 'default',
      });

      // Map database fields to our Product interface
      const updatedProduct: Product = {
        id: data.id,
        name: data.name,
        description: data.description || null,
        price: data.price,
        image_url: data.image_url || null,
        is_active: data.is_active === undefined ? true : data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at,
        sale_url: data.sale_url || '',
        category_id: data.category_id || null,
        categories: null // Updated product might not have categories loaded
      };
      
      return updatedProduct;
    },
    onSuccess: () => {
      console.log('Invalidating queries after product update');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Delete a product
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
