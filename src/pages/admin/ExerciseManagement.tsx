
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAdminExercises } from '@/hooks/useAdminExercises';
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import ExerciseForm from '@/components/admin/ExerciseForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const ExerciseManagement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  
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
    categories
  } = useAdminExercises();

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
