import React, { useState } from 'react';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heading, ListPlus } from "lucide-react";

// Define form schema for exercises
const exerciseFormSchema = z.object({
  exercise_id: z.string({
    required_error: "Por favor selecione um exercício",
  }),
  sets: z.coerce.number().min(1, {
    message: "Mínimo de 1 série",
  }),
  reps: z.coerce.number().nullable().optional(),
  duration: z.coerce.number().nullable().optional(),
  rest: z.coerce.number().nullable().optional(),
  weight: z.coerce.number().nullable().optional(),
  day_of_week: z.string().nullable().optional(),
});

// Define form schema for title sections
const titleFormSchema = z.object({
  section_title: z.string().min(1, {
    message: "Título da seção é obrigatório",
  }),
  day_of_week: z.string().nullable().optional(),
});

interface Exercise {
  id: string;
  name: string;
}

interface AddExerciseFormProps {
  exercises: Exercise[];
  onAddExercise: (data: any) => void;
  onAddTitle: (data: any) => void;
  currentExerciseCount: number;
  isLoading?: boolean;
  selectedDay: string | null;
}

const AddExerciseForm: React.FC<AddExerciseFormProps> = ({
  exercises,
  onAddExercise,
  onAddTitle,
  currentExerciseCount,
  isLoading = false,
  selectedDay
}) => {
  const [formMode, setFormMode] = useState<'exercise' | 'title'>('exercise');
  const [exerciseType, setExerciseType] = useState<'reps' | 'duration'>('reps');
  
  // Form for adding exercises
  const exerciseForm = useForm<z.infer<typeof exerciseFormSchema>>({
    resolver: zodResolver(exerciseFormSchema),
    defaultValues: {
      sets: 3,
      reps: 10,
      duration: null,
      rest: 60,
      weight: null,
      day_of_week: selectedDay || null,
    },
  });

  // Form for adding title sections
  const titleForm = useForm<z.infer<typeof titleFormSchema>>({
    resolver: zodResolver(titleFormSchema),
    defaultValues: {
      section_title: "",
      day_of_week: selectedDay || null,
    },
  });

  // Update the day_of_week field when selectedDay changes
  React.useEffect(() => {
    exerciseForm.setValue('day_of_week', selectedDay);
    titleForm.setValue('day_of_week', selectedDay);
  }, [selectedDay, exerciseForm, titleForm]);

  const handleExerciseSubmit = (values: z.infer<typeof exerciseFormSchema>) => {
    const exerciseData = {
      ...values,
      order_position: currentExerciseCount + 1,
      // If exercise type is reps, set duration to null, otherwise set reps to null
      ...(exerciseType === 'reps' ? { duration: null } : { reps: null }),
    };
    
    onAddExercise(exerciseData);
    
    // Reset form but keep the selected exercise and sets values
    const currentExerciseId = exerciseForm.getValues('exercise_id');
    const currentSets = exerciseForm.getValues('sets');
    const currentRest = exerciseForm.getValues('rest');
    
    exerciseForm.reset({
      exercise_id: currentExerciseId,
      sets: currentSets,
      reps: exerciseType === 'reps' ? 10 : null,
      duration: exerciseType === 'duration' ? 30 : null,
      rest: currentRest,
      weight: null,
      day_of_week: selectedDay || null,
    });
  };

  const handleTitleSubmit = (values: z.infer<typeof titleFormSchema>) => {
    // Use the first exercise in the list as a placeholder for the required exercise_id field
    const placeholderExerciseId = exercises.length > 0 ? exercises[0].id : '';
    
    const titleData = {
      exercise_id: placeholderExerciseId,
      section_title: values.section_title,
      order_position: currentExerciseCount + 1,
      day_of_week: values.day_of_week,
    };
    
    onAddTitle(titleData);
    
    // Reset form
    titleForm.reset({
      section_title: "",
      day_of_week: selectedDay || null,
    });
  };

  return (
    <div className="space-y-4">
      <Tabs value={formMode} onValueChange={(value) => setFormMode(value as 'exercise' | 'title')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="exercise" className="flex items-center gap-2">
            <ListPlus size={16} />
            <span>Exercício</span>
          </TabsTrigger>
          <TabsTrigger value="title" className="flex items-center gap-2">
            <Heading size={16} />
            <span>Título</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="exercise" className="pt-4">
          <Form {...exerciseForm}>
            <form onSubmit={exerciseForm.handleSubmit(handleExerciseSubmit)} className="space-y-4">
              <FormField
                control={exerciseForm.control}
                name="exercise_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exercício</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um exercício" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {exercises.map((exercise) => (
                          <SelectItem key={exercise.id} value={exercise.id}>
                            {exercise.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={exerciseForm.control}
                    name="sets"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Séries</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} min="1" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div>
                    <FormLabel>Tipo</FormLabel>
                    <div className="flex mt-1">
                      <Button
                        type="button"
                        variant={exerciseType === 'reps' ? "default" : "outline"}
                        className={`rounded-l-md rounded-r-none flex-1 ${exerciseType === 'reps' ? 'bg-primary' : ''}`}
                        onClick={() => setExerciseType('reps')}
                      >
                        Repetições
                      </Button>
                      <Button
                        type="button"
                        variant={exerciseType === 'duration' ? "default" : "outline"}
                        className={`rounded-r-md rounded-l-none flex-1 ${exerciseType === 'duration' ? 'bg-primary' : ''}`}
                        onClick={() => setExerciseType('duration')}
                      >
                        Duração
                      </Button>
                    </div>
                  </div>
                </div>
                
                {exerciseType === 'reps' ? (
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
                            value={field.value === null ? '' : field.value} 
                            onChange={(e) => field.onChange(e.target.value === '' ? null : parseInt(e.target.value))}
                            min="1" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={exerciseForm.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duração (segundos)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            value={field.value === null ? '' : field.value} 
                            onChange={(e) => field.onChange(e.target.value === '' ? null : parseInt(e.target.value))}
                            min="1" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
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
                          value={field.value === null ? '' : field.value} 
                          onChange={(e) => field.onChange(e.target.value === '' ? null : parseInt(e.target.value))}
                          min="0" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={exerciseForm.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso (kg - opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          value={field.value === null ? '' : field.value} 
                          onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                          min="0"
                          step="0.5" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⭘</span>
                    Adicionando...
                  </>
                ) : (
                  'Adicionar Exercício'
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>
        
        <TabsContent value="title" className="pt-4">
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
                        {...field} 
                        placeholder="Ex: Aquecimento, Treino Principal, etc."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⭘</span>
                    Adicionando...
                  </>
                ) : (
                  'Adicionar Título'
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
