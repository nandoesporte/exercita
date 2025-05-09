
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Dumbbell, CalendarCheck, Activity, User, ArrowRight, Clock } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { useWorkouts } from '@/hooks/useWorkouts';

const Index = () => {
  const { user, isAdmin } = useAuth();
  const { profile } = useProfile();
  const { data: featuredWorkouts, isLoading } = useWorkouts();
  
  // Filter for featured workouts to display in carousel
  const recommendedWorkouts = featuredWorkouts?.filter(workout => 
    workout.is_featured || workout.level === (profile?.fitness_goal?.toLowerCase() || 'beginner')
  ).slice(0, 5);
  
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-fitness-dark to-fitness-darkGreen p-8 rounded-xl">
          <div className="max-w-2xl space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
              Your Personalized <span className="text-fitness-green">Fitness Journey</span>
            </h1>
            <p className="text-gray-200 md:text-xl">
              Custom workout plans tailored to your fitness goals and preferences.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <Button asChild size="lg" className="bg-fitness-green hover:bg-fitness-darkGreen">
                <Link to="/workouts">Explore Workouts</Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white/10">
                <Link to="/profile">Your Profile</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Personalized Welcome */}
      {profile && (
        <section className="bg-card border rounded-xl p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="space-y-1 flex-1">
              <h2 className="text-2xl font-bold">
                Welcome back, {profile.first_name || 'Fitness Enthusiast'}
              </h2>
              <p className="text-muted-foreground">
                Ready to continue your {profile.fitness_goal || 'fitness'} journey?
              </p>
            </div>
            
            {isAdmin && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <Link to="/admin" className="text-fitness-green font-medium hover:underline flex items-center gap-2">
                  Access Admin Dashboard <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>
        </section>
      )}
      
      {/* Featured Workouts Carousel */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Recommended For You</h2>
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fitness-green"></div>
          </div>
        ) : recommendedWorkouts && recommendedWorkouts.length > 0 ? (
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {recommendedWorkouts.map((workout) => (
                <CarouselItem key={workout.id} className="md:basis-1/2 lg:basis-1/3">
                  <Link to={`/workout/${workout.id}`} className="block h-full">
                    <Card className="h-full hover:shadow-md transition-shadow">
                      <div className="aspect-video relative overflow-hidden rounded-t-lg">
                        <img
                          src={workout.image_url || '/placeholder.svg'}
                          alt={workout.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                        <div className="absolute bottom-0 p-4 w-full">
                          <p className="text-white font-semibold text-lg">{workout.title}</p>
                          <span className="text-gray-200 text-sm capitalize">{workout.level}</span>
                        </div>
                      </div>
                      <CardContent className="pt-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{workout.duration} min</span>
                          </div>
                          {workout.calories && (
                            <div className="flex items-center gap-1">
                              <Activity className="h-4 w-4 text-muted-foreground" />
                              <span>{workout.calories} kcal</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-end mt-4 gap-2">
              <CarouselPrevious className="static translate-y-0 mr-2" />
              <CarouselNext className="static translate-y-0" />
            </div>
          </Carousel>
        ) : (
          <Card className="border-dashed">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No personalized workouts found. Explore our workout collection!</p>
            </CardContent>
          </Card>
        )}
      </section>
      
      {/* Quick Actions */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-fitness-green" /> Start Workout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Choose from our curated workout collection</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/workouts">Browse Workouts</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-fitness-green" /> Schedule Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Book a personal training session</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/appointments">Book Now</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-fitness-green" /> Track Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">See your workout history and results</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full" variant="outline">
              <Link to="/profile">View Stats</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-fitness-green" /> Personalized Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Create a custom fitness plan for your goals</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full" variant="outline">
              <Link to="/profile">Create Plan</Link>
            </Button>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
};

export default Index;
