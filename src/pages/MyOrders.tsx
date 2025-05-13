
import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/hooks/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BadgeCheck, Calendar, ExternalLink, Store } from 'lucide-react';
import { format } from 'date-fns';

const MyOrders = () => {
  const { orders, isLoadingOrders } = useStore();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };
  
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      processing: { color: 'bg-blue-100 text-blue-800', label: 'Processing' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
      refunded: { color: 'bg-purple-100 text-purple-800', label: 'Refunded' },
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };
  
  if (isLoadingOrders) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="mt-4">
                    <Skeleton className="h-9 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (orders.length === 0) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        <div className="text-center max-w-md mx-auto py-12">
          <div className="rounded-full bg-muted h-16 w-16 flex items-center justify-center mx-auto">
            <BadgeCheck className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mt-4 mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-8">
            You haven't made any purchases yet. Browse our store to find products you'll love!
          </p>
          <Button asChild size="lg">
            <Link to="/store">Shop Now</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">My Orders</h1>
      <p className="text-muted-foreground mb-8">View and track your order history.</p>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <CardTitle>Order #{order.id.substring(0, 8)}</CardTitle>
                  {getStatusBadge(order.status)}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  {format(new Date(order.created_at), 'MMM d, yyyy')}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between gap-2">
                  <div className="text-sm text-muted-foreground">
                    Products: {order.order_items?.length || 0} items
                  </div>
                  <div className="font-medium">
                    Total: {formatCurrency(order.total_amount)}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  <Button asChild variant="outline" size="sm" className="sm:w-auto">
                    <Link to={`/order/${order.id}`}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Order Details
                    </Link>
                  </Button>
                  
                  <Button asChild variant="secondary" size="sm" className="sm:w-auto">
                    <Link to="/store">
                      <Store className="h-4 w-4 mr-2" />
                      Order Again
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
