
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Dumbbell, Clock, Activity, MapPin, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { useWorkouts } from '@/hooks/useWorkouts';

const Index = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { data: workouts } = useWorkouts();
  const [workoutLevel, setWorkoutLevel] = useState('intermediate');
  
  // Get the recommended workout based on user's fitness level or default to first featured workout
  const recommendedWorkout = workouts?.find(workout => 
    workout.level === (profile?.fitness_goal?.toLowerCase() || workoutLevel)
  ) || workouts?.[0];
  
  return (
    <div className="space-y-6">
      {/* Hero Section with Personalized Plans */}
      <section className="text-center mb-8 pt-4">
        <h1 className="text-3xl md:text-4xl font-bold text-fitness-green mb-2">
          Personalized Plans
        </h1>
        <p className="text-xl text-gray-200">
          built only for you
        </p>
      </section>
      
      {/* Main Workout Card */}
      <section className="mb-8">
        <Card className="bg-fitness-darkGray border-none text-white">
          <CardContent className="p-6 space-y-6">
            {/* Gym Selector */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">Gym</h2>
                <ChevronDown size={20} />
              </div>
              
              <div className="flex items-center gap-3">
                <span className="bg-fitness-green text-black px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                  <Activity size={16} className="mr-1" /> PREMIUM
                </span>
                <button className="text-white">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 5h18M3 12h18M3 19h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
                <button className="text-white">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M19.4 15C19.1277 15.6171 19.2583 16.3378 19.73 16.82L19.79 16.88C20.1656 17.2554 20.3766 17.7644 20.3766 18.295C20.3766 18.8256 20.1656 19.3346 19.79 19.71C19.4146 20.0856 18.9055 20.2966 18.375 20.2966C17.8445 20.2966 17.3354 20.0856 16.96 19.71L16.9 19.65C16.4178 19.1783 15.6971 19.0477 15.08 19.32C14.4755 19.5791 14.0826 20.1724 14.08 20.83V21C14.08 22.1046 13.1846 23 12.08 23C10.9754 23 10.08 22.1046 10.08 21V20.91C10.0642 20.2387 9.64778 19.6424 9.02 19.4C8.40293 19.1277 7.68218 19.2583 7.20003 19.73L7.14003 19.79C6.76462 20.1656 6.25559 20.3766 5.72503 20.3766C5.19447 20.3766 4.68544 20.1656 4.31003 19.79C3.93443 19.4146 3.72343 18.9055 3.72343 18.375C3.72343 17.8445 3.93443 17.3354 4.31003 16.96L4.37003 16.9C4.84177 16.4178 4.97237 15.6971 4.70003 15.08C4.44096 14.4755 3.84766 14.0826 3.19 14.08H3C1.89543 14.08 1 13.1846 1 12.08C1 10.9754 1.89543 10.08 3 10.08H3.09003C3.76129 10.0642 4.3576 9.64778 4.60003 9.02C4.87237 8.40293 4.74177 7.68218 4.27003 7.2L4.21003 7.14C3.83443 6.76459 3.62343 6.25556 3.62343 5.725C3.62343 5.19444 3.83443 4.68541 4.21003 4.31C4.58544 3.9344 5.09447 3.7234 5.62503 3.7234C6.15559 3.7234 6.66462 3.9344 7.04003 4.31L7.10003 4.37C7.58218 4.84174 8.30293 4.97234 8.92 4.7C9.52447 4.44093 9.91738 3.84763 9.92003 3.19V3C9.92003 1.89543 10.8155 1 11.92 1C13.0246 1 13.92 1.89543 13.92 3V3.09C13.9227 3.74763 14.3156 4.34093 14.92 4.6C15.5371 4.87234 16.2578 4.74174 16.74 4.27L16.8 4.21C17.1754 3.8344 17.6845 3.6234 18.215 3.6234C18.7456 3.6234 19.2546 3.8344 19.63 4.21C20.0056 4.58541 20.2166 5.09444 20.2166 5.625C20.2166 6.15556 20.0056 6.66459 19.63 7.04L19.57 7.1C19.0983 7.58215 18.9677 8.3029 19.24 8.92C19.4991 9.52447 20.0924 9.91738 20.75 9.92H21C22.1046 9.92 23 10.8155 23 11.92C23 13.0246 22.1046 13.92 21 13.92H20.91C20.2524 13.9227 19.6591 14.3156 19.4 14.92V15Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Workout Details */}
            <div>
              <h3 className="text-xl font-bold">
                {recommendedWorkout?.title || 'Muscle Gain (Intermediate)'}
              </h3>
              <div className="flex justify-between mt-1">
                <Link to="/workouts" className="text-sm text-gray-300 hover:text-fitness-green">
                  View more <span>&gt;</span>
                </Link>
              </div>
              
              {/* Workout Parameters */}
              <div className="flex flex-wrap gap-2 mt-4">
                <div className="bg-fitness-dark p-3 rounded-md flex items-center gap-2 min-w-[100px]">
                  <span>Day</span>
                  <div className="flex items-center ml-auto">
                    <span className="font-bold">3</span>
                    <ChevronDown size={16} className="ml-1" />
                  </div>
                </div>
                
                <div className="bg-fitness-dark p-3 rounded-md flex items-center gap-2 min-w-[140px]">
                  <span>Duration</span>
                  <div className="flex items-center ml-auto">
                    <span className="font-bold">Normal</span>
                    <ChevronDown size={16} className="ml-1" />
                  </div>
                </div>
                
                <div className="bg-fitness-dark p-3 rounded-md flex items-center min-w-[100px]">
                  <span>Condition</span>
                </div>
              </div>
              
              {/* Target Areas */}
              <div className="mt-4">
                <div className="bg-fitness-dark p-4 rounded-md">
                  <div className="mb-2">
                    <span className="font-bold">Target</span>
                    <span className="ml-2 text-gray-300">Leg, Core, Cardio</span>
                  </div>
                  
                  {/* Workout Stats */}
                  <div className="flex justify-between mt-4">
                    <div className="text-center">
                      <div className="flex justify-center mb-2">
                        <Dumbbell size={28} className="text-gray-300" />
                      </div>
                      <div className="text-lg font-bold">7 exercises</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex justify-center mb-2">
                        <Clock size={28} className="text-gray-300" />
                      </div>
                      <div className="text-lg font-bold">25 sets</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex justify-center mb-2">
                        <Activity size={28} className="text-gray-300" />
                      </div>
                      <div className="text-lg font-bold">377kcal</div>
                    </div>
                  </div>
                  
                  {/* Start Workout Button */}
                  <Button 
                    className="w-full mt-6 bg-fitness-green hover:bg-fitness-green/90 text-black text-lg font-semibold h-14 rounded-xl"
                    asChild
                  >
                    <Link to={`/workout/${recommendedWorkout?.id || ''}`}>Start Workout</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
      
      {/* My Gym Section */}
      <section>
        <h2 className="text-xl font-bold mb-4">My Gym</h2>
        
        <Card className="bg-fitness-darkGray border-none text-white">
          <CardContent className="p-4">
            <Link 
              to="/find-gym" 
              className="flex items-center justify-between p-3 hover:bg-fitness-dark rounded-lg transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="bg-fitness-green h-10 w-10 rounded-full flex items-center justify-center">
                  <MapPin className="text-black" size={20} />
                </div>
                <div>
                  <h3 className="font-bold">Find My Gym</h3>
                  <p className="text-sm text-gray-300">Get workouts based on your gym</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-300" />
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Index;
