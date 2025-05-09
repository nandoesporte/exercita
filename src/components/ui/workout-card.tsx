
import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Clock } from 'lucide-react';

interface WorkoutCardProps {
  id: string;
  title: string;
  image: string;
  duration: string;
  level: string;
  calories?: number;
}

export function WorkoutCard({ id, title, image, duration, level, calories }: WorkoutCardProps) {
  return (
    <Link
      to={`/workout/${id}`}
      className="fitness-card group block"
    >
      <div className="aspect-video relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
          <h3 className="text-white font-bold text-lg">{title}</h3>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center text-white text-sm gap-1">
              <Clock size={14} />
              <span>{duration}</span>
            </div>
            <div className="flex items-center text-white text-sm gap-1">
              <Dumbbell size={14} />
              <span>{level}</span>
            </div>
            {calories && (
              <div className="bg-fitness-green text-white text-xs px-2 py-0.5 rounded-full">
                {calories} kcal
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
