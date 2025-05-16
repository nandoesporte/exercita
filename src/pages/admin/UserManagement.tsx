import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { User, UserCheck, UserX, Search, RefreshCw, AlertTriangle, Trash2, UserPlus } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Define types for our functions' responses
type UserData = {
  id: string;
  email: string;
  raw_user_meta_data: {
    first_name?: string;
    last_name?: string;
    [key: string]: any;
  };
  created_at: string;
  last_sign_in_at: string | null;
  banned_until: string | null;
};

// Schema for new user form
const newUserSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  firstName: z.string().min(1, 'Nome é obrigatório'),
  lastName: z.string().min(1, 'Sobrenome é obrigatório'),
  isAdmin: z.boolean().optional(),
});

type NewUserFormValues = z.infer<typeof newUserSchema>;

const UserManagement = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const queryClient = useQueryClient();
  const [errorRetries, setErrorRetries] = useState(0);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);

  // Form for new user
  const form = useForm<NewUserFormValues>({
    resolver: zodResolver(newUserSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      isAdmin: false,
    },
  });

  // Fetch all users with their profiles and active status
  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-users', errorRetries],
    queryFn: async () => {
      try {
        console.log('Fetching users data...');
        // Fetch users from auth.users through a custom function
        const { data, error } = await supabase.rpc('get_all_users');
        
        if (error) {
          console.error('Error fetching users:', error);
          toast.error('Erro ao carregar usuários');
          throw error;
        }
        
        if (!data || data.length === 0) {
          console.log('No users found or empty response');
        } else {
          console.log(`Loaded ${data.length} users successfully`);
        }
        
        return data || [];
      } catch (err) {
        console.error('Unexpected error fetching users:', err);
        throw err;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
  
  // Manual retry handler with loading state
  const [isRetrying, setIsRetrying] = useState(false);
  
  const handleManualRetry = async () => {
    setIsRetrying(true);
    try {
      await refetch();
      toast.success('Tentativa de recarregar os dados realizada');
    } catch (err) {
      toast.error('Falha ao tentar novamente. Por favor, aguarde um momento e tente novamente.');
    } finally {
      setIsRetrying(false);
      setErrorRetries(prev => prev + 1);
    }
  };

  // Create new user
  const createUser = useMutation({
    mutationFn: async (values: NewUserFormValues) => {
      const userData = {
        user_email: values.email,
        user_password: values.password,
        user_metadata: {
          first_name: values.firstName,
          last_name: values.lastName
        }
      };
      
      // Use our custom RPC function to create the user
      // We need to manually type the response since TypeScript doesn't know about our custom function
      const { data, error: createError } = await supabase.rpc('admin_create_user', userData);
      
      if (createError) throw createError;
      
      const userId = data as string;
      
      // If admin flag is set, update the profile
      if (values.isAdmin && userId) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ is_admin: true })
          .eq('id', userId);
          
        if (profileError) throw profileError;
      }
      
      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Usuário criado com sucesso');
      setIsAddUserDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Erro ao criar usuário');
    }
  });

  // Toggle user active status
  const toggleUserStatus = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string, isActive: boolean }) => {
      const { error } = await supabase.rpc('toggle_user_active_status', {
        user_id: userId,
        is_active: isActive
      });
      
      if (error) throw error;
      
      return { userId, isActive };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(`Usuário ${data.isActive ? 'ativado' : 'desativado'} com sucesso`);
    },
    onError: (error) => {
      console.error('Error toggling user status:', error);
      toast.error('Erro ao atualizar status do usuário');
    }
  });

  // Delete user
  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      // Use our custom RPC function to delete the user
      // We need to manually pass the parameters in the correct format
      const { error } = await supabase.rpc('admin_delete_user', {
        user_id: userId
      });
      
      if (error) throw error;
      
      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Usuário excluído com sucesso');
      setUserToDelete(null);
    },
    onError: (error: any) => {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Erro ao excluir usuário');
    }
  });

  // Handle form submission
  const onSubmit = (values: NewUserFormValues) => {
    createUser.mutate(values);
  };

  // Filter users based on search query
  const filteredUsers = React.useMemo(() => {
    if (!users) return [];
    
    if (!searchQuery.trim()) return users;
    
    const query = searchQuery.toLowerCase().trim();
    return users.filter((user: UserData) => {
      const email = user.email?.toLowerCase() || '';
      const firstName = user.raw_user_meta_data?.first_name?.toLowerCase() || '';
      const lastName = user.raw_user_meta_data?.last_name?.toLowerCase() || '';
      const fullName = `${firstName} ${lastName}`.toLowerCase();
      
      return email.includes(query) || fullName.includes(query);
    });
  }, [users, searchQuery]);

  const columns = [
    {
      accessorKey: 'user',
      header: 'Usuário',
      cell: ({ row }: { row: { original: UserData } }) => {
        const user = row.original;
        const firstName = user.raw_user_meta_data?.first_name || '';
        const lastName = user.raw_user_meta_data?.last_name || '';
        const email = user.email || '';
        
        return (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-fitness-green">
                {firstName.charAt(0) || ''}{lastName.charAt(0) || ''}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{firstName} {lastName}</p>
              <p className="text-xs text-muted-foreground">{email}</p>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'created_at',
      header: 'Data de Registro',
      cell: ({ row }: { row: { original: UserData } }) => {
        return format(new Date(row.original.created_at), 'dd/MM/yyyy');
      }
    },
    {
      accessorKey: 'last_sign_in_at',
      header: 'Último Login',
      cell: ({ row }: { row: { original: UserData } }) => {
        const lastSignIn = row.original.last_sign_in_at;
        return lastSignIn ? format(new Date(lastSignIn), 'dd/MM/yyyy HH:mm') : 'Nunca';
      }
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }: { row: { original: UserData } }) => {
        const isActive = !row.original.banned_until;
        
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={isActive}
              onCheckedChange={(checked) => {
                toggleUserStatus.mutate({
                  userId: row.original.id,
                  isActive: checked
                });
              }}
            />
            <span className={isActive ? 'text-green-600' : 'text-red-600'}>
              {isActive ? 'Ativo' : 'Desativado'}
            </span>
          </div>
        );
      }
    },
    {
      accessorKey: 'actions',
      header: 'Ações',
      cell: ({ row }: { row: { original: UserData } }) => {        
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setUserToDelete(row.original)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
              <span className="sr-only">Excluir Usuário</span>
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="container p-4 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <User className="h-7 w-7 text-fitness-green" />
        <h1 className="text-3xl font-bold text-[#000000] tracking-tight">
          Gerenciamento de Usuários
        </h1>
      </div>
      
      <p className="text-lg text-[#000000e6] dark:text-gray-300 mb-6 max-w-3xl leading-relaxed">
        Gerencie os usuários do aplicativo, adicionando novos usuários ou ativando/desativando o acesso deles ao sistema.
      </p>
      
      {/* Search and Actions Row */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            className="pl-10 bg-white dark:bg-fitness-darkGray border-gray-200 dark:border-gray-700 text-[#222222] dark:text-white"
            placeholder="Filtrar por nome ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsAddUserDialogOpen(true)}
            className="bg-fitness-green hover:bg-fitness-green/90 text-white flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Adicionar Usuário
          </Button>
          
          {error && (
            <Button 
              variant="outline" 
              onClick={handleManualRetry}
              disabled={isRetrying}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
              Tentar novamente
            </Button>
          )}
        </div>
      </div>
      
      {error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <AlertTriangle className="h-10 w-10 mx-auto text-red-500 mb-2" />
          <p className="text-red-800 dark:text-red-200 mb-4 font-medium text-lg">
            Ocorreu um erro ao carregar os usuários.
          </p>
          <p className="text-red-700 dark:text-red-300 mb-6 max-w-md mx-auto">
            Não foi possível conectar ao servidor ou ocorreu um problema ao buscar os dados dos usuários. 
            Por favor, tente novamente.
          </p>
          <Button 
            variant="destructive" 
            onClick={handleManualRetry}
            disabled={isRetrying}
            className="mx-auto flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
            Tentar novamente
          </Button>
        </div>
      ) : (
        <div className="bg-white dark:bg-fitness-darkGray rounded-lg shadow">
          <DataTable
            columns={columns}
            data={filteredUsers}
            isLoading={isLoading || isRetrying}
          />
        </div>
      )}

      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Usuário</DialogTitle>
            <DialogDescription>
              Preencha os dados abaixo para criar um novo usuário no sistema.
            </DialogDescription>
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
                      <Input type="password" placeholder="••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              <FormField
                control={form.control}
                name="isAdmin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Permissão de Administrador</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Este usuário terá acesso ao painel administrativo.
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button 
                  type="submit"
                  disabled={createUser.isPending} 
                  className="bg-fitness-green hover:bg-fitness-green/90"
                >
                  {createUser.isPending && (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Criar Usuário
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário{' '}
              <span className="font-semibold">
                {userToDelete?.raw_user_meta_data?.first_name} {userToDelete?.raw_user_meta_data?.last_name}
              </span>? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToDelete && deleteUser.mutate(userToDelete.id)}
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteUser.isPending}
            >
              {deleteUser.isPending && (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              )}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagement;
