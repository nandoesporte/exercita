
import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { WorkoutExercise } from '@/hooks/useAdminWorkouts';
import { toast } from '@/lib/toast';

interface Exercise {
  id: string;
  name: string;
  category_id?: string | null;
  category?: {
    id: string;
    name: string;
  } | null;
}

interface AddExerciseFormProps {
  exercises: Exercise[];
  onAddExercise: (exerciseData: WorkoutExercise) => void;
  currentExerciseCount: number;
  isLoading?: boolean;
}

const AddExerciseForm: React.FC<AddExerciseFormProps> = ({
  exercises,
  onAddExercise,
  currentExerciseCount,
  isLoading = false
}) => {
  const [selectedTab, setSelectedTab] = useState<'exercise' | 'title'>('exercise');
  const [exerciseId, setExerciseId] = useState<string>('');
  const [sets, setSets] = useState<string>('3');
  const [reps, setReps] = useState<string>('12');
  const [duration, setDuration] = useState<string>('');
  const [rest, setRest] = useState<string>('30');
  const [weight, setWeight] = useState<string>('');
  const [dayOfWeek, setDayOfWeek] = useState<string | null>(null);
  const [sectionTitle, setSectionTitle] = useState<string>('');

  const days = [
    { id: 'monday', name: 'Segunda-feira' },
    { id: 'tuesday', name: 'Terça-feira' },
    { id: 'wednesday', name: 'Quarta-feira' },
    { id: 'thursday', name: 'Quinta-feira' },
    { id: 'friday', name: 'Sexta-feira' },
    { id: 'saturday', name: 'Sábado' },
    { id: 'sunday', name: 'Domingo' },
    { id: '', name: 'Todos os dias' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedTab === 'title') {
      // Add section title
      if (!sectionTitle.trim()) {
        toast.error('Digite um título para a seção');
        return;
      }

      onAddExercise({
        is_title_section: true,
        section_title: sectionTitle.trim(),
        order_position: currentExerciseCount + 1,
        day_of_week: dayOfWeek || undefined,
      });

      // Reset form
      setSectionTitle('');
      toast.success('Título de seção adicionado');
      return;
    }

    // Regular exercise validation
    if (!exerciseId) {
      toast.error('Selecione um exercício');
      return;
    }

    // Add exercise
    onAddExercise({
      exercise_id: exerciseId,
      sets: parseInt(sets, 10) || undefined,
      reps: reps ? parseInt(reps, 10) : null,
      duration: duration ? parseInt(duration, 10) : null,
      rest: rest ? parseInt(rest, 10) : null,
      weight: weight ? parseFloat(weight) : null,
      order_position: currentExerciseCount + 1,
      day_of_week: dayOfWeek || undefined,
    });

    // Reset form
    setExerciseId('');
    toast.success('Exercício adicionado');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as 'exercise' | 'title')}>
        <TabsList className="grid grid-cols-2 w-full mb-4">
          <TabsTrigger value="exercise">Exercício</TabsTrigger>
          <TabsTrigger value="title">Título de Seção</TabsTrigger>
        </TabsList>
      </Tabs>

      {selectedTab === 'title' ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="section-title" className="flex items-center gap-1">
              <FileText className="h-4 w-4" /> Título da Seção
            </Label>
            <Input
              id="section-title"
              placeholder="Ex: Aquecimento, Parte Superior, etc."
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exercise">Exercício</Label>
            <Select value={exerciseId} onValueChange={setExerciseId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um exercício" />
              </SelectTrigger>
              <SelectContent>
                {exercises.map((exercise) => (
                  <SelectItem key={exercise.id} value={exercise.id}>
                    {exercise.name} {exercise.category?.name ? `(${exercise.category.name})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="sets">Séries</Label>
              <Input
                id="sets"
                placeholder="Séries"
                type="number"
                min="0"
                value={sets}
                onChange={(e) => setSets(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reps">Repetições</Label>
              <Input
                id="reps"
                placeholder="Repetições"
                type="number"
                min="0"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (segundos)</Label>
              <Input
                id="duration"
                placeholder="Duração"
                type="number"
                min="0"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rest">Descanso (segundos)</Label>
              <Input
                id="rest"
                placeholder="Descanso"
                type="number"
                min="0"
                value={rest}
                onChange={(e) => setRest(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Peso (kg)</Label>
            <Input
              id="weight"
              placeholder="Opcional"
              type="number"
              min="0"
              step="0.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="day">Dia da Semana (opcional)</Label>
        <Select value={dayOfWeek || ''} onValueChange={setDayOfWeek}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um dia (opcional)" />
          </SelectTrigger>
          <SelectContent>
            {days.map((day) => (
              <SelectItem key={day.id} value={day.id}>
                {day.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Adicionando...
          </span>
        ) : (
          selectedTab === 'title' ? 'Adicionar Título de Seção' : 'Adicionar Exercício'
        )}
      </Button>
    </form>
  );
};

export default AddExerciseForm;
