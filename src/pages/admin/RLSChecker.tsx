
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type TableRLSStatus = {
  table_name: string;
  has_rls: boolean;
  row_count: number;
};

const RLSChecker = () => {
  const queryClient = useQueryClient();
  const [errorRetries, setErrorRetries] = useState(0);

  // Fetch tables and their RLS status
  const { data: tables, isLoading, error, refetch } = useQuery({
    queryKey: ['rls-status', errorRetries],
    queryFn: async () => {
      try {
        console.log('Fetching RLS status for tables...');
        const { data, error } = await supabase.rpc('get_tables_without_rls');
        
        if (error) {
          console.error('Error fetching RLS status:', error);
          toast.error('Erro ao verificar status de RLS nas tabelas');
          throw error;
        }
        
        return data as TableRLSStatus[];
      } catch (err) {
        console.error('Unexpected error:', err);
        throw err;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
  
  // Enable RLS for a table
  const enableRLS = useMutation({
    mutationFn: async (tableName: string) => {
      const { error } = await supabase.rpc('admin_enable_rls', {
        table_name: tableName
      });
      
      if (error) throw error;
      
      return tableName;
    },
    onSuccess: (tableName) => {
      queryClient.invalidateQueries({ queryKey: ['rls-status'] });
      toast.success(`RLS ativado para a tabela ${tableName}`);
    },
    onError: (error: any) => {
      console.error('Error enabling RLS:', error);
      toast.error(error.message || 'Erro ao ativar RLS');
    }
  });

  // Manual retry handler with loading state
  const [isRetrying, setIsRetrying] = useState(false);
  
  const handleManualRetry = async () => {
    setIsRetrying(true);
    try {
      await refetch();
      toast.success('Dados recarregados com sucesso');
    } catch (err) {
      toast.error('Falha ao tentar recarregar os dados. Por favor, tente novamente.');
    } finally {
      setIsRetrying(false);
      setErrorRetries(prev => prev + 1);
    }
  };

  // Calculate stats
  const tablesWithoutRLS = tables?.filter(t => !t.has_rls).length || 0;
  const totalTables = tables?.length || 0;
  const securityScore = totalTables ? Math.round(((totalTables - tablesWithoutRLS) / totalTables) * 100) : 0;

  const columns = [
    {
      accessorKey: 'table_name',
      header: 'Tabela',
      cell: ({ row }: { row: { original: TableRLSStatus } }) => (
        <span className="font-medium">{row.original.table_name}</span>
      ),
    },
    {
      accessorKey: 'has_rls',
      header: 'Status RLS',
      cell: ({ row }: { row: { original: TableRLSStatus } }) => {
        const hasRLS = row.original.has_rls;
        return (
          <div className="flex items-center gap-2">
            {hasRLS ? (
              <>
                <ShieldCheck className="h-5 w-5 text-green-500" />
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Protegida
                </Badge>
              </>
            ) : (
              <>
                <ShieldAlert className="h-5 w-5 text-red-500" />
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  Não Protegida
                </Badge>
              </>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'row_count',
      header: 'Linhas',
      cell: ({ row }: { row: { original: TableRLSStatus } }) => {
        return (
          <span>{row.original.row_count.toLocaleString()}</span>
        );
      },
    },
    {
      accessorKey: 'actions',
      header: 'Ações',
      cell: ({ row }: { row: { original: TableRLSStatus } }) => {
        if (row.original.has_rls) {
          return (
            <Badge variant="outline" className="bg-green-50 text-green-700">
              RLS Ativado
            </Badge>
          );
        }
        
        return (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => enableRLS.mutate(row.original.table_name)}
            disabled={enableRLS.isPending && enableRLS.variables === row.original.table_name}
            className="flex items-center gap-2"
          >
            {enableRLS.isPending && enableRLS.variables === row.original.table_name ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Shield className="h-4 w-4" />
            )}
            Ativar RLS
          </Button>
        );
      },
    },
  ];

  return (
    <div className="container p-4 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Shield className="h-7 w-7 text-fitness-green" />
        <h1 className="text-3xl font-bold text-[#000000] tracking-tight">
          Verificador de RLS
        </h1>
      </div>
      
      <p className="text-lg text-[#000000e6] dark:text-gray-300 mb-6 max-w-3xl leading-relaxed">
        Verifique o status de Row Level Security (RLS) das tabelas no seu banco de dados. 
        O RLS é essencial para garantir que os usuários só possam acessar os dados que deveriam ter permissão.
      </p>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total de Tabelas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTables}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Tabelas sem RLS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${tablesWithoutRLS > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {tablesWithoutRLS}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pontuação de Segurança</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${securityScore < 80 ? 'text-orange-500' : 'text-green-600'}`}>
              {securityScore}%
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Action Button */}
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          onClick={handleManualRetry}
          disabled={isRetrying}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
          Atualizar Dados
        </Button>
      </div>
      
      {error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <AlertTriangle className="h-10 w-10 mx-auto text-red-500 mb-2" />
          <p className="text-red-800 dark:text-red-200 mb-4 font-medium text-lg">
            Ocorreu um erro ao verificar o status de RLS.
          </p>
          <p className="text-red-700 dark:text-red-300 mb-6 max-w-md mx-auto">
            Não foi possível conectar ao servidor ou ocorreu um problema ao buscar os dados das tabelas. 
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
            data={tables || []}
            isLoading={isLoading || isRetrying}
          />
        </div>
      )}
    </div>
  );
};

export default RLSChecker;
