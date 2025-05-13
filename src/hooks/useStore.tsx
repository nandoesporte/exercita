
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export function useStore() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // State for cart management
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);
  
  // Fetch all products
  const productsQuery = useQuery({
    queryKey: ['products'],
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
  
  // Add item to cart
  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return currentCart.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      } else {
        return [...currentCart, { product, quantity }];
      }
    });
    
    toast.success(`${product.name} added to cart`);
  };
  
  // Update cart item quantity
  const updateCartItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(currentCart => 
      currentCart.map(item => 
        item.product.id === productId 
          ? { ...item, quantity } 
          : item
      )
    );
  };
  
  // Remove item from cart
  const removeFromCart = (productId: string) => {
    setCart(currentCart => currentCart.filter(item => item.product.id !== productId));
    toast.success('Item removed from cart');
  };
  
  // Clear entire cart
  const clearCart = () => {
    setCart([]);
  };
  
  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);
  
  // Create order
  const createOrderMutation = useMutation({
    mutationFn: async ({ 
      kiwifyOrderId = null 
    }: { 
      kiwifyOrderId?: string | null 
    }) => {
      try {
        if (!user) throw new Error('User must be logged in to create an order');
        if (cart.length === 0) throw new Error('Cart cannot be empty');
        
        // Create the order
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: user.id,
            total_amount: cartTotal,
            kiwify_order_id: kiwifyOrderId,
          })
          .select()
          .single();
        
        if (orderError) throw orderError;
        
        // Create order items
        const orderItems = cart.map(item => ({
          order_id: orderData.id,
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        }));
        
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);
        
        if (itemsError) throw itemsError;
        
        return orderData;
      } catch (error: any) {
        console.error('Error creating order:', error);
        toast.error('Failed to create order');
        throw error;
      }
    },
    onSuccess: () => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
  
  // Fetch user orders
  const ordersQuery = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      try {
        if (!user) return [];
        
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items:order_items(
              *,
              product:product_id(*)
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
      } catch (error: any) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
        return [];
      }
    },
    enabled: !!user,
  });
  
  return {
    products: productsQuery.data || [],
    isLoadingProducts: productsQuery.isLoading,
    fetchProduct,
    cart,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    cartItemsCount: cart.reduce((count, item) => count + item.quantity, 0),
    createOrder: createOrderMutation.mutate,
    isCreatingOrder: createOrderMutation.isPending,
    orders: ordersQuery.data || [],
    isLoadingOrders: ordersQuery.isLoading,
  };
}
