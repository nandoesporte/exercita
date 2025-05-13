
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/hooks/useStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CartItemComponent } from '@/components/store/CartItem';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';

const Checkout = () => {
  const { cart, updateCartItemQuantity, removeFromCart, cartTotal, createOrder, isCreatingOrder } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  useEffect(() => {
    // Redirect to cart if cart is empty
    if (cart.length === 0) {
      navigate('/cart');
    }
    
    // Redirect to login if not authenticated
    if (!user) {
      toast.error('Please login to continue checkout');
      navigate('/login');
    }
  }, [cart, user, navigate]);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };
  
  const handleCompleteOrder = async () => {
    try {
      setIsRedirecting(true);
      
      // Generate a "fake" kiwify_order_id for demo
      // In a real implementation, you would redirect to Kiwify for payment
      const kiwifyOrderId = `kiwify_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      
      // Create the order in our system
      await createOrder({ kiwifyOrderId });
      
      // In a real implementation, you would redirect to Kiwify's payment page
      // For this demo, we'll just redirect to a success page
      navigate('/order-success');
      
    } catch (error) {
      console.error('Error completing order:', error);
      toast.error('Failed to complete your order. Please try again.');
      setIsRedirecting(false);
    }
  };
  
  if (cart.length === 0 || !user) {
    return null; // Will be redirected by the useEffect
  }
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/cart">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Cart
              </Link>
            </Button>
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cart.map((item) => (
                  <CartItemComponent
                    key={item.product.id}
                    item={item}
                    onUpdateQuantity={updateCartItemQuantity}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">
                When you click "Complete Order", you will be redirected to Kiwify's secure payment platform to complete your purchase. You can pay using credit card, PIX, or bank transfer.
              </p>
              
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Kiwify Payment Demo</h3>
                <p className="text-muted-foreground text-sm">
                  For demonstration purposes, clicking "Complete Order" will simulate a successful Kiwify payment.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Subtotal ({cart.reduce((total, item) => total + item.quantity, 0)} items)
                  </span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>Free</span>
                </div>
              </div>
              
              <div className="border-t my-4 pt-4">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span className="text-lg">{formatCurrency(cartTotal)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                size="lg" 
                onClick={handleCompleteOrder}
                disabled={isCreatingOrder || isRedirecting}
              >
                {isCreatingOrder || isRedirecting ? 'Processing...' : 'Complete Order'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
