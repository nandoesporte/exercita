import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Trash2, UserPlus, Lock, Unlock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

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
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; user: UserData | null }>({ 
    show: false, 
    user: null 
  });
  
  // Fields for new user
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  // Load users
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.rpc('get_all_users');
      
      if (error) throw error;
      
      setUsers(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error.message);
      toast.error('Erro ao carregar usuários');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle user status (activate/deactivate)
  const toggleUserStatus = async (userId: string, currentlyBanned: boolean) => {
    try {
      const { error } = await supabase.rpc(
        'toggle_user_active_status',
        { user_id: userId, is_active: currentlyBanned }
      );
      
      if (error) throw error;
      
      // Update list after toggle
      toast.success(currentlyBanned 
        ? 'Usuário ativado com sucesso' 
        : 'Usuário desativado com sucesso'
      );
      fetchUsers();
    } catch (error: any) {
      console.error('Erro ao alterar status do usuário:', error.message);
      toast.error('Erro ao alterar status do usuário');
    }
  };

  // Delete user
  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase.rpc(
        'admin_delete_user',
        { user_id: userId }
      );
      
      if (error) throw error;
      
      toast.success('Usuário excluído com sucesso');
      setConfirmDelete({ show: false, user: null });
      fetchUsers();
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error.message);
      toast.error('Erro ao excluir usuário');
    }
  };

  // Create new user - updated to work with the fixed backend function
  const createUser = async () => {
    if (!newUser.email || !newUser.password) {
      toast.error('Email e senha são obrigatórios');
      return;
    }

    try {
      setIsCreatingUser(true);
      
      // Construct the user metadata
      const userMetadata = {
        first_name: newUser.firstName,
        last_name: newUser.lastName
      };
      
      console.log('Criando usuário com os dados:', {
        user_email: newUser.email,
        user_metadata: userMetadata
      });
      
      const { data, error } = await supabase.rpc(
        'admin_create_user',
        {
          user_email: newUser.email,
          user_password: newUser.password,
          user_metadata: userMetadata
        }
      );
      
      if (error) {
        console.error('Erro na resposta:', error);
        throw error;
      }
      
      console.log('Resposta da criação de usuário:', data);
      
      toast.success('Usuário criado com sucesso');
      setShowCreateDialog(false);
      setNewUser({ email: '', password: '', firstName: '', lastName: '' });
      fetchUsers();
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      toast.error(`Erro ao criar usuário: ${error.message || 'Ocorreu um erro desconhecido'}`);
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Load users on startup
  useEffect(() => {
    fetchUsers();
  }, []);

  // Definir colunas da tabela
  const columns = [
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }: { row: { original: UserData } }) => (
        <div>
          <div className="font-medium">{row.original.email}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.raw_user_meta_data?.first_name} {row.original.raw_user_meta_data?.last_name}
          </div>
        </div>
      )
    },
    {
      accessorKey: 'created_at',
      header: 'Data de Criação',
      cell: ({ row }: { row: { original: UserData } }) => (
        <div>{new Date(row.original.created_at).toLocaleDateString('pt-BR')}</div>
      )
    },
    {
      accessorKey: 'last_sign_in_at',
      header: 'Último Login',
      cell: ({ row }: { row: { original: UserData } }) => (
        <div>
          {row.original.last_sign_in_at 
            ? new Date(row.original.last_sign_in_at).toLocaleDateString('pt-BR') 
            : 'Nunca'}
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: { original: UserData } }) => {
        const banned = !!row.original.banned_until;
        return (
          <Badge 
            variant={banned ? "destructive" : "default"}
            className={banned ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}
          >
            {banned ? 'Desativado' : 'Ativo'}
          </Badge>
        );
      }
    },
    {
      accessorKey: 'actions',
      header: 'Ações',
      cell: ({ row }: { row: { original: UserData } }) => {
        const banned = !!row.original.banned_until;
        return (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleUserStatus(row.original.id, banned)}
              title={banned ? "Ativar usuário" : "Desativar usuário"}
            >
              {banned ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmDelete({ show: true, user: row.original })}
              title="Excluir usuário"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      }
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gerenciamento de Usuários</h2>
          <p className="text-muted-foreground">
            Gerencie os usuários da plataforma, ative, desative ou exclua contas.
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Criar Usuário
        </Button>
      </div>

      <Separator />

      <DataTable 
        columns={columns} 
        data={users} 
        isLoading={isLoading} 
      />

      {/* Dialog for creating a user */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Usuário</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome</Label>
                <Input 
                  id="firstName"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Sobrenome</Label>
                <Input 
                  id="lastName"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email*</Label>
              <Input 
                id="email" 
                type="email" 
                required
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha*</Label>
              <Input 
                id="password" 
                type="password" 
                required
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={isCreatingUser}>Cancelar</Button>
            <Button onClick={createUser} disabled={isCreatingUser}>
              {isCreatingUser ? 'Criando...' : 'Criar Usuário'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog for deletion */}
      <Dialog open={confirmDelete.show} onOpenChange={(open) => !open && setConfirmDelete({ show: false, user: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Tem certeza que deseja excluir o usuário {confirmDelete.user?.email}?</p>
            <p className="text-destructive font-semibold mt-2">Esta ação não pode ser desfeita.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete({ show: false, user: null })}>Cancelar</Button>
            <Button 
              variant="destructive" 
              onClick={() => confirmDelete.user && deleteUser(confirmDelete.user.id)}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
