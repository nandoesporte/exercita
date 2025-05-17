import React, { useState } from 'react';
import { BarChart3, Users, Dumbbell, CalendarCheck, ArrowUp, ArrowDown, Loader2, UserPlus, Gift, ImageIcon, CalendarIcon } from 'lucide-react';
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
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

  // Fetch statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      // Mock stats data for now - would be replaced with an actual API call
      return {
        users: 42,
        workouts: 15,
        appointments: 8,
        revenue: 12540
      };
    },
  });

  // Fetch users for the recent activity section
  const { data: recentUsersData, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['admin-dashboard-users'],
    queryFn: async () => {
      console.log("Fetching users with debug_get_all_users function");
      const { data, error } = await supabase.rpc('debug_get_all_users');
      
      if (error) {
        console.error("Error fetching users:", error);
        throw new Error(error.message);
      }
      
      console.log("User data returned:", data);
      if (data && data.length > 0) {
        console.log("First user structure:", data[0]);
      }
      
      return data || [];
    },
  });

  // Process user data for display
  const recentUsers = React.useMemo(() => {
    if (!recentUsersData) return [];
    
    return recentUsersData.slice(0, 5).map(user => ({
      id: user.user_id,
      email: user.email,
      user: (user.raw_user_meta_data?.first_name || '') + ' ' + (user.raw_user_meta_data?.last_name || ''),
      time: user.created_at,
      isActive: !user.banned_until,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${user.raw_user_meta_data?.first_name || user.email}`,
    }));
  }, [recentUsersData]);

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
      title: 'Usuários', 
      value: statsLoading ? '...' : statsData?.users.toString(), 
      change: '+12%',  
      trend: 'up', 
      icon: Users,
      isLoading: statsLoading
    },
    { 
      title: 'Treinos', 
      value: statsLoading ? '...' : statsData?.workouts.toString(), 
      change: '+5%', 
      trend: 'up', 
      icon: Dumbbell,
      isLoading: statsLoading
    },
    { 
      title: 'Consultas', 
      value: statsLoading ? '...' : statsData?.appointments.toString(), 
      change: '+18%', 
      trend: 'up', 
      icon: CalendarCheck,
      isLoading: statsLoading
    },
    { 
      title: 'Faturamento', 
      value: 'R$ 12.540', 
      change: '-2%', 
      trend: 'down', 
      icon: BarChart3,
      isLoading: false
    },
  ];

  return (
    <div className="space-y-4 pb-16 md:pb-0">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
          <Button onClick={() => setIsCreateUserOpen(true)} size={isMobile ? "sm" : "default"}>
            <UserPlus className="h-4 w-4 mr-2" />
            {!isMobile && "Novo Usuário"}
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
      
      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-card rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-md bg-secondary">
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">{stat.title}</p>
              <h3 className="text-lg font-bold mt-0.5">
                {stat.isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  stat.value
                )}
              </h3>
            </div>
            <div className="flex items-center mt-1">
              {stat.trend === 'up' ? (
                <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={`text-xs ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent User Activity with User Management - Improved Mobile Layout */}
        <div className="lg:col-span-2 bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Usuários Recentes</h2>
          </div>
          
          {usersError ? (
            <div className="p-4 rounded-md bg-red-50 border border-red-200">
              <p className="text-red-600 text-sm">{(usersError as Error).message}</p>
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
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-fitness-green mr-2" />
              <span className="text-sm">Carregando usuários...</span>
            </div>
          ) : recentUsers && recentUsers.length > 0 ? (
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 hover:bg-muted rounded-lg transition-colors space-y-2 sm:space-y-0">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full overflow-hidden mr-3">
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
                      <h3 className="font-medium text-sm">{user.user || 'Novo Usuário'}</h3>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-11 sm:ml-0">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.isActive}
                        onCheckedChange={() => handleToggleUserActive(user.id, user.isActive)}
                        className="h-5 w-9"
                      />
                      <span className={`text-xs ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {user.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-7 text-xs px-2"
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
            <div className="py-6 text-center text-muted-foreground">
              Nenhum usuário encontrado.
            </div>
          )}
          
          <Link to="/admin/users" className="block w-full text-center text-fitness-green hover:underline py-2 mt-2 text-sm">
            Ver Todos os Usuários
          </Link>
        </div>
        
        {/* Quick Actions - Mobile Optimized */}
        <div className="bg-card rounded-lg border border-border p-4">
          <h2 className="text-base font-semibold mb-3">Ações Rápidas</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-1 sm:gap-2">
            <Link 
              to="/admin/workouts/create" 
              className="flex items-center justify-center gap-2 bg-fitness-green text-white p-2 rounded-lg hover:bg-fitness-darkGreen transition-colors text-center text-sm"
            >
              <Dumbbell className="h-4 w-4" />
              <span>Novo Treino</span>
            </Link>
            <Link to="/admin/appointments"
              className="flex items-center justify-center gap-2 bg-secondary text-foreground p-2 rounded-lg hover:bg-muted transition-colors text-center text-sm"
            >
              <CalendarIcon className="h-4 w-4" />
              <span>Agendamentos</span>
            </Link>
            <Link to="/admin/products/create"
              className="flex items-center justify-center gap-2 bg-secondary text-foreground p-2 rounded-lg hover:bg-muted transition-colors text-center text-sm"
            >
              <Gift className="h-4 w-4" />
              <span>Novo Produto</span>
            </Link>
            <Link to="/admin/photos"
              className="flex items-center justify-center gap-2 bg-secondary text-foreground p-2 rounded-lg hover:bg-muted transition-colors text-center text-sm"
            >
              <ImageIcon className="h-4 w-4" />
              <span>Fotos</span>
            </Link>
          </div>
          
          {/* Recent Notifications - Mobile Friendly */}
          <div className="mt-4">
            <h2 className="text-base font-semibold mb-2">Notificações</h2>
            <div className="space-y-2">
              <div className="p-2 bg-muted rounded-lg">
                <h4 className="font-medium text-sm">Manutenção do Sistema</h4>
                <p className="text-xs text-muted-foreground">15/05/2025 às 2:00</p>
              </div>
              <div className="p-2 bg-muted rounded-lg">
                <h4 className="font-medium text-sm">Nova Funcionalidade</h4>
                <p className="text-xs text-muted-foreground">Treinos em vídeo disponíveis</p>
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
