
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '@/hooks/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, Package } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { orders, isLoadingOrders } = useStore();
  const [order, setOrder] = useState(null);
  
  useEffect(() => {
    if (orders.length > 0 && id) {
      const foundOrder = orders.find(o => o.id === id);
      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        toast.error('Order not found');
      }
    }
  }, [id, orders]);
  
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
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/my-orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
        </div>
        <Skeleton className="h-10 w-72 mb-8" />
        <div className="grid gap-8">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/my-orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The order you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/my-orders">Return to My Orders</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/my-orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Order Details</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-muted-foreground">Order #{order.id.substring(0, 8)}</span>
            <span>•</span>
            <span className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              {format(new Date(order.created_at), 'MMM d, yyyy')}
            </span>
          </div>
        </div>
        
        <div>
          {getStatusBadge(order.status)}
        </div>
      </div>
      
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            {order.order_items && order.order_items.length > 0 ? (
              <div className="space-y-4">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0">
                    <div className="w-16 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                      {item.product?.image_url ? (
                        <img 
                          src={item.product.image_url} 
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-grow">
                      <h3 className="font-medium">
                        {item.product?.name || 'Product'}
                      </h3>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(item.price)} x {item.quantity}
                        </span>
                        <span className="font-medium">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Total</span>
                    <span className="font-bold">{formatCurrency(order.total_amount)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No items found for this order.</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Payment Method</h3>
                <p>Kiwify Payment</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Payment Status</h3>
                <p>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Payment ID</h3>
                <p>{order.kiwify_order_id || 'Not available'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Payment Date</h3>
                <p>{format(new Date(order.created_at), 'MMM d, yyyy')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderDetail;
