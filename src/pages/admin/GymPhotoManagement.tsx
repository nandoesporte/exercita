
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Check, X, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

type GymPhoto = {
  id: string;
  user_id: string;
  photo_url: string;
  description: string | null;
  approved: boolean | null;
  created_at: string | null;
};

const GymPhotoManagement = () => {
  const queryClient = useQueryClient();
  const [showOnlyPending, setShowOnlyPending] = useState(true);
  
  const { data: photos, isLoading } = useQuery({
    queryKey: ['admin-gym-photos', showOnlyPending],
    queryFn: async () => {
      let query = supabase
        .from('user_gym_photos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (showOnlyPending) {
        query = query.is('approved', null);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching gym photos:', error);
        throw error;
      }
      
      return data as GymPhoto[];
    },
  });
  
  const approvePhoto = useMutation({
    mutationFn: async (photoId: string) => {
      const { error } = await supabase
        .from('user_gym_photos')
        .update({ approved: true })
        .eq('id', photoId);
      
      if (error) throw error;
      return photoId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gym-photos'] });
      toast.success('Foto aprovada com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao aprovar foto', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      });
    },
  });
  
  const rejectPhoto = useMutation({
    mutationFn: async (photoId: string) => {
      const { error } = await supabase
        .from('user_gym_photos')
        .update({ approved: false })
        .eq('id', photoId);
      
      if (error) throw error;
      return photoId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gym-photos'] });
      toast.success('Foto rejeitada com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao rejeitar foto', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      });
    },
  });
  
  const deletePhoto = useMutation({
    mutationFn: async (photoId: string) => {
      const { error } = await supabase
        .from('user_gym_photos')
        .delete()
        .eq('id', photoId);
      
      if (error) throw error;
      return photoId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gym-photos'] });
      toast.success('Foto excluída com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao excluir foto', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      });
    },
  });
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  };
  
  return (
    <div className="space-y-6 pb-16">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gerenciar Fotos de Academias</h1>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="pending-only"
            checked={showOnlyPending}
            onCheckedChange={setShowOnlyPending}
          />
          <Label htmlFor="pending-only">Mostrar apenas pendentes</Label>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : !photos || photos.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">
            {showOnlyPending 
              ? 'Não há fotos pendentes para revisão.' 
              : 'Não há fotos disponíveis.'}
          </p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {photos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="aspect-video md:aspect-square max-h-64 md:max-h-none overflow-hidden">
                  <img
                    src={photo.photo_url}
                    alt="Gym Photo"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="p-4 col-span-2 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap gap-3 mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-4 w-4" />
                        {formatDate(photo.created_at)}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="mr-1 h-4 w-4" />
                        {photo.user_id.substring(0, 8)}...
                      </div>
                      <div className="flex items-center text-sm">
                        {photo.approved === true && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            Revisado
                          </span>
                        )}
                        {photo.approved === false && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                            Rejeitado
                          </span>
                        )}
                        {photo.approved === null && (
                          <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">
                            Pendente
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {photo.description && (
                      <p className="text-sm mb-4">{photo.description}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    {photo.approved === null && (
                      <>
                        <Button 
                          onClick={() => approvePhoto.mutate(photo.id)} 
                          className="bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          <Check className="mr-1 h-4 w-4" />
                          Revisar
                        </Button>
                        <Button 
                          onClick={() => rejectPhoto.mutate(photo.id)} 
                          variant="outline"
                          size="sm"
                        >
                          <X className="mr-1 h-4 w-4" />
                          Rejeitar
                        </Button>
                      </>
                    )}
                    <Button 
                      onClick={() => {
                        if (confirm('Tem certeza que deseja excluir esta foto?')) {
                          deletePhoto.mutate(photo.id);
                        }
                      }} 
                      variant="destructive"
                      size="sm"
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GymPhotoManagement;
