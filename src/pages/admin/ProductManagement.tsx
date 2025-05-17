
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Trash2, PenSquare, ExternalLink, Star
} from 'lucide-react';
import { useAdminStore } from '@/hooks/useAdminStore';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DataTable } from "@/components/ui/data-table";
import { formatCurrency } from '@/lib/utils';

const ProductManagement = () => {
  const navigate = useNavigate();
  const { products, isLoadingProducts, deleteProduct, toggleFeaturedProduct } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateNew = () => {
    navigate('/admin/products/create');
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/products/${id}/edit`);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await deleteProduct(deleteId);
      setDeleteId(null);
    }
  };

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      // Use the updated format to match the mutationFn parameter
      await toggleFeaturedProduct({ 
        id, 
        isFeatured: !currentStatus 
      });
      toast.success(currentStatus ? 'Produto removido dos destaques' : 'Produto adicionado aos destaques');
    } catch (error) {
      console.error('Erro ao atualizar status de destaque:', error);
      toast.error('Erro ao atualizar status de destaque do produto');
    }
  };

  const columns = [
    {
      accessorKey: 'image_url',
      header: 'Imagem',
      cell: ({ row }: { row: { original: any } }) => (
        <div className="h-10 w-10 rounded overflow-hidden">
          <img 
            src={row.original.image_url || '/placeholder.svg'} 
            alt={row.original.name}
            className="h-full w-full object-cover"
          />
        </div>
      )
    },
    {
      accessorKey: 'name',
      header: 'Nome'
    },
    {
      accessorKey: 'price',
      header: 'Preço',
      cell: ({ row }: { row: { original: any } }) => formatCurrency(row.original.price)
    },
    {
      accessorKey: 'categories.name',
      header: 'Categoria',
      cell: ({ row }: { row: { original: any } }) => row.original.categories?.name || 'Sem categoria'
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }: { row: { original: any } }) => (
        row.original.is_active ? 
          <Star className="h-5 w-5 text-amber-400" /> : 
          <span className="text-muted-foreground">Inativo</span>
      )
    },
    {
      accessorKey: 'is_featured',
      header: 'Destaque',
      cell: ({ row }: { row: { original: any } }) => (
        <div className="flex items-center gap-2">
          <Switch 
            checked={row.original.is_featured} 
            onCheckedChange={() => handleToggleFeatured(row.original.id, row.original.is_featured)}
          />
          <span className="text-xs text-muted-foreground">
            {row.original.is_featured ? 'Destaque' : 'Normal'}
          </span>
        </div>
      )
    },
    {
      accessorKey: 'actions',
      header: 'Ações',
      cell: ({ row }: { row: { original: any } }) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <a href={row.original.sale_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              <span className="sr-only">Ver link</span>
            </a>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(row.original.id)}
          >
            <PenSquare className="h-4 w-4" />
            <span className="sr-only">Editar</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteClick(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Excluir</span>
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gerenciamento de Produtos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os produtos da loja e defina quais aparecem na página inicial
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Criar Novo
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          placeholder="Buscar produtos..." 
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredProducts}
          isLoading={isLoadingProducts}
        />
      </div>
      
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O produto será permanentemente excluído.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductManagement;
