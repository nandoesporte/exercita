import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { WorkoutCategory, useWorkoutCategories } from '@/hooks/useWorkoutCategories';

const formSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  color: z.string().regex(/^#([0-9A-F]{6}|[0-9A-F]{3})$/i, 'Deve ser um código de cor hexadecimal válido').optional(),
  icon: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof formSchema>;

interface WorkoutCategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: WorkoutCategory | null;
}

export const WorkoutCategoryForm = ({ open, onOpenChange, category }: WorkoutCategoryFormProps) => {
  const { createCategory, updateCategory, isCreating, isUpdating } = useWorkoutCategories();
  
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      color: '#00CB7E',
      icon: '',
    },
  });
  
  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        color: category.color || '#00CB7E',
        icon: category.icon || '',
      });
    } else {
      form.reset({
        name: '',
        color: '#00CB7E',
        icon: '',
      });
    }
  }, [category, form]);
  
  const onSubmit = async (values: CategoryFormValues) => {
    try {
      if (category) {
        await updateCategory({ 
          id: category.id, 
          name: values.name,
          color: values.color,
          icon: values.icon,
          created_at: category.created_at,
          updated_at: category.updated_at
        });
      } else {
        await createCategory({
          name: values.name,
          color: values.color || '#00CB7E',
          icon: values.icon || ''
        });
      }
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {category ? 'Editar Categoria de Exercício' : 'Nova Categoria de Exercício'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da categoria</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Bíceps, Tríceps, Peito..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor</FormLabel>
                  <div className="flex gap-2">
                    <div 
                      className="w-8 h-8 rounded-full border"
                      style={{ backgroundColor: field.value || '#00CB7E' }}
                    />
                    <FormControl>
                      <Input type="color" {...field} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ícone (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do ícone" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isCreating || isUpdating}
              >
                {isCreating || isUpdating ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};