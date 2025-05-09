
import React, { useState } from 'react';
import { Search, Filter, Edit, Trash2, Plus } from 'lucide-react';

// Mock workouts data
const workoutsData = [
  {
    id: '1',
    title: 'Full Body Workout',
    level: 'Intermediate',
    duration: '45 min',
    exercises: 8,
    createdAt: '2025-05-01',
  },
  {
    id: '2',
    title: 'HIIT Cardio',
    level: 'Advanced',
    duration: '30 min',
    exercises: 6,
    createdAt: '2025-05-02',
  },
  {
    id: '3',
    title: 'Core Strength',
    level: 'Beginner',
    duration: '25 min',
    exercises: 5,
    createdAt: '2025-05-03',
  },
  {
    id: '4',
    title: 'Upper Body Focus',
    level: 'Intermediate',
    duration: '35 min',
    exercises: 7,
    createdAt: '2025-05-04',
  },
  {
    id: '5',
    title: 'Lower Body Blast',
    level: 'Intermediate',
    duration: '40 min',
    exercises: 6,
    createdAt: '2025-05-05',
  },
  {
    id: '6',
    title: 'Yoga Flow',
    level: 'All Levels',
    duration: '50 min',
    exercises: 10,
    createdAt: '2025-05-06',
  },
];

const WorkoutManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter workouts based on search query
  const filteredWorkouts = workoutsData.filter((workout) => 
    workout.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workout.level.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Workout Management</h1>
        <button className="bg-fitness-green text-white px-4 py-2 rounded-lg hover:bg-fitness-darkGreen transition-colors flex items-center gap-2">
          <Plus size={16} />
          <span>Add Workout</span>
        </button>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search workouts..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-fitness-green"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors">
          <Filter size={16} />
          <span>Filter</span>
        </button>
      </div>
      
      {/* Workouts Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted">
                <th className="text-left py-3 px-4">Title</th>
                <th className="text-left py-3 px-4">Level</th>
                <th className="text-left py-3 px-4">Duration</th>
                <th className="text-left py-3 px-4">Exercises</th>
                <th className="text-left py-3 px-4">Created</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkouts.map((workout) => (
                <tr key={workout.id} className="border-t border-border hover:bg-muted/50">
                  <td className="py-3 px-4">{workout.title}</td>
                  <td className="py-3 px-4">{workout.level}</td>
                  <td className="py-3 px-4">{workout.duration}</td>
                  <td className="py-3 px-4">{workout.exercises}</td>
                  <td className="py-3 px-4">{workout.createdAt}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1 hover:bg-fitness-green/10 rounded text-fitness-green">
                        <Edit size={16} />
                      </button>
                      <button className="p-1 hover:bg-destructive/10 rounded text-destructive">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredWorkouts.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">
                    No workouts found. Try a different search term.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Showing {filteredWorkouts.length} of {workoutsData.length} workouts</p>
        <div className="flex gap-2">
          <button className="px-3 py-1 border rounded hover:bg-muted transition-colors" disabled>
            Previous
          </button>
          <button className="px-3 py-1 bg-fitness-green text-white rounded hover:bg-fitness-darkGreen transition-colors">
            1
          </button>
          <button className="px-3 py-1 border rounded hover:bg-muted transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutManagement;
