import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, UserPlus, Crown, Shield, Edit, Trash2, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';

// Schema para criação de admin
const adminFormSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

type AdminFormValues = z.infer<typeof adminFormSchema>;

// Definição das permissões disponíveis
const AVAILABLE_PERMISSIONS = [
  { id: 'manage_workouts', label: 'Gerenciamento de Treinos', description: 'Criar, editar e excluir treinos' },
  { id: 'manage_exercises', label: 'Biblioteca de Exercícios', description: 'Gerenciar exercícios e categorias' },
  { id: 'manage_categories', label: 'Categorias', description: 'Gerenciar categorias de treinos' },
  { id: 'manage_products', label: 'Produtos', description: 'Gerenciar produtos da loja' },
  { id: 'manage_store', label: 'Loja', description: 'Configurações gerais da loja' },
  { id: 'manage_appointments', label: 'Agendamentos', description: 'Gerenciar consultas e horários' },
  { id: 'manage_payment_methods', label: 'Métodos de Pagamento', description: 'Configurar formas de pagamento' },
  { id: 'manage_gym_photos', label: 'Fotos da Academia', description: 'Gerenciar galeria de fotos' },
  { id: 'manage_users', label: 'Usuários', description: 'Gerenciar alunos/usuários' },
];

const AdminManagement = () => {
  const queryClient = useQueryClient();
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const isMobile = useIsMobile();

  // Buscar admins
  const { data: adminsData, isLoading: isLoadingAdmins, error } = useQuery({
    queryKey: ['admins'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  // Buscar permissões do admin selecionado
  const { data: adminPermissions } = useQuery({
    queryKey: ['admin-permissions', selectedAdmin?.id],
    queryFn: async () => {
      if (!selectedAdmin?.id) return [];
      
      const { data, error } = await supabase
        .from('admin_permissions')
        .select('permission')
        .eq('admin_id', selectedAdmin.id);
      
      if (error) throw new Error(error.message);
      return data.map(p => p.permission) || [];
    },
    enabled: !!selectedAdmin?.id && isPermissionsOpen,
  });

  // Criar admin
  const createAdminMutation = useMutation({
    mutationFn: async (adminData: AdminFormValues) => {
      // Usar a função de banco de dados segura para criar admin
      const { data, error } = await supabase.rpc('create_admin_user', {
        admin_email: adminData.email,
        admin_name: adminData.name,
        admin_password: adminData.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.message);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      setIsCreateAdminOpen(false);
      toast.success(`Admin criado! Instrua ${adminForm.getValues().email} a fazer signup com este email para ativar a conta.`);
      adminForm.reset();
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar admin: ${error.message}`);
    },
  });

  // Atualizar permissões
  const updatePermissionsMutation = useMutation({
    mutationFn: async (permissions: string[]) => {
      if (!selectedAdmin?.id) throw new Error('Admin não selecionado');

      // Remover permissões existentes
      await supabase
        .from('admin_permissions')
        .delete()
        .eq('admin_id', selectedAdmin.id);

      // Adicionar novas permissões
      if (permissions.length > 0) {
        const { error } = await supabase
          .from('admin_permissions')
          .insert(
            permissions.map(permission => ({
              admin_id: selectedAdmin.id,
              permission: permission as any,
            }))
          );

        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-permissions'] });
      setIsPermissionsOpen(false);
      toast.success('Permissões atualizadas com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar permissões: ${error.message}`);
    },
  });

  // Excluir admin
  const deleteAdminMutation = useMutation({
    mutationFn: async (adminId: string) => {
      const { error } = await supabase
        .from('admins')
        .delete()
        .eq('id', adminId);
      
      if (error) throw new Error(error.message);
      return adminId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      setIsDeleteDialogOpen(false);
      setSelectedAdmin(null);
      toast.success('Admin excluído com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir admin: ${error.message}`);
    },
  });

  // Toggle admin ativo/inativo
  const toggleAdminActiveMutation = useMutation({
    mutationFn: async ({ adminId, isActive }: { adminId: string, isActive: boolean }) => {
      const { error } = await supabase
        .from('admins')
        .update({ is_active: isActive })
        .eq('id', adminId);
      
      if (error) throw new Error(error.message);
      return { adminId, isActive };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast.success(
        data.isActive 
          ? 'Admin ativado com sucesso!' 
          : 'Admin desativado com sucesso!'
      );
    },
    onError: (error: Error) => {
      toast.error(`Erro ao alterar status do admin: ${error.message}`);
    },
  });

  const adminForm = useForm<AdminFormValues>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const handleToggleAdminActive = (adminId: string, currentStatus: boolean) => {
    toggleAdminActiveMutation.mutate({
      adminId,
      isActive: !currentStatus,
    });
  };

  const handleOpenPermissions = (admin: any) => {
    setSelectedAdmin(admin);
    setIsPermissionsOpen(true);
  };

  const handleSavePermissions = () => {
    updatePermissionsMutation.mutate(selectedPermissions);
  };

  // Atualizar selectedPermissions quando adminPermissions mudar
  React.useEffect(() => {
    if (adminPermissions) {
      setSelectedPermissions(adminPermissions);
    }
  }, [adminPermissions]);

  // Colunas da tabela
  const columns = [
    {
      accessorKey: 'name',
      header: 'Nome',
      cell: ({ row }: { row: { original: any } }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.original.name}</span>
          <Shield className="h-4 w-4 text-blue-500" />
        </div>
      )
    },
    {
      accessorKey: 'email',
      header: 'Email',
      hideOnMobile: true,
      cell: ({ row }: { row: { original: any } }) => (
        <span className="text-muted-foreground">{row.original.email}</span>
      )
    },
    {
      accessorKey: 'created_at',
      header: 'Criado em',
      hideOnMobile: true,
      cell: ({ row }: { row: { original: any } }) => (
        formatDistanceToNow(new Date(row.original.created_at), {
          addSuffix: true,
          locale: ptBR,
        })
      )
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }: { row: { original: any } }) => (
        <div className="flex items-center gap-2">
          {row.original.status === 'pending' ? (
            <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50">
              Pendente
            </Badge>
          ) : (
            <>
              <Switch
                checked={row.original.is_active}
                onCheckedChange={() => handleToggleAdminActive(row.original.id, row.original.is_active)}
              />
              <Badge variant={row.original.is_active ? "default" : "secondary"}>
                {row.original.is_active ? 'Ativo' : 'Inativo'}
              </Badge>
            </>
          )}
        </div>
      )
    },
    {
      accessorKey: 'actions',
      header: 'Ações',
      cell: ({ row }: { row: { original: any } }) => (
        <div className="flex items-center gap-2">
          {row.original.status === 'pending' ? (
            <span className="text-sm text-muted-foreground italic">
              Aguardando ativação
            </span>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenPermissions(row.original)}
              >
                <Settings className="h-4 w-4" />
                {!isMobile && 'Permissões'}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setSelectedAdmin(row.original);
                  setIsDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4" />
                {!isMobile && 'Excluir'}
              </Button>
            </>
          )}
        </div>
      )
    },
  ];

  if (error) {
    return (
      <div className="p-4 md:p-8 bg-red-50 border border-red-200 rounded-lg text-center">
        <p className="text-red-600 mb-4">Erro ao carregar admins: {(error as Error).message}</p>
        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['admins'] })}
          variant="outline"
          size={isMobile ? "sm" : "default"}
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-16 md:pb-0">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Gerenciamento de Admins</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie administradores e suas permissões
          </p>
        </div>
        <Dialog open={isCreateAdminOpen} onOpenChange={setIsCreateAdminOpen}>
          <DialogTrigger asChild>
            <Button size={isMobile ? "sm" : "default"}>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar novo administrador</DialogTitle>
            </DialogHeader>
            <Form {...adminForm}>
              <form onSubmit={adminForm.handleSubmit((data) => createAdminMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={adminForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome completo</FormLabel>
                      <FormControl>
                        <Input placeholder="João Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={adminForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="admin@exemplo.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={adminForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="******" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateAdminOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createAdminMutation.isPending}
                  >
                    {createAdminMutation.isPending && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Criar Admin
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Super Admin Info Card */}
      <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-lg text-yellow-800 dark:text-yellow-200">
              Gerenciamento de Administradores
            </CardTitle>
          </div>
          <CardDescription className="text-yellow-700 dark:text-yellow-300">
            Como Super Admin, você pode criar novos administradores e definir suas permissões específicas.
            Cada admin terá acesso apenas aos dados de seus próprios usuários.
            <br /><br />
            <strong>Como funciona:</strong> Quando você criar um admin, a conta ficará inativa até que o usuário faça o signup usando o mesmo email. Depois disso, a conta será ativada automaticamente com as permissões de admin.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Admins Table */}
      <Card>
        <CardHeader className={isMobile ? "px-3 py-2" : ""}>
          <CardTitle className={isMobile ? "text-base" : ""}>Administradores</CardTitle>
          <CardDescription className={isMobile ? "text-xs" : ""}>
            Lista de todos os administradores e suas configurações
          </CardDescription>
        </CardHeader>
        <CardContent className={isMobile ? "px-2 py-1" : ""}>
          <DataTable
            columns={columns}
            data={adminsData || []}
            isLoading={isLoadingAdmins}
          />
        </CardContent>
      </Card>

      {/* Permissions Dialog */}
      <Dialog open={isPermissionsOpen} onOpenChange={setIsPermissionsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Permissões - {selectedAdmin?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {AVAILABLE_PERMISSIONS.map((permission) => (
              <div key={permission.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id={permission.id}
                  checked={selectedPermissions.includes(permission.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedPermissions([...selectedPermissions, permission.id]);
                    } else {
                      setSelectedPermissions(selectedPermissions.filter(p => p !== permission.id));
                    }
                  }}
                />
                <div className="flex-1">
                  <Label htmlFor={permission.id} className="font-medium">
                    {permission.label}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {permission.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPermissionsOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSavePermissions}
              disabled={updatePermissionsMutation.isPending}
            >
              {updatePermissionsMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Salvar Permissões
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <p>
            Tem certeza que deseja excluir o administrador{" "}
            <span className="font-bold">{selectedAdmin?.name}</span>?
          </p>
          <p className="text-red-600 text-sm">
            Esta ação não pode ser desfeita e todos os dados associados serão perdidos.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedAdmin && deleteAdminMutation.mutate(selectedAdmin.id)}
              disabled={deleteAdminMutation.isPending}
            >
              {deleteAdminMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminManagement;