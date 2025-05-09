
import React, { useState } from 'react';
import { Search, Filter, Edit, Trash2, Plus, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAdminWorkouts } from '@/hooks/useAdminWorkouts';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

const WorkoutManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { workouts, isLoading, error, deleteWorkout, isDeleting } = useAdminWorkouts();
  
  // Filter workouts based on search query
  const filteredWorkouts = workouts.filter((workout) => 
    workout.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workout.level.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workout.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteWorkout = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteWorkout(id);
    }
  };

  if (error) {
    toast.error("Failed to load workouts");
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Workout Management</h1>
        <Link 
          to="/admin/workouts/new" 
          className="bg-fitness-green text-white px-4 py-2 rounded-lg hover:bg-fitness-darkGreen transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          <span>Add Workout</span>
        </Link>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-6 w-6 animate-spin text-fitness-green mr-2" />
                      <span>Loading workouts...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredWorkouts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No workouts found. Try a different search term.
                  </TableCell>
                </TableRow>
              ) : (
                filteredWorkouts.map((workout) => (
                  <TableRow key={workout.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{workout.title}</TableCell>
                    <TableCell className="capitalize">{workout.level}</TableCell>
                    <TableCell>
                      <span 
                        className="px-2 py-1 text-xs rounded-full" 
                        style={{ 
                          backgroundColor: workout.category?.color ? `${workout.category.color}20` : '#e5e5e5',
                          color: workout.category?.color || '#666' 
                        }}
                      >
                        {workout.category?.name || 'Uncategorized'}
                      </span>
                    </TableCell>
                    <TableCell>{workout.duration} min</TableCell>
                    <TableCell>
                      {workout.created_at ? (
                        formatDistanceToNow(new Date(workout.created_at), { addSuffix: true })
                      ) : (
                        'Unknown'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link 
                          to={`/admin/workouts/edit/${workout.id}`} 
                          className="p-1 hover:bg-fitness-green/10 rounded text-fitness-green"
                        >
                          <Edit size={16} />
                        </Link>
                        <button 
                          className="p-1 hover:bg-destructive/10 rounded text-destructive"
                          onClick={() => handleDeleteWorkout(workout.id, workout.title)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Pagination - Will be implemented with real data pagination later */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredWorkouts.length} of {workouts.length} workouts
        </p>
      </div>
    </div>
  );
};

export default WorkoutManagement;
