
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Product } from '@/hooks/useStore';

export type OrderWithItems = {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  kiwify_order_id: string | null;
  created_at: string;
  updated_at: string;
  order_items: {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    price: number;
    product: Product;
  }[];
  user?: {
    email: string;
    user_metadata: {
      full_name?: string;
    };
  };
};

export type ProductFormData = {
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_active?: boolean;
};

export function useAdminStore() {
  const queryClient = useQueryClient();
  
  // Fetch all products for admin
  const productsQuery = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data as Product[];
      } catch (error: any) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
        return [];
      }
    },
  });
  
  // Fetch a single product by ID
  const fetchProduct = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Product;
    } catch (error: any) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product details');
      throw error;
    }
  };
  
  // Create new product
  const createProductMutation = useMutation({
    mutationFn: async (formData: ProductFormData) => {
      try {
        const { data, error } = await supabase
          .from('products')
          .insert({
            name: formData.name,
            description: formData.description || null,
            price: formData.price,
            image_url: formData.image_url || null,
            is_active: formData.is_active !== undefined ? formData.is_active : true,
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error: any) {
        console.error('Error creating product:', error);
        toast.error('Failed to create product');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product created successfully');
    },
  });
  
  // Update product
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, ...formData }: ProductFormData & { id: string }) => {
      try {
        const { data, error } = await supabase
          .from('products')
          .update({
            name: formData.name,
            description: formData.description || null,
            price: formData.price,
            image_url: formData.image_url || null,
            is_active: formData.is_active !== undefined ? formData.is_active : true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error: any) {
        console.error('Error updating product:', error);
        toast.error('Failed to update product');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product updated successfully');
    },
  });
  
  // Delete product
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
      } catch (error: any) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted successfully');
    },
  });
  
  // Fetch all orders with details for admin
  const ordersQuery = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      try {
        // Fetch orders with order items and product info
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select(`
            *,
            order_items:order_items(
              *,
              product:product_id(*)
            )
          `)
          .order('created_at', { ascending: false });
        
        if (ordersError) throw ordersError;
        
        // Get user information for each order
        const ordersWithUserInfo = await Promise.all(
          orders.map(async (order) => {
            if (!order.user_id) return order;
            
            const { data: userData, error: userError } = await supabase.auth.admin.getUserById(order.user_id);
            
            if (userError || !userData) {
              console.warn('Could not fetch user data for order:', order.id);
              return order;
            }
            
            return { ...order, user: userData.user };
          })
        );
        
        return ordersWithUserInfo as OrderWithItems[];
      } catch (error: any) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
        return [];
      }
    },
  });
  
  // Update order status
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .update({
            status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error: any) {
        console.error('Error updating order status:', error);
        toast.error('Failed to update order status');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order status updated successfully');
    },
  });
  
  return {
    products: productsQuery.data || [],
    isLoadingProducts: productsQuery.isLoading,
    fetchProduct,
    createProduct: createProductMutation.mutate,
    isCreatingProduct: createProductMutation.isPending,
    updateProduct: updateProductMutation.mutate,
    isUpdatingProduct: updateProductMutation.isPending,
    deleteProduct: deleteProductMutation.mutate,
    isDeletingProduct: deleteProductMutation.isPending,
    orders: ordersQuery.data || [],
    isLoadingOrders: ordersQuery.isLoading,
    updateOrderStatus: updateOrderStatusMutation.mutate,
    isUpdatingOrderStatus: updateOrderStatusMutation.isPending,
  };
}
