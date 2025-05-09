import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const Index = () => {
  const { user, isAdmin } = useAuth();
  
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Welcome to FitFlow</h1>
        <p className="text-gray-500 md:text-xl dark:text-gray-400">
          Your personal fitness companion to achieve your health goals.
        </p>
        
        {isAdmin && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg inline-block">
            <Link to="/admin" className="text-fitness-green font-medium hover:underline">
              Access Admin Dashboard
            </Link>
          </div>
        )}
      </div>
      
      <div className="grid sm:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Start a new workout</CardTitle>
            <CardDescription>Get your body moving with our guided workouts.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Explore a variety of workouts tailored to your fitness level and goals.</p>
            <Button asChild>
              <Link to="/workouts">Explore Workouts</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Book an appointment</CardTitle>
            <CardDescription>Schedule a session with our expert trainers.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Personalized training sessions to help you achieve your fitness goals faster.</p>
            <Button asChild>
              <Link to="/appointments">Book Now</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
