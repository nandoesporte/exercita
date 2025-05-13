
import React, { useState } from 'react';
import { useAdminStore, OrderWithItems } from '@/hooks/useAdminStore';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { 
  Dialog, 
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { Eye, Package } from 'lucide-react';

const OrderManagement = () => {
  const { orders, isLoadingOrders, updateOrderStatus, isUpdatingOrderStatus } = useAdminStore();
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };
  
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800' },
      processing: { color: 'bg-blue-100 text-blue-800' },
      completed: { color: 'bg-green-100 text-green-800' },
      cancelled: { color: 'bg-red-100 text-red-800' },
      refunded: { color: 'bg-purple-100 text-purple-800' },
    };
    
    const color = statusConfig[status]?.color || statusConfig.pending.color;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  
  const handleStatusChange = async (orderId: string, status: string) => {
    await updateOrderStatus({ orderId, status });
  };
  
  const columns = [
    {
      accessorKey: 'id',
      header: 'Order ID',
      cell: ({ row }) => (
        <div className="font-medium">#{row.original.id.substring(0, 8)}</div>
      ),
    },
    {
      accessorKey: 'user',
      header: 'Customer',
      cell: ({ row }) => {
        const user = row.original.user;
        if (!user) return 'Guest';
        
        const name = user.user_metadata?.full_name || user.email;
        return (
          <div>
            <div className="font-medium">{name}</div>
            {name !== user.email && <div className="text-xs text-muted-foreground">{user.email}</div>}
          </div>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Date',
      cell: ({ row }) => format(new Date(row.original.created_at), 'MMM d, yyyy'),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: 'total_amount',
      header: 'Total',
      cell: ({ row }) => formatCurrency(row.original.total_amount),
    },
    {
      accessorKey: 'status_action',
      header: 'Update Status',
      cell: ({ row }) => (
        <Select
          defaultValue={row.original.status}
          onValueChange={(value) => handleStatusChange(row.original.id, value)}
          disabled={isUpdatingOrderStatus}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      accessorKey: 'actions',
      header: 'View',
      cell: ({ row }) => (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setSelectedOrder(row.original)}
        >
          <Eye className="h-4 w-4 mr-2" />
          Details
        </Button>
      ),
    },
  ];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">Manage customer orders</p>
      </div>
      
      <DataTable
        columns={columns}
        data={orders}
        isLoading={isLoadingOrders}
      />
      
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.id.substring(0, 8)} • {selectedOrder && format(new Date(selectedOrder.created_at), 'MMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2">Customer</h3>
                  <p>
                    {selectedOrder.user?.user_metadata?.full_name || 'Guest User'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.user?.email || 'No email provided'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-2">Payment Info</h3>
                  <p className="flex items-center">
                    Status: {getStatusBadge(selectedOrder.status)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Kiwify Order ID: {selectedOrder.kiwify_order_id || 'N/A'}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold mb-2">Order Items</h3>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="py-2 px-4 text-left text-xs font-semibold">Product</th>
                        <th className="py-2 px-4 text-right text-xs font-semibold">Price</th>
                        <th className="py-2 px-4 text-right text-xs font-semibold">Qty</th>
                        <th className="py-2 px-4 text-right text-xs font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.order_items.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded bg-muted overflow-hidden mr-3">
                                {item.product.image_url ? (
                                  <img 
                                    src={item.product.image_url} 
                                    alt={item.product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{item.product.name}</p>
                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {item.product.description}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {item.quantity}
                          </td>
                          <td className="py-3 px-4 text-right font-medium">
                            {formatCurrency(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                      
                      <tr className="border-t bg-muted/50">
                        <td colSpan={3} className="py-3 px-4 text-right font-semibold">
                          Total
                        </td>
                        <td className="py-3 px-4 text-right font-bold">
                          {formatCurrency(selectedOrder.total_amount)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Select
                  value={selectedOrder.status}
                  onValueChange={(value) => handleStatusChange(selectedOrder.id, value)}
                  disabled={isUpdatingOrderStatus}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Update status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderManagement;
