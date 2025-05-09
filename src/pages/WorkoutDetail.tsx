
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { 
  Clock, Dumbbell, BarChart, Play, BookOpen, Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock workout data
const workoutData = {
  id: '1',
  title: 'Full Body Workout',
  image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=750&q=80',
  duration: '45',
  level: 'Intermediate',
  calories: 350,
  description: 'A comprehensive full-body workout that targets all major muscle groups. Perfect for intermediate fitness levels looking to build strength and endurance.',
  exercises: [
    { id: '1', name: 'Jumping Jacks', duration: '60 sec', sets: 1 },
    { id: '2', name: 'Push-ups', reps: '10-12', sets: 3 },
    { id: '3', name: 'Air Squats', reps: '15', sets: 3 },
    { id: '4', name: 'Plank', duration: '30 sec', sets: 3 },
    { id: '5', name: 'Mountain Climbers', duration: '45 sec', sets: 3 },
    { id: '6', name: 'Burpees', reps: '10', sets: 3 },
    { id: '7', name: 'Dumbbell Rows', reps: '12', sets: 3 },
    { id: '8', name: 'Lunges', reps: '10 each leg', sets: 3 },
  ],
};

const WorkoutDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Normally you'd fetch the workout data based on the ID
  const workout = workoutData;
  
  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <>
      <Header showBack onBackClick={handleBackClick} />
      
      <main className="container pb-6">
        {/* Hero Image */}
        <div className="relative h-64 md:h-80">
          <img
            src={workout.image}
            alt={workout.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
            <h1 className="text-white text-2xl md:text-3xl font-bold">{workout.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <div className="flex items-center text-white gap-1">
                <Clock size={14} />
                <span>{workout.duration} min</span>
              </div>
              <div className="flex items-center text-white gap-1">
                <Dumbbell size={14} />
                <span>{workout.level}</span>
              </div>
              <div className="flex items-center text-white gap-1">
                <BarChart size={14} />
                <span>{workout.calories} kcal</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'overview' 
                ? 'border-b-2 border-fitness-green text-fitness-green' 
                : 'text-muted-foreground'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'exercises' 
                ? 'border-b-2 border-fitness-green text-fitness-green' 
                : 'text-muted-foreground'
            }`}
            onClick={() => setActiveTab('exercises')}
          >
            Exercises
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'overview' ? (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-muted-foreground">{workout.description}</p>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold mb-3">What you'll need</h2>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-secondary rounded-full text-sm">Dumbbells</span>
                  <span className="px-3 py-1 bg-secondary rounded-full text-sm">Yoga Mat</span>
                  <span className="px-3 py-1 bg-secondary rounded-full text-sm">Water Bottle</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to={`/schedule/${workout.id}`}
                  className="fitness-btn-secondary px-4 py-3 flex items-center justify-center gap-2"
                >
                  <Calendar size={18} />
                  <span>Schedule</span>
                </Link>
                <Link
                  to={`/workout/${workout.id}/start`}
                  className="fitness-btn-primary px-4 py-3 flex items-center justify-center gap-2"
                >
                  <Play size={18} />
                  <span>Start Workout</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              <h2 className="text-lg font-semibold mb-4">Exercise List</h2>
              <div className="space-y-3">
                {workout.exercises.map((exercise, index) => (
                  <div key={exercise.id} className="flex items-center p-3 border rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-fitness-green/20 flex items-center justify-center text-fitness-green font-medium">
                      {index + 1}
                    </div>
                    <div className="ml-3 flex-grow">
                      <h3 className="font-medium">{exercise.name}</h3>
                      <div className="text-sm text-muted-foreground">
                        {exercise.sets} sets • {exercise.reps || exercise.duration}
                      </div>
                    </div>
                    <Link
                      to={`/exercise/${exercise.id}`}
                      className="p-2 text-fitness-green hover:bg-fitness-green/10 rounded-full"
                    >
                      <BookOpen size={18} />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default WorkoutDetail;
