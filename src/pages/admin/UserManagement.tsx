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
import { useIsMobile } from '@/hooks/use-mobile';

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
  
  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      console.log("Fetching users for user management page...");
      const { data, error } = await supabase.rpc('debug_get_all_users');
      
      if (error) {
        console.error("Erro ao carregar usuários:", error);
        throw new Error(`Erro ao carregar usuários: ${error.message}`);
      }
      
      console.log("User data received:", data?.length || 0, "users");
      if (data && data.length > 0) {
        console.log("First user data structure:", data[0]);
      }
      
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

  // Create user mutation - With improved success messaging and detailed logging
  const createUserMutation = useMutation({
    mutationFn: async (userData: FormValues) => {
      console.log("Creating user with:", userData.email, "and metadata:", {
        first_name: userData.firstName,
        last_name: userData.lastName,
      });
      
      // Using the admin_create_user RPC function which runs with elevated privileges
      const { data, error } = await supabase.rpc('admin_create_user', {
        user_email: userData.email,
        user_password: userData.password,
        user_metadata: {
          first_name: userData.firstName,
          last_name: userData.lastName,
        }
      });
      
      if (error) {
        console.error("Error creating user:", error);
        throw new Error(error.message);
      }
      
      console.log("User created successfully:", data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsCreateUserOpen(false);
      
      // Extract the user's email from the returned data for a more personalized success message
      const email = data?.email || '';
      const fullName = `${data?.user_metadata?.first_name || ''} ${data?.user_metadata?.last_name || ''}`.trim();
      const userInfo = fullName ? `${fullName} (${email})` : email;
      
      toast.success(`Usuário ${userInfo} criado com sucesso! Este usuário já está com email confirmado e pode fazer login imediatamente.`);
      form.reset();
    },
    onError: (error: Error) => {
      console.error("User creation failed:", error);
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
  
  const isMobile = useIsMobile();

  // Define columns for the user table with responsive considerations
  const columns = [
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }: { row: { original: any } }) => {
        // For mobile, we'll show a shorter version
        if (isMobile) {
          const email = row.original.email || '';
          return email.length > 20 ? email.substring(0, 17) + '...' : email;
        }
        return row.original.email;
      }
    },
    {
      accessorKey: 'name',
      header: 'Nome',
      cell: ({ row }: { row: { original: any } }) => {
        const userData = row.original.raw_user_meta_data || {};
        const firstName = userData.first_name || '';
        const lastName = userData.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim();
        
        // For mobile, we'll only show the first name if it's too long
        if (isMobile && fullName.length > 12 && firstName) {
          return firstName;
        }
        
        return fullName || 'N/A';
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
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: { original: any } }) => {
        const isActive = !row.original.banned_until;
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={isActive}
              onCheckedChange={() => handleToggleUserActive(row.original.user_id, isActive)}
              className={isMobile ? "scale-75" : ""}
            />
            <span className={`${isActive ? 'text-green-600' : 'text-red-600'} ${isMobile ? "text-xs" : ""}`}>
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
            size={isMobile ? "sm" : "default"}
            className={isMobile ? "px-2 h-7 text-xs" : ""}
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

  // Define which columns to show on mobile
  const mobileColumns = isMobile ? [
    columns[0], // Email
    columns[1], // Nome
    columns[3], // Status
    columns[4], // Ações
  ] : columns;

  if (error) {
    return (
      <div className="p-4 md:p-8 bg-red-50 border border-red-200 rounded-lg text-center">
        <p className="text-red-600 mb-4 text-sm md:text-base">Erro ao carregar usuários: {(error as Error).message}</p>
        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-users'] })}
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
        <h1 className="text-xl font-bold">Gerenciamento de Usuários</h1>
        <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
          <DialogTrigger asChild>
            <Button size={isMobile ? "sm" : "default"}>
              <UserPlus className="h-4 w-4 mr-2" />
              {!isMobile && "Novo Usuário"}
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
                        <Input placeholder="email@exemplo.com" type="email" autoComplete="email" {...field} />
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
                        <Input type="password" placeholder="******" autoComplete="new-password" {...field} />
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
        <CardHeader className={isMobile ? "px-3 py-2" : ""}>
          <CardTitle className={isMobile ? "text-base" : ""}>Usuários</CardTitle>
          <CardDescription className={isMobile ? "text-xs" : ""}>
            Gerencie os usuários do sistema, ative, desative ou exclua conforme necessário.
          </CardDescription>
        </CardHeader>
        <CardContent className={isMobile ? "px-2 py-1" : ""}>
          <DataTable
            columns={isMobile ? [
              columns[0], // Email
              columns[1], // Nome
              columns[3], // Status
              columns[4], // Ações
            ] : columns}
            data={usersData || []}
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
