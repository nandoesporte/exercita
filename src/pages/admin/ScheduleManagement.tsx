
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Upload } from 'lucide-react';
import { Label } from '@/components/ui/label';

// Schema for the form validation
const trainerFormSchema = z.object({
  name: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres' }),
  credentials: z.string().min(3, { message: 'Credenciais são obrigatórias' }),
  bio: z.string().min(10, { message: 'Bio deve ter pelo menos 10 caracteres' }),
  whatsapp: z.string().regex(/^\d+$/, { message: 'Apenas números são permitidos' }),
});

type TrainerFormValues = z.infer<typeof trainerFormSchema>;

const ScheduleManagement = () => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Create form
  const form = useForm<TrainerFormValues>({
    resolver: zodResolver(trainerFormSchema),
    defaultValues: {
      name: '',
      credentials: '',
      bio: '',
      whatsapp: '',
    },
  });

  // Fetch existing trainer data when component mounts
  useEffect(() => {
    const fetchTrainerData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('personal_trainers')
          .select('*')
          .eq('is_primary', true)
          .single();

        if (error) throw error;

        if (data) {
          form.setValue('name', data.name || '');
          form.setValue('credentials', data.credentials || '');
          form.setValue('bio', data.bio || '');
          form.setValue('whatsapp', data.whatsapp || '');
          setPhotoUrl(data.photo_url);
        }
      } catch (error) {
        console.error('Error fetching trainer data:', error);
        toast("Erro ao carregar dados", {
          description: "Não foi possível carregar as informações do personal trainer.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTrainerData();
  }, [form]);

  // Handle photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `trainer-profile-${Date.now()}.${fileExt}`;
    
    setUploading(true);
    
    try {
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('trainer_photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('trainer_photos')
        .getPublicUrl(fileName);

      setPhotoUrl(data.publicUrl);
      
      toast("Foto enviada com sucesso", {
        description: "A foto do perfil foi atualizada."
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast("Erro no upload", {
        description: "Não foi possível enviar a foto. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle form submission
  const onSubmit = async (data: TrainerFormValues) => {
    setLoading(true);
    
    try {
      // Check if we're updating or inserting
      const { data: existingTrainer, error: fetchError } = await supabase
        .from('personal_trainers')
        .select('id')
        .eq('is_primary', true)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      // Prepare data to save
      const trainerData = {
        name: data.name,
        credentials: data.credentials,
        bio: data.bio,
        whatsapp: data.whatsapp,
        photo_url: photoUrl,
        is_primary: true,
      };

      // Update or insert
      let saveError;
      if (existingTrainer?.id) {
        // Update existing record
        const { error } = await supabase
          .from('personal_trainers')
          .update(trainerData)
          .eq('id', existingTrainer.id);
        
        saveError = error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('personal_trainers')
          .insert(trainerData);
        
        saveError = error;
      }

      if (saveError) throw saveError;

      toast("Salvo com sucesso", {
        description: "As informações do personal trainer foram atualizadas."
      });
    } catch (error) {
      console.error('Error saving trainer data:', error);
      toast("Erro ao salvar", {
        description: "Não foi possível salvar as informações. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-6">
      <h1 className="text-3xl font-bold mb-6">Gerenciar Página de Agendamento</h1>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Personal Trainer</CardTitle>
          <CardDescription>
            Atualize as informações e foto do personal trainer que aparecem na página de agendamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Photo Upload Section */}
            <div className="space-y-3">
              <Label htmlFor="photo-upload">Foto do Perfil</Label>
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-muted relative">
                  {photoUrl ? (
                    <img 
                      src={photoUrl} 
                      alt="Foto do perfil" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-sm">
                      Sem foto
                    </div>
                  )}
                </div>
                <div>
                  <div className="mb-3">
                    <Button variant="outline" className="relative" disabled={uploading}>
                      <input 
                        id="photo-upload"
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        onChange={handlePhotoUpload}
                        disabled={uploading}
                      />
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Enviar nova foto
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Formatos aceitos: JPG, PNG. Tamanho máximo: 2MB
                  </p>
                </div>
              </div>
            </div>

            {/* Trainer Info Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do Personal Trainer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="credentials"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credenciais</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Personal Trainer - CREF 123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp</FormLabel>
                      <FormControl>
                        <Input placeholder="Apenas números, ex: 44997270698" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biografia</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descrição curta sobre o personal trainer..." 
                          className="min-h-20"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-fitness-green to-fitness-blue"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Informações'
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleManagement;
