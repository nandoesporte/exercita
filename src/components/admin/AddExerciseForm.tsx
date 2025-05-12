
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, FileText } from 'lucide-react';
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
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Exercise = Database['public']['Tables']['exercises']['Row'];

// Define the days of week options
const daysOfWeek = [
  { id: 'monday', label: 'Segunda' },
  { id: 'tuesday', label: 'Terça' },
  { id: 'wednesday', label: 'Quarta' },
  { id: 'thursday', label: 'Quinta' },
  { id: 'friday', label: 'Sexta' },
  { id: 'saturday', label: 'Sábado' },
  { id: 'sunday', label: 'Domingo' },
];

// Define form schema with Zod for exercises
const exerciseFormSchema = z.object({
  exercise_id: z.string().min(1, { message: "Selecione um exercício." }),
  sets: z.coerce.number().int().min(1, { message: "Mínimo de 1 série." }),
  reps: z.coerce.number().int().min(0, { message: "Valor inválido." }).optional().nullable(),
  duration: z.coerce.number().int().min(0, { message: "Valor inválido." }).optional().nullable(),
  duration_unit: z.enum(['seconds', 'minutes']),
  rest: z.coerce.number().int().min(0, { message: "Valor inválido." }).optional().nullable(),
  weight: z.coerce.number().min(0, { message: "Valor inválido." }).optional().nullable(),
  day_of_week: z.string().optional(),
});

// Define form schema with Zod for title sections
const titleFormSchema = z.object({
  section_title: z.string().min(1, { message: "O título da seção é obrigatório." }),
  day_of_week: z.string().optional(),
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
  const [formType, setFormType] = useState<'exercise' | 'title'>('exercise');

  // Form for exercises
  const exerciseForm = useForm<z.infer<typeof exerciseFormSchema>>({
    resolver: zodResolver(exerciseFormSchema),
    defaultValues: {
      exercise_id: "",
      sets: 3,
      reps: 12,
      duration: null,
      duration_unit: "seconds",
      rest: 60,
      weight: null,
      day_of_week: "monday",
    },
  });

  // Form for title sections
  const titleForm = useForm<z.infer<typeof titleFormSchema>>({
    resolver: zodResolver(titleFormSchema),
    defaultValues: {
      section_title: "",
      day_of_week: "monday",
    },
  });

  const exerciseType = exerciseForm.watch("exercise_id");
  const durationType = exerciseForm.watch("duration_unit");
  
  const handleExerciseSubmit = (values: z.infer<typeof exerciseFormSchema>) => {
    // Convert duration to seconds if unit is minutes
    let durationInSeconds = values.duration;
    if (values.duration && values.duration_unit === 'minutes') {
      durationInSeconds = values.duration * 60;
    }
    
    onAddExercise({
      exercise_id: values.exercise_id,
      sets: values.sets,
      reps: values.reps,
      duration: durationInSeconds,
      rest: values.rest,
      weight: values.weight,
      order_position: currentExerciseCount + 1,
      day_of_week: values.day_of_week,
      is_title_section: false
    });
    
    exerciseForm.reset({
      exercise_id: "",
      sets: 3,
      reps: 12,
      duration: null,
      duration_unit: "seconds",
      rest: 60,
      weight: null,
      day_of_week: "monday",
    });
  };

  const handleTitleSubmit = (values: z.infer<typeof titleFormSchema>) => {
    onAddExercise({
      order_position: currentExerciseCount + 1,
      day_of_week: values.day_of_week,
      is_title_section: true,
      section_title: values.section_title
    });
    
    titleForm.reset({
      section_title: "",
      day_of_week: "monday",
    });
  };

  return (
    <div>
      <Tabs value={formType} onValueChange={(value) => setFormType(value as 'exercise' | 'title')}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="exercise">Exercício</TabsTrigger>
          <TabsTrigger value="title">Título</TabsTrigger>
        </TabsList>

        <TabsContent value="exercise">
          <Form {...exerciseForm}>
            <form onSubmit={exerciseForm.handleSubmit(handleExerciseSubmit)} className="space-y-4">
              <FormField
                control={exerciseForm.control}
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

              <FormField
                control={exerciseForm.control}
                name="day_of_week"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia da Semana</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "monday"}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione o dia da semana" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {daysOfWeek.map((day) => (
                          <SelectItem key={day.id} value={day.id}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Selecione o dia da semana em que este exercício aparecerá.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={exerciseForm.control}
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
                  control={exerciseForm.control}
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
                  control={exerciseForm.control}
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

                <div>
                  <FormField
                    control={exerciseForm.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duração</FormLabel>
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
                    control={exerciseForm.control}
                    name="duration_unit"
                    render={({ field }) => (
                      <FormItem className="mt-2">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                            className="flex space-x-4"
                          >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="seconds" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                Segundos
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="minutes" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                Minutos
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormDescription className="mt-1">
                          {durationType === "seconds" 
                            ? "Duração em segundos para exercícios baseados em tempo"
                            : "Duração em minutos para exercícios baseados em tempo"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={exerciseForm.control}
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
        </TabsContent>

        <TabsContent value="title">
          <Form {...titleForm}>
            <form onSubmit={titleForm.handleSubmit(handleTitleSubmit)} className="space-y-4">
              <FormField
                control={titleForm.control}
                name="section_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título da Seção</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Aquecimento, Parte Principal, etc" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Digite um título para agrupar exercícios
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={titleForm.control}
                name="day_of_week"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia da Semana</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "monday"}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione o dia da semana" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {daysOfWeek.map((day) => (
                          <SelectItem key={day.id} value={day.id}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Selecione o dia da semana em que este título aparecerá.
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
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Adicionar Título
                  </>
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AddExerciseForm;
