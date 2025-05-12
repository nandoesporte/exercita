
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { WorkoutExercise } from '@/hooks/useAdminWorkouts';
import { Database } from '@/integrations/supabase/types';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';

type Exercise = Database['public']['Tables']['exercises']['Row'];

// Define form schema with Zod
const formSchema = z.object({
  exercise_id: z.string().min(1, { message: "Selecione um exercício." }),
  sets: z.coerce.number().int().min(1, { message: "Mínimo de 1 série." }),
  reps: z.coerce.number().int().min(0, { message: "Valor inválido." }).optional().nullable(),
  duration: z.coerce.number().int().min(0, { message: "Valor inválido." }).optional().nullable(),
  rest: z.coerce.number().int().min(0, { message: "Valor inválido." }).optional().nullable(),
  weight: z.coerce.number().min(0, { message: "Valor inválido." }).optional().nullable(),
});

interface AddExerciseFormProps {
  exercises: Exercise[];
  onAddExercise: (data: WorkoutExercise) => void;
  currentExerciseCount: number;
  isLoading: boolean;
}

const AddExerciseForm: React.FC<AddExerciseFormProps> = ({
  exercises,
  onAddExercise,
  currentExerciseCount,
  isLoading
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      exercise_id: "",
      sets: 3,
      reps: 12,
      duration: null,
      rest: 60,
      weight: null,
    },
  });

  const exerciseType = form.watch("exercise_id");
  
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onAddExercise({
      exercise_id: values.exercise_id,
      sets: values.sets,
      reps: values.reps,
      duration: values.duration,
      rest: values.rest,
      weight: values.weight,
      order_position: currentExerciseCount + 1
    });
    
    form.reset({
      exercise_id: "",
      sets: 3,
      reps: 12,
      duration: null,
      rest: 60,
      weight: null,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="exercise_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Exercício</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um exercício" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {exercises.length === 0 ? (
                    <SelectItem value="none" disabled>Nenhum exercício disponível</SelectItem>
                  ) : (
                    exercises.map((exercise) => (
                      <SelectItem key={exercise.id} value={exercise.id}>
                        {exercise.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                Selecione o exercício a ser adicionado ao treino.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="sets"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Séries</FormLabel>
                <FormControl>
                  <Input type="number" {...field} min={1} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rest"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descanso (segundos)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    min={0}
                    value={field.value === null ? "" : field.value}
                    onChange={(e) => {
                      const value = e.target.value === "" ? null : parseInt(e.target.value);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="reps"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Repetições</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    min={0}
                    value={field.value === null ? "" : field.value}
                    onChange={(e) => {
                      const value = e.target.value === "" ? null : parseInt(e.target.value);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duração (segundos)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field}
                    min={0}
                    value={field.value === null ? "" : field.value}
                    onChange={(e) => {
                      const value = e.target.value === "" ? null : parseInt(e.target.value);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Use para exercícios baseados em tempo em vez de repetições
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Carga (kg)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field}
                  min={0}
                  step={0.5}
                  value={field.value === null ? "" : field.value}
                  onChange={(e) => {
                    const value = e.target.value === "" ? null : parseFloat(e.target.value);
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormDescription>
                Informe a carga recomendada para este exercício (em kg)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={isLoading} 
          className={cn(
            "w-full",
            isLoading && "opacity-70 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adicionando...
            </>
          ) : (
            "Adicionar Exercício"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default AddExerciseForm;
