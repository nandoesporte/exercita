
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WorkoutExercise } from '@/hooks/useAdminWorkouts';
import { ExerciseSelector } from './ExerciseSelector';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useIsMobile } from '@/hooks/use-mobile';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const formSchema = z.object({
  exercise_id: z.string().min(1, "Selecione um exercício"),
  sets: z.coerce.number().min(1, "Mínimo de 1 série").optional(),
  reps: z.coerce.number().min(1, "Mínimo de 1 repetição").optional(),
  weight: z.coerce.number().min(0, "Peso não pode ser negativo").optional(),
  duration: z.coerce.number().min(1, "Duração mínima de 1").optional(),
  duration_unit: z.enum(['seconds', 'minutes']).default('seconds'),
  rest: z.coerce.number().min(0, "Descanso não pode ser negativo").optional(),
  day_of_week: z.string().optional(),
});

interface AddExerciseFormProps {
  exercises: any[];
  onAddExercise: (data: WorkoutExercise) => void;
  currentExerciseCount: number;
  isLoading: boolean;
}

const daysOfWeek = [
  { value: 'monday', label: 'Segunda' },
  { value: 'tuesday', label: 'Terça' },
  { value: 'wednesday', label: 'Quarta' },
  { value: 'thursday', label: 'Quinta' },
  { value: 'friday', label: 'Sexta' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' },
];

const AddExerciseForm: React.FC<AddExerciseFormProps> = ({
  exercises,
  onAddExercise,
  currentExerciseCount,
  isLoading
}) => {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [selectedExerciseName, setSelectedExerciseName] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      exercise_id: '',
      sets: 3,
      reps: 12,
      weight: 0,
      duration: 0,
      duration_unit: 'seconds',
      rest: 30,
      day_of_week: '',
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // Convert duration to seconds if it was entered in minutes
    const duration = data.duration && data.duration_unit === 'minutes' 
      ? data.duration * 60 
      : data.duration;

    onAddExercise({
      ...data,
      duration,
      order_position: currentExerciseCount + 1,
    } as WorkoutExercise);
    
    form.reset({
      ...form.getValues(),
      exercise_id: '',
    });
    setSelectedExerciseName(null);
  };

  const handleSelectExercise = (exerciseId: string, exerciseName: string) => {
    form.setValue('exercise_id', exerciseId);
    setSelectedExerciseName(exerciseName);
    setIsSelectorOpen(false);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Exercise Selection */}
          <FormField
            control={form.control}
            name="exercise_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exercício</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input
                      value={selectedExerciseName || ''}
                      readOnly
                      placeholder="Selecione um exercício"
                      className="flex-1"
                      onClick={() => setIsSelectorOpen(true)}
                    />
                    <Button type="button" variant="outline" onClick={() => setIsSelectorOpen(true)}>
                      Escolher
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Day of Week */}
          <FormField
            control={form.control}
            name="day_of_week"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dia da Semana</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um dia da semana" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {daysOfWeek.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Rest of form fields */}
          <div className="grid grid-cols-2 gap-4">
            {/* Sets */}
            <FormField
              control={form.control}
              name="sets"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Séries</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reps */}
            <FormField
              control={form.control}
              name="reps"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repetições</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Weight */}
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Peso (kg)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Duration with unit selection */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="duration_unit"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Rest */}
            <FormField
              control={form.control}
              name="rest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descanso (segundos)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              "Adicionar Exercício"
            )}
          </Button>
        </form>
      </Form>

      {/* Exercise selector - conditional rendering based on device type */}
      {isMobile ? (
        <Drawer open={isSelectorOpen} onOpenChange={setIsSelectorOpen}>
          <DrawerContent className="px-4 pb-6 pt-2">
            <DrawerHeader>
              <DrawerTitle>Selecionar Exercício</DrawerTitle>
            </DrawerHeader>
            <ExerciseSelector 
              onSelectExercise={handleSelectExercise} 
              onClose={() => setIsSelectorOpen(false)}
            />
            <DrawerClose />
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isSelectorOpen} onOpenChange={setIsSelectorOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Selecionar Exercício</DialogTitle>
            </DialogHeader>
            <ExerciseSelector onSelectExercise={handleSelectExercise} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default AddExerciseForm;
