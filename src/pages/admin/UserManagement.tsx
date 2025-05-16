
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { User, UserCheck, UserX, Search, RefreshCw, AlertTriangle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

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

const UserManagement = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const queryClient = useQueryClient();

  // Fetch all users with their profiles and active status
  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      try {
        // Fetch users from auth.users through a custom function
        const { data, error } = await supabase.rpc('get_all_users') as { data: UserData[] | null, error: any };
        
        if (error) {
          console.error('Error fetching users:', error);
          toast.error('Erro ao carregar usuários');
          throw error; // This will make the query state indicate an error
        }
        
        return data || [];
      } catch (err) {
        console.error('Unexpected error fetching users:', err);
        throw err;
      }
    },
    retry: 1, // Only retry once
    staleTime: 5 * 60 * 1000, // 5 minutes
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
        Gerencie os usuários do aplicativo, ativando ou desativando o acesso deles ao sistema.
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
        
        {error && (
          <Button 
            variant="outline" 
            onClick={() => refetch()} 
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </Button>
        )}
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
            onClick={() => refetch()}
            className="mx-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      ) : (
        <div className="bg-white dark:bg-fitness-darkGray rounded-lg shadow">
          <DataTable
            columns={columns}
            data={filteredUsers}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
};

export default UserManagement;
