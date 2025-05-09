
import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WorkoutExercise } from '@/hooks/useAdminWorkouts';

// Define form schema with Zod
const formSchema = z.object({
  exercise_id: z.string().min(1, { message: "Please select an exercise." }),
  sets: z.coerce.number().min(1, { message: "At least 1 set is required." }),
  reps: z.coerce.number().min(0).nullable().optional(),
  duration: z.coerce.number().min(0).nullable().optional(),
  rest: z.coerce.number().min(0).nullable().optional(),
});

interface AddExerciseFormProps {
  exercises: Database['public']['Tables']['exercises']['Row'][];
  onAddExercise: (data: WorkoutExercise) => void;
  currentExerciseCount: number;
  isLoading: boolean;
}

const AddExerciseForm = ({ 
  exercises, 
  onAddExercise, 
  currentExerciseCount,
  isLoading 
}: AddExerciseFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      exercise_id: "",
      sets: 3,
      reps: 10,
      duration: null,
      rest: 30,
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // Convert the form values to a WorkoutExercise object
    const exerciseData: WorkoutExercise = {
      exercise_id: values.exercise_id,
      sets: values.sets,
      reps: values.reps,
      duration: values.duration,
      rest: values.rest,
      order_position: currentExerciseCount + 1,
    };
    
    onAddExercise(exerciseData);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="exercise_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exercise</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select exercise" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[200px]">
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

          <FormField
            control={form.control}
            name="sets"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sets</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="3" 
                    {...field}
                    min={1}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="reps"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reps (optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="10" 
                    {...field}
                    value={field.value === null ? '' : field.value}
                    onChange={(e) => {
                      const val = e.target.value ? parseInt(e.target.value) : null;
                      field.onChange(val);
                    }}
                    min={0}
                  />
                </FormControl>
                <FormDescription>
                  Leave empty for timed exercises
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration in seconds (optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="30" 
                    {...field}
                    value={field.value === null ? '' : field.value}
                    onChange={(e) => {
                      const val = e.target.value ? parseInt(e.target.value) : null;
                      field.onChange(val);
                    }}
                    min={0}
                  />
                </FormControl>
                <FormDescription>
                  For timed exercises
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rest"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rest in seconds (optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="30" 
                    {...field}
                    value={field.value === null ? '' : field.value}
                    onChange={(e) => {
                      const val = e.target.value ? parseInt(e.target.value) : null;
                      field.onChange(val);
                    }}
                    min={0}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add Exercise
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default AddExerciseForm;
