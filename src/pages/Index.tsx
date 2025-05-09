
import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, ArrowRight } from 'lucide-react';
import { WorkoutCard } from '@/components/ui/workout-card';
import Header from '@/components/layout/Header';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const Index = () => {
  const { user } = useAuth();
  
  // Featured Workouts
  const { data: featuredWorkouts, isLoading: isLoadingFeatured } = useQuery({
    queryKey: ['featured-workouts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('is_featured', true)
        .limit(2);
        
      if (error) throw error;
      return data;
    }
  });
  
  // Workout Categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_categories')
        .select('*')
        .limit(4);
        
      if (error) throw error;
      return data;
    }
  });
  
  // Popular Workouts (most recently added)
  const { data: popularWorkouts, isLoading: isLoadingPopular } = useQuery({
    queryKey: ['popular-workouts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(2);
        
      if (error) throw error;
      return data;
    }
  });
  
  // Next Appointment
  const { data: nextAppointment, isLoading: isLoadingAppointment } = useQuery({
    queryKey: ['next-appointment', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'scheduled')
        .gte('appointment_date', new Date().toISOString())
        .order('appointment_date', { ascending: true })
        .limit(1)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned" error
      return data || null;
    },
    enabled: !!user
  });

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const handleStartWorkout = () => {
    toast.info("Start workout feature coming soon!");
  };
  
  const handleReschedule = () => {
    toast.info("Reschedule feature coming soon!");
  };

  return (
    <>
      <Header showSearch showNotifications />
      
      <main className="container">
        {/* Welcome Section */}
        <section className="mobile-section">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Hey, {user?.user_metadata?.first_name || 'there'}!</h2>
              <p className="text-muted-foreground">Ready for your workout?</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-fitness-green flex items-center justify-center text-white">
              <span className="font-semibold">{user?.user_metadata?.first_name?.[0] || '?'}</span>
            </div>
          </div>
          
          {/* Quick Stats - Placeholder, could be implemented with actual stats later */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="fitness-card p-4">
              <p className="text-xs text-muted-foreground">This week</p>
              <p className="text-2xl font-bold">3/5</p>
              <p className="text-sm">Workouts done</p>
            </div>
            <div className="fitness-card p-4">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">950</p>
              <p className="text-sm">Calories burned</p>
            </div>
          </div>
        </section>
        
        {/* Featured Workouts */}
        <section className="mobile-section">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Featured Workouts</h2>
            <Link to="/workouts" className="text-fitness-green flex items-center text-sm font-medium">
              See all <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          
          {isLoadingFeatured ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fitness-green"></div>
            </div>
          ) : featuredWorkouts && featuredWorkouts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredWorkouts.map((workout) => (
                <WorkoutCard 
                  key={workout.id} 
                  id={workout.id}
                  title={workout.title}
                  image={workout.image_url || ''}
                  duration={`${workout.duration} min`}
                  level={workout.level}
                  calories={workout.calories || 0}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No featured workouts available
            </div>
          )}
        </section>
        
        {/* Categories */}
        <section className="mobile-section">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Categories</h2>
            <Link to="/workouts" className="text-fitness-green flex items-center text-sm font-medium">
              See all <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          
          {isLoadingCategories ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fitness-green"></div>
            </div>
          ) : categories && categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Link
                  to={`/workouts`}
                  key={category.id}
                  className="fitness-card group p-4 text-center"
                  style={{ borderTop: `3px solid ${category.color}` }}
                >
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <h3 className="font-medium group-hover:text-fitness-green transition-colors">{category.name}</h3>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No categories available
            </div>
          )}
        </section>
        
        {/* Popular Workouts */}
        <section className="mobile-section">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Popular Workouts</h2>
            <Link to="/workouts" className="text-fitness-green flex items-center text-sm font-medium">
              See all <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          
          {isLoadingPopular ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fitness-green"></div>
            </div>
          ) : popularWorkouts && popularWorkouts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {popularWorkouts.map((workout) => (
                <WorkoutCard 
                  key={workout.id} 
                  id={workout.id}
                  title={workout.title}
                  image={workout.image_url || ''}
                  duration={`${workout.duration} min`}
                  level={workout.level}
                  calories={workout.calories || 0}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No popular workouts available
            </div>
          )}
        </section>
        
        {/* Today's Plan */}
        <section className="mobile-section">
          <h2 className="text-xl font-bold mb-4">Today's Plan</h2>
          
          {isLoadingAppointment ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fitness-green"></div>
            </div>
          ) : nextAppointment ? (
            <div className="fitness-card p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">
                  {formatTime(nextAppointment.appointment_date)} - 
                  {formatTime(new Date(new Date(nextAppointment.appointment_date).getTime() + nextAppointment.duration * 60000).toISOString())}
                </p>
                <span className="px-2 py-1 rounded-full text-xs bg-fitness-green/20 text-fitness-green">Upcoming</span>
              </div>
              <h3 className="font-semibold text-lg">{nextAppointment.title}</h3>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Dumbbell size={16} />
                <span>With {nextAppointment.trainer_name}</span>
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button 
                  className="fitness-btn-secondary px-4 py-2"
                  onClick={handleReschedule}
                >
                  Reschedule
                </button>
                <button 
                  className="fitness-btn-primary px-4 py-2"
                  onClick={handleStartWorkout}
                >
                  Start
                </button>
              </div>
            </div>
          ) : (
            <div className="fitness-card p-4 text-center">
              <p className="text-muted-foreground">No appointments scheduled for today.</p>
              <Link
                to="/appointments"
                className="inline-block fitness-btn-primary px-4 py-2 mt-4"
              >
                Schedule a Session
              </Link>
            </div>
          )}
        </section>
      </main>
    </>
  );
};

export default Index;
