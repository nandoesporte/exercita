
import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import { WorkoutCard } from '@/components/ui/workout-card';
import { Search } from 'lucide-react';

// Mock data
const workouts = [
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
  {
    id: '5',
    title: 'Lower Body Blast',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=750&q=80',
    duration: '40 min',
    level: 'Intermediate',
    calories: 320,
  },
  {
    id: '6',
    title: 'Yoga Flow',
    image: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=750&q=80',
    duration: '50 min',
    level: 'All Levels',
    calories: 180,
  },
];

// Filter categories
const categories = [
  'All',
  'Beginner',
  'Intermediate',
  'Advanced',
  'Quick',
  'Cardio',
  'Strength',
];

const Workouts = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter workouts based on active filter and search query
  const filteredWorkouts = workouts.filter((workout) => {
    const matchesFilter = activeFilter === 'All' || 
                          workout.level === activeFilter ||
                          (activeFilter === 'Quick' && parseInt(workout.duration) < 30);
                          
    const matchesSearch = searchQuery === '' ||
                         workout.title.toLowerCase().includes(searchQuery.toLowerCase());
                         
    return matchesFilter && matchesSearch;
  });

  return (
    <>
      <Header title="Workouts" showSearch={false} />
      
      <main className="container">
        <section className="mobile-section">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search workouts..."
              className="w-full pl-10 pr-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-fitness-green"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Filters */}
          <div className="flex overflow-x-auto gap-2 pb-3 mb-6 hide-scrollbar">
            {categories.map((category) => (
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
          
          {/* Workouts Grid */}
          {filteredWorkouts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWorkouts.map((workout) => (
                <WorkoutCard key={workout.id} {...workout} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No workouts found. Try another search.</p>
            </div>
          )}
        </section>
      </main>
    </>
  );
};

export default Workouts;
