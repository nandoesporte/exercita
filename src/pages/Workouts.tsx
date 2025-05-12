
import React, { useState } from 'react';
import { Search, Calendar } from 'lucide-react';
import { WorkoutCard } from '@/components/ui/workout-card';
import { useWorkouts, useWorkoutCategories, useWorkoutsByDay } from '@/hooks/useWorkouts';
import { Database } from '@/integrations/supabase/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Workout = Database['public']['Tables']['workouts']['Row'] & {
  category?: Database['public']['Tables']['workout_categories']['Row'] | null;
  days_of_week?: string[];
};

const weekdays = [
  { id: 'monday', label: 'Segunda' },
  { id: 'tuesday', label: 'Terça' },
  { id: 'wednesday', label: 'Quarta' },
  { id: 'thursday', label: 'Quinta' },
  { id: 'friday', label: 'Sexta' },
  { id: 'saturday', label: 'Sábado' },
  { id: 'sunday', label: 'Domingo' },
];

const Workouts = () => {
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  const { data: allWorkouts, isLoading: isLoadingAllWorkouts } = useWorkouts();
  const { data: dayWorkouts, isLoading: isLoadingDayWorkouts } = useWorkoutsByDay(selectedDay);
  const { data: categories, isLoading: isLoadingCategories } = useWorkoutCategories();
  
  const workouts = selectedDay ? dayWorkouts : allWorkouts;
  const isLoadingWorkouts = selectedDay ? isLoadingDayWorkouts : isLoadingAllWorkouts;
  
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
    <div className="container h-full">
      <section className="mobile-section h-full flex flex-col">
        {/* Weekly Schedule Tabs */}
        <Tabs defaultValue="all" onValueChange={(val) => setSelectedDay(val === 'all' ? null : val)} className="mb-6">
          <div className="flex items-center mb-2">
            <Calendar className="mr-2 h-4 w-4" />
            <h2 className="font-medium">Programação Semanal</h2>
          </div>
          <TabsList className="flex overflow-x-auto w-full">
            <TabsTrigger value="all" className="flex-shrink-0">Todos</TabsTrigger>
            {weekdays.map((day) => (
              <TabsTrigger key={day.id} value={day.id} className="flex-shrink-0">
                {day.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar treinos..."
            className="w-full pl-10 pr-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-fitness-green text-black"
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
          <div className="text-center py-12 flex-1 flex flex-col justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fitness-green mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando treinos...</p>
          </div>
        )}
        
        {/* Workouts Grid */}
        {!isLoadingWorkouts && filteredWorkouts && filteredWorkouts.length > 0 ? (
          <ScrollArea className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
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
                  daysOfWeek={workout.days_of_week}
                />
              ))}
            </div>
          </ScrollArea>
        ) : !isLoadingWorkouts && (
          <div className="text-center py-12 flex-1 flex flex-col justify-center">
            <p className="text-muted-foreground">Nenhum treino encontrado. Tente outra busca.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Workouts;
