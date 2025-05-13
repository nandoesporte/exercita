
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/hooks/useStore';
import { Button } from '@/components/ui/button';
import { CartItemComponent } from '@/components/store/CartItem';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, ChevronLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const Cart = () => {
  const { cart, updateCartItemQuantity, removeFromCart, clearCart, cartTotal } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };
  
  const handleCheckout = () => {
    if (!user) {
      toast.error('Please login to continue to checkout');
      navigate('/login');
      return;
    }
    
    navigate('/checkout');
  };
  
  if (cart.length === 0) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        
        <div className="text-center max-w-md mx-auto py-12">
          <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold mt-4 mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Button asChild size="lg">
            <Link to="/store">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/store">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
          </div>
          
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
          
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={clearCart} size="sm">
              Clear Cart
            </Button>
          </div>
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
                onClick={handleCheckout}
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;
