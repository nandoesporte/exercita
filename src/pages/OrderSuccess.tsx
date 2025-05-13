
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ShoppingBag, Store } from 'lucide-react';
import { useStore } from '@/hooks/useStore';

const OrderSuccess = () => {
  const { cart } = useStore();
  const navigate = useNavigate();
  
  // If user navigates here directly without checkout, redirect to store
  useEffect(() => {
    if (cart.length > 0) {
      // This means they didn't complete checkout
      navigate('/cart');
    }
  }, [cart, navigate]);
  
  return (
    <div className="container max-w-4xl mx-auto py-16 px-4">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Thank You for Your Order!</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Your order has been successfully placed.
        </p>
        
        <div className="bg-card rounded-xl border p-8 mb-8">
          <h2 className="text-xl font-semibold mb-4">Order Information</h2>
          
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Order Status
              </h3>
              <p className="text-lg font-medium">Confirmed</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Payment Method
              </h3>
              <p className="text-lg font-medium">Kiwify Payment</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Order Date
              </h3>
              <p className="text-lg font-medium">
                {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Estimated Delivery
              </h3>
              <p className="text-lg font-medium">Digital - Instant Access</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link to="/my-orders">
              <ShoppingBag className="h-5 w-5" />
              View My Orders
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link to="/store">
              <Store className="h-5 w-5" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
