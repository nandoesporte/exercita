
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, UserPlus, UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
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
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Define o schema para validação do formulário
const formSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  firstName: z.string().min(1, 'Nome é obrigatório'),
  lastName: z.string().min(1, 'Sobrenome é obrigatório'),
});

type FormValues = z.infer<typeof formSchema>;

const UserManagement = () => {
  const queryClient = useQueryClient();
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch all users
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      console.log("Fetching users for user management page...");
      const { data, error } = await supabase.rpc('debug_get_all_users');
      
      if (error) {
        console.error("Erro ao carregar usuários:", error);
        throw new Error(`Erro ao carregar usuários: ${error.message}`);
      }
      
      console.log("User data received:", data?.length || 0, "users");
      return data || [];
    },
  });

  // Toggle user active status
  const toggleUserActiveMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string, isActive: boolean }) => {
      const { error } = await supabase.rpc('toggle_user_active_status', {
        user_id: userId,
        is_active: isActive,
      });
      
      if (error) throw new Error(error.message);
      return { userId, isActive };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(
        data.isActive 
          ? 'Usuário ativado com sucesso!' 
          : 'Usuário desativado com sucesso!'
      );
    },
    onError: (error: Error) => {
      toast.error(`Erro ao alterar status do usuário: ${error.message}`);
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: FormValues) => {
      const { data, error } = await supabase.rpc('admin_create_user', {
        user_email: userData.email,
        user_password: userData.password,
        user_metadata: {
          first_name: userData.firstName,
          last_name: userData.lastName,
        },
      });
      
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsCreateUserOpen(false);
      toast.success('Usuário criado com sucesso!');
      form.reset();
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar usuário: ${error.message}`);
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc('admin_delete_user', {
        user_id: userId,
      });
      
      if (error) throw new Error(error.message);
      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      toast.success('Usuário excluído com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir usuário: ${error.message}`);
    },
  });

  const handleToggleUserActive = (userId: string, currentStatus: boolean) => {
    toggleUserActiveMutation.mutate({
      userId,
      isActive: !currentStatus,
    });
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    createUserMutation.mutate(values);
  };

  // Define columns for the user table
  const columns = [
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'raw_user_meta_data',
      header: 'Nome',
      cell: ({ row }: { row: { original: any } }) => {
        const userData = row.original.raw_user_meta_data || {};
        const firstName = userData.first_name || '';
        const lastName = userData.last_name || '';
        return `${firstName} ${lastName}`.trim() || 'N/A';
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Cadastro',
      cell: ({ row }: { row: { original: any } }) => {
        return row.original.created_at
          ? formatDistanceToNow(new Date(row.original.created_at), {
              addSuffix: true,
              locale: ptBR,
            })
          : 'N/A';
      },
    },
    {
      accessorKey: 'banned_until',
      header: 'Status',
      cell: ({ row }: { row: { original: any } }) => {
        const isActive = !row.original.banned_until;
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={isActive}
              onCheckedChange={() => handleToggleUserActive(row.original.user_id, isActive)}
            />
            <span className={isActive ? 'text-green-600' : 'text-red-600'}>
              {isActive ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'actions',
      header: 'Ações',
      cell: ({ row }: { row: { original: any } }) => {
        return (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              setSelectedUser(row.original);
              setIsDeleteDialogOpen(true);
            }}
          >
            Excluir
          </Button>
        );
      },
    },
  ];

  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-lg text-center">
        <p className="text-red-600 mb-4">Erro ao carregar usuários: {(error as Error).message}</p>
        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-users'] })}
          variant="outline"
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
        <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar novo usuário</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="email@exemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
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
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sobrenome</FormLabel>
                      <FormControl>
                        <Input placeholder="Sobrenome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateUserOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createUserMutation.isPending}
                  >
                    {createUserMutation.isPending && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Salvar
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* User Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários</CardTitle>
          <CardDescription>
            Gerencie os usuários do sistema, ative, desative ou exclua conforme necessário.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={users || []}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <p>
            Tem certeza que deseja excluir o usuário{" "}
            <span className="font-bold">{selectedUser?.email}</span>?
          </p>
          <p className="text-red-600 text-sm">
            Esta ação não pode ser desfeita.
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
              onClick={() => selectedUser && deleteUserMutation.mutate(selectedUser.user_id)}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending && (
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

export default UserManagement;
