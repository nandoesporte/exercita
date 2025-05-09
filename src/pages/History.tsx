
import React from 'react';
import Header from '@/components/layout/Header';
import { History as HistoryIcon, Calendar, Clock, Dumbbell, Star, Flame } from 'lucide-react';
import { format } from 'date-fns';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';

const History = () => {
  const { data: workoutHistory, isLoading, error } = useWorkoutHistory();

  if (isLoading) {
    return (
      <>
        <Header title="Histórico" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fitness-green"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header title="Histórico" />
        <div className="container p-4 text-center">
          <p className="text-red-500">Erro ao carregar histórico. Tente novamente mais tarde.</p>
        </div>
      </>
    );
  }

  // Group workouts by month
  const groupedByMonth = workoutHistory?.reduce((acc, workout) => {
    const date = new Date(workout.completed_at);
    const monthYear = format(date, 'MMMM yyyy');
    
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    
    acc[monthYear].push(workout);
    return acc;
  }, {});

  const renderEmptyState = () => (
    <div className="text-center py-10">
      <HistoryIcon className="mx-auto h-16 w-16 text-muted-foreground opacity-50" />
      <h3 className="mt-4 font-semibold text-xl">Sem registros de treino</h3>
      <p className="text-muted-foreground mt-2 max-w-md mx-auto">
        Quando você concluir treinos, eles aparecerão aqui com detalhes como duração, 
        calorias queimadas e sua avaliação.
      </p>
    </div>
  );

  return (
    <>
      <Header title="Histórico" />
      
      <main className="container pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Meus Treinos</h2>
        </div>
        
        {!workoutHistory || workoutHistory.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedByMonth).map(([month, workouts]) => (
              <div key={month} className="space-y-3">
                <h3 className="text-lg font-medium text-fitness-green">{month}</h3>
                
                {workouts.map((workout) => (
                  <div key={workout.id} className="fitness-card p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">
                        {format(new Date(workout.completed_at), 'dd/MM/yyyy')}
                      </p>
                      {workout.rating && (
                        <div className="flex items-center gap-1 text-fitness-orange">
                          <Star size={16} fill="currentColor" />
                          <span className="text-sm">{workout.rating}/5</span>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-lg">{workout.workout.title}</h3>
                    
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock size={14} />
                        <span>{workout.duration || workout.workout.duration} min</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Dumbbell size={14} />
                        <span>{workout.workout.level}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Flame size={14} />
                        <span>{workout.calories_burned || workout.workout.calories} kcal</span>
                      </div>
                    </div>
                    
                    {workout.notes && (
                      <div className="mt-3 text-sm text-muted-foreground border-t border-border pt-2">
                        <p>{workout.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
};

export default History;
