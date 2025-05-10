
import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { useAdminExercises } from '@/hooks/useAdminExercises';
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import ExerciseForm from '@/components/admin/ExerciseForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from 'sonner';

const ExerciseManagement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [storageReady, setStorageReady] = useState<boolean | null>(null);
  
  const { 
    exercises, 
    isLoading, 
    error, 
    createExercise, 
    isCreating, 
    updateExercise,
    isUpdating,
    deleteExercise,
    isDeleting,
    categories,
    checkStorageBucket
  } = useAdminExercises();

  useEffect(() => {
    const verifyStorage = async () => {
      try {
        const result = await checkStorageBucket();
        setStorageReady(result);
        if (!result) {
          toast.error("Storage configuration issue detected. Some features may not work properly.");
        }
      } catch (e) {
        console.error("Error checking storage:", e);
        setStorageReady(false);
      }
    };
    
    verifyStorage();
  }, [checkStorageBucket]);

  const handleCreate = () => {
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (id: string) => {
    setSelectedExerciseId(id);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this exercise?')) {
      deleteExercise(id);
    }
  };

  const selectedExercise = selectedExerciseId 
    ? exercises.find(exercise => exercise.id === selectedExerciseId) 
    : null;

  const columns = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "category.name",
      header: "Category",
      cell: ({ row }: any) => row.original.category?.name || 'Uncategorized'
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleEdit(row.original.id)}
          >
            Edit
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => handleDelete(row.original.id)}
            disabled={isDeleting}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  if (error) {
    return (
      <div className="p-4 bg-destructive/20 rounded-md">
        <p className="text-destructive">Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Exercise Management</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Exercise
        </Button>
      </div>

      {storageReady === false && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Storage is not properly configured. Image uploads may not work correctly. Please check your console for more details.
          </AlertDescription>
        </Alert>
      )}

      <DataTable 
        columns={columns} 
        data={exercises} 
        isLoading={isLoading}
      />

      {/* Create Exercise Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Exercise</DialogTitle>
          </DialogHeader>
          <ExerciseForm 
            onSubmit={(data) => {
              createExercise(data);
              setIsCreateDialogOpen(false);
            }}
            isLoading={isCreating}
            categories={categories}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Exercise Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Exercise</DialogTitle>
          </DialogHeader>
          {selectedExercise && (
            <ExerciseForm 
              onSubmit={(data) => {
                updateExercise({
                  id: selectedExercise.id,
                  ...data
                });
                setIsEditDialogOpen(false);
              }}
              isLoading={isUpdating}
              categories={categories}
              initialData={selectedExercise}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExerciseManagement;
