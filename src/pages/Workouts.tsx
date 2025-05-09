
import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import { WorkoutCard } from '@/components/ui/workout-card';
import { Search } from 'lucide-react';
import { useWorkouts, useWorkoutCategories } from '@/hooks/useWorkouts';
import { Database } from '@/integrations/supabase/types';

type Workout = Database['public']['Tables']['workouts']['Row'] & {
  category?: Database['public']['Tables']['workout_categories']['Row'] | null;
};

const Workouts = () => {
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: workouts, isLoading: isLoadingWorkouts } = useWorkouts();
  const { data: categories, isLoading: isLoadingCategories } = useWorkoutCategories();
  
  // Combine built-in filters with category filters
  const filterCategories = ['Todos', 'Iniciante', 'Intermediário', 'Avançado', 'Rápido'];
  const allFilters = filterCategories.concat(
    categories?.map(c => c.name) || []
  ).filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
  
  // Filter workouts based on active filter and search query
  const filteredWorkouts = workouts?.filter((workout) => {
    let matchesFilter = true;
    
    // Handle special filters
    if (activeFilter === 'Todos') {
      matchesFilter = true;
    } else if (activeFilter === 'Iniciante') {
      matchesFilter = workout.level === 'beginner';
    } else if (activeFilter === 'Intermediário') {
      matchesFilter = workout.level === 'intermediate';
    } else if (activeFilter === 'Avançado') {
      matchesFilter = workout.level === 'advanced';
    } else if (activeFilter === 'Rápido') {
      matchesFilter = workout.duration < 30;
    } else {
      // Category filter
      matchesFilter = workout.category && workout.category.name === activeFilter;
    }
                          
    const matchesSearch = searchQuery === '' ||
      workout.title.toLowerCase().includes(searchQuery.toLowerCase());
                         
    return matchesFilter && matchesSearch;
  });

  return (
    <>
      <Header title="Treinos" showSearch={false} />
      
      <main className="container">
        <section className="mobile-section">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar treinos..."
              className="w-full pl-10 pr-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-fitness-green"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Filters */}
          <div className="flex overflow-x-auto gap-2 pb-3 mb-6 hide-scrollbar">
            {allFilters.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium ${
                  activeFilter === category
                    ? 'bg-fitness-green text-white'
                    : 'bg-secondary text-foreground'
                }`}
                onClick={() => setActiveFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* Loading state */}
          {isLoadingWorkouts && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fitness-green mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Carregando treinos...</p>
            </div>
          )}
          
          {/* Workouts Grid */}
          {!isLoadingWorkouts && filteredWorkouts && filteredWorkouts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWorkouts.map((workout) => (
                <WorkoutCard 
                  key={workout.id} 
                  id={workout.id}
                  title={workout.title}
                  image={workout.image_url || ''}
                  duration={`${workout.duration} min`}
                  level={workout.level === 'beginner' ? 'Iniciante' : 
                         workout.level === 'intermediate' ? 'Intermediário' : 
                         workout.level === 'advanced' ? 'Avançado' : workout.level}
                  calories={workout.calories || 0}
                />
              ))}
            </div>
          ) : !isLoadingWorkouts && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum treino encontrado. Tente outra busca.</p>
            </div>
          )}
        </section>
      </main>
    </>
  );
};

export default Workouts;
