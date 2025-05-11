
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Trash2, PenSquare, Dumbbell
} from 'lucide-react';
import { useAdminWorkouts } from '@/hooks/useAdminWorkouts';
import { useIsMobile } from '@/hooks/use-mobile';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const WorkoutManagement = () => {
  const navigate = useNavigate();
  const { workouts, isLoading, deleteWorkout } = useAdminWorkouts();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  const filteredWorkouts = workouts.filter(workout => 
    workout.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateNew = () => {
    navigate('/admin/workouts/new');
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/workouts/${id}/edit`);
  };

  const handleEditExercises = (id: string) => {
    navigate(`/admin/workouts/${id}/exercises`);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteWorkout(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Workout Management</h1>
        <Button onClick={handleCreateNew} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Create New
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          placeholder="Search workouts..." 
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {isLoading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading workouts...</p>
        </div>
      ) : filteredWorkouts.length > 0 ? (
        isMobile ? (
          // Mobile view - cards
          <div className="grid grid-cols-1 gap-4">
            {filteredWorkouts.map((workout) => (
              <Card key={workout.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{workout.title}</CardTitle>
                </CardHeader>
                <CardContent className="pb-3 pt-0">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Level:</div>
                    <div className="capitalize">{workout.level}</div>
                    
                    <div className="text-muted-foreground">Duration:</div>
                    <div>{workout.duration} min</div>
                    
                    <div className="text-muted-foreground">Category:</div>
                    <div>{workout.category?.name || 'Uncategorized'}</div>
                  </div>
                </CardContent>
                <CardFooter className="flex-wrap gap-2 border-t pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(workout.id)}
                  >
                    <PenSquare className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditExercises(workout.id)}
                  >
                    <Dumbbell className="h-4 w-4 mr-2" />
                    Exercises
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDeleteClick(workout.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          // Desktop view - table
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Title</th>
                    <th className="text-left py-3 px-4 font-medium">Level</th>
                    <th className="text-left py-3 px-4 font-medium">Duration</th>
                    <th className="text-left py-3 px-4 font-medium">Category</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkouts.map((workout) => (
                    <tr key={workout.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{workout.title}</td>
                      <td className="py-3 px-4 capitalize">{workout.level}</td>
                      <td className="py-3 px-4">{workout.duration} min</td>
                      <td className="py-3 px-4">{workout.category?.name || 'Uncategorized'}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditExercises(workout.id)}
                            title="Edit Exercises"
                          >
                            <Dumbbell className="h-4 w-4" />
                            <span className="sr-only">Edit Exercises</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(workout.id)}
                            title="Edit Workout"
                          >
                            <PenSquare className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(workout.id)}
                            title="Delete Workout"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No workouts found</p>
          <Button variant="link" onClick={handleCreateNew}>Create your first workout</Button>
        </div>
      )}
      
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the 
              selected workout and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WorkoutManagement;
