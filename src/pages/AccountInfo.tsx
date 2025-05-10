
import React from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// Define schema for form validation
const formSchema = z.object({
  first_name: z.string().min(1, { message: 'Nome é obrigatório' }),
  last_name: z.string().min(1, { message: 'Sobrenome é obrigatório' }),
  height: z.number().positive().nullish(),
  weight: z.number().positive().nullish(),
  gender: z.string().nullish(),
  birthdate: z.string().nullish(),
  fitness_goal: z.string().nullish(),
});

type FormValues = z.infer<typeof formSchema>;

const AccountInfo = () => {
  const { profile, isLoading, updateProfile } = useProfile();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      height: profile?.height || null,
      weight: profile?.weight || null,
      gender: profile?.gender || '',
      birthdate: profile?.birthdate || '',
      fitness_goal: profile?.fitness_goal || '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      updateProfile(values);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fitness-orange"></div>
      </div>
    );
  }

  return (
    <main className="container">
      <section className="mobile-section">
        <div className="mb-6 flex items-center">
          <Link to="/profile" className="mr-2">
            <ArrowLeft className="text-fitness-orange" />
          </Link>
          <h1 className="text-2xl font-bold">Informações da Conta</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite seu nome" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sobrenome</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite seu sobrenome" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso (kg)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Seu peso" 
                        {...field} 
                        onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Altura (cm)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Sua altura" 
                        {...field} 
                        onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gênero</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      {...field}
                    >
                      <option value="">Selecione</option>
                      <option value="masculino">Masculino</option>
                      <option value="feminino">Feminino</option>
                      <option value="outro">Outro</option>
                      <option value="prefiro_nao_dizer">Prefiro não dizer</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birthdate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de nascimento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fitness_goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objetivo Fitness</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      {...field}
                    >
                      <option value="">Selecione</option>
                      <option value="perder_peso">Perder peso</option>
                      <option value="ganhar_massa">Ganhar massa muscular</option>
                      <option value="manter_forma">Manter a forma</option>
                      <option value="melhorar_saude">Melhorar saúde</option>
                      <option value="condicionamento">Melhorar condicionamento</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full bg-fitness-orange hover:bg-fitness-orange/90">
              Salvar alterações
            </Button>
          </form>
        </Form>
      </section>
    </main>
  );
};

export default AccountInfo;
