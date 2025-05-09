
import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Search, Bell, ArrowRight } from 'lucide-react';
import { WorkoutCard } from '@/components/ui/workout-card';
import Header from '@/components/layout/Header';

// Mock data
const featuredWorkouts = [
  {
    id: '1',
    title: 'Full Body Workout',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=750&q=80',
    duration: '45 min',
    level: 'Intermediate',
    calories: 350,
  },
  {
    id: '2',
    title: 'HIIT Cardio',
    image: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?ixlib=rb-4.0.3&auto=format&fit=crop&w=750&q=80',
    duration: '30 min',
    level: 'Advanced',
    calories: 400,
  },
];

const categories = [
  { id: '1', name: 'Cardio', icon: '🏃‍♂️', color: '#FF5733' },
  { id: '2', name: 'Strength', icon: '💪', color: '#33FF57' },
  { id: '3', name: 'Flexibility', icon: '🧘‍♀️', color: '#3357FF' },
  { id: '4', name: 'Full Body', icon: '👤', color: '#FF33A8' },
];

const popularWorkouts = [
  {
    id: '3',
    title: 'Core Strength',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=750&q=80',
    duration: '25 min',
    level: 'Beginner',
    calories: 200,
  },
  {
    id: '4',
    title: 'Upper Body Focus',
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?ixlib=rb-4.0.3&auto=format&fit=crop&w=750&q=80',
    duration: '35 min',
    level: 'Intermediate',
    calories: 280,
  },
];

const Index = () => {
  return (
    <>
      <Header showSearch showNotifications />
      
      <main className="container">
        {/* Welcome Section */}
        <section className="mobile-section">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Hey, Alex!</h2>
              <p className="text-muted-foreground">Ready for your workout?</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-fitness-green flex items-center justify-center text-white">
              <span className="font-semibold">A</span>
            </div>
          </div>
          
          {/* Quick Stats */}
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredWorkouts.map((workout) => (
              <WorkoutCard key={workout.id} {...workout} />
            ))}
          </div>
        </section>
        
        {/* Categories */}
        <section className="mobile-section">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Categories</h2>
            <Link to="/categories" className="text-fitness-green flex items-center text-sm font-medium">
              See all <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                to={`/category/${category.id}`}
                key={category.id}
                className="fitness-card group p-4 text-center"
                style={{ borderTop: `3px solid ${category.color}` }}
              >
                <div className="text-3xl mb-2">{category.icon}</div>
                <h3 className="font-medium group-hover:text-fitness-green transition-colors">{category.name}</h3>
              </Link>
            ))}
          </div>
        </section>
        
        {/* Popular Workouts */}
        <section className="mobile-section">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Popular Workouts</h2>
            <Link to="/workouts" className="text-fitness-green flex items-center text-sm font-medium">
              See all <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularWorkouts.map((workout) => (
              <WorkoutCard key={workout.id} {...workout} />
            ))}
          </div>
        </section>
        
        {/* Today's Plan */}
        <section className="mobile-section">
          <h2 className="text-xl font-bold mb-4">Today's Plan</h2>
          
          <div className="fitness-card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">11:00 AM - 11:45 AM</p>
              <span className="px-2 py-1 rounded-full text-xs bg-fitness-green/20 text-fitness-green">Upcoming</span>
            </div>
            <h3 className="font-semibold text-lg">Upper Body Strength</h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Dumbbell size={16} />
              <span>With Coach Mike</span>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button className="fitness-btn-secondary px-4 py-2">Reschedule</button>
              <button className="fitness-btn-primary px-4 py-2">Start</button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Index;
