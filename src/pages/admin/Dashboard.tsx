
import React, { useState } from 'react';
import { BarChart3, Users, Dumbbell, CalendarCheck, ArrowUp, ArrowDown, Loader2, UserPlus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Define form schema for user creation
const formSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  firstName: z.string().min(1, 'Nome é obrigatório'),
  lastName: z.string().min(1, 'Sobrenome é obrigatório'),
});

type FormValues = z.infer<typeof formSchema>;

const Dashboard = () => {
  const queryClient = useQueryClient();
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      // Get counts from different tables
      const [usersResult, workoutsResult, appointmentsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('workouts').select('id', { count: 'exact', head: true }),
        supabase.from('appointments').select('id', { count: 'exact', head: true }),
      ]);
      
      if (usersResult.error) throw new Error(usersResult.error.message);
      if (workoutsResult.error) throw new Error(workoutsResult.error.message);
      if (appointmentsResult.error) throw new Error(appointmentsResult.error.message);
      
      return {
        users: usersResult.count || 0,
        workouts: workoutsResult.count || 0,
        appointments: appointmentsResult.count || 0,
      };
    },
  });
  
  // Fetch users for the recent activity section
  const { data: recentUsers, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['admin-dashboard-users'],
    queryFn: async () => {
      console.log("Fetching users with debug_get_all_users function");
      const { data, error } = await supabase.rpc('debug_get_all_users');
      
      if (error) {
        console.error("Error fetching users:", error);
        throw new Error(error.message);
      }
      
      console.log("User data returned:", data);
      console.log("First user structure:", data?.[0]);
      
      return (data || []).slice(0, 5).map(user => ({
        id: user.user_id,
        email: user.email,
        user: (user.raw_user_meta_data?.first_name || '') + ' ' + (user.raw_user_meta_data?.last_name || ''),
        time: user.created_at,
        isActive: !user.banned_until,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${user.raw_user_meta_data?.first_name || user.email}`,
      }));
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
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-users'] });
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
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-users'] });
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
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-users'] });
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

  // Create stats array based on real data
  const stats = [
    { 
      title: 'Total Users', 
      value: statsLoading ? '...' : statsData?.users.toString(), 
      change: '+12%', // These would ideally come from comparing current vs previous time period
      trend: 'up', 
      icon: Users,
      isLoading: statsLoading
    },
    { 
      title: 'Active Workouts', 
      value: statsLoading ? '...' : statsData?.workouts.toString(), 
      change: '+5%', 
      trend: 'up', 
      icon: Dumbbell,
      isLoading: statsLoading
    },
    { 
      title: 'Appointments', 
      value: statsLoading ? '...' : statsData?.appointments.toString(), 
      change: '+18%', 
      trend: 'up', 
      icon: CalendarCheck,
      isLoading: statsLoading
    },
    { 
      title: 'Revenue', 
      value: '$12,540', // Mock data for now - would need a payments table
      change: '-2%', 
      trend: 'down', 
      icon: BarChart3,
      isLoading: false
    },
  ];

  return (
    <div className="space-y-6 pb-0">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <h3 className="text-2xl font-bold mt-1">
                  {stat.isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    stat.value
                  )}
                </h3>
              </div>
              <div className="p-2 rounded-md bg-secondary">
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              {stat.trend === 'up' ? (
                <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                {stat.change}
              </span>
              <span className="text-xs text-muted-foreground ml-2">vs last month</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent User Activity with User Management */}
        <div className="lg:col-span-2 bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Usuários Recentes</h2>
            <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
              <Button onClick={() => setIsCreateUserOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
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
          
          {usersError ? (
            <div className="p-4 rounded-md bg-red-50 border border-red-200">
              <p className="text-red-600">{(usersError as Error).message}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-dashboard-users'] })}
              >
                Tentar novamente
              </Button>
            </div>
          ) : usersLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-fitness-green mr-2" />
              <span>Carregando usuários...</span>
            </div>
          ) : recentUsers && recentUsers.length > 0 ? (
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                      <img
                        src={user.avatar}
                        alt={user.user || user.email}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`;
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">{user.user || 'Novo Usuário'}</h3>
                      <div className="text-sm text-muted-foreground flex flex-col sm:flex-row sm:items-center gap-1">
                        <span>{user.email}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>
                          {user.time ? formatDistanceToNow(new Date(user.time), { addSuffix: true, locale: ptBR }) : 'Recentemente'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.isActive}
                        onCheckedChange={() => handleToggleUserActive(user.id, user.isActive)}
                      />
                      <span className={user.isActive ? 'text-green-600' : 'text-red-600'}>
                        {user.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-muted-foreground">
              Nenhum usuário encontrado.
            </div>
          )}
          <Link to="/admin/users" className="block w-full text-center text-fitness-green hover:underline py-2 mt-2 text-sm">
            Ver Todos os Usuários
          </Link>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-card rounded-lg border border-border p-4">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link 
              to="/admin/workouts/create" 
              className="block w-full bg-fitness-green text-white py-2 rounded-lg hover:bg-fitness-darkGreen transition-colors text-center"
            >
              Adicionar Novo Treino
            </Link>
            <Link to="/admin/appointments"
              className="block w-full bg-secondary text-foreground py-2 rounded-lg hover:bg-muted transition-colors text-center"
            >
              Gerenciar Agendamentos
            </Link>
            <Link to="/admin/products/create"
              className="block w-full bg-secondary text-foreground py-2 rounded-lg hover:bg-muted transition-colors text-center"
            >
              Adicionar Novo Produto
            </Link>
            <Link to="/admin/photos"
              className="block w-full bg-secondary text-foreground py-2 rounded-lg hover:bg-muted transition-colors text-center"
            >
              Gerenciar Fotos
            </Link>
          </div>
          
          {/* Recent Notifications */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-3">Notificações Recentes</h2>
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium">Manutenção do Sistema</h4>
                <p className="text-sm text-muted-foreground">Programada para 15 de Maio, 2025 às 2:00 AM</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium">Nova Funcionalidade Disponível</h4>
                <p className="text-sm text-muted-foreground">Treinos de vídeo agora disponíveis</p>
              </div>
            </div>
          </div>
        </div>
      </div>

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
              onClick={() => selectedUser && deleteUserMutation.mutate(selectedUser.id)}
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

export default Dashboard;
