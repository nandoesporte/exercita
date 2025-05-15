import React, { useState } from 'react';
import { Search, Upload, FileImage, FileVideo, Plus } from 'lucide-react';
import { useAdminExercises } from '@/hooks/useAdminExercises';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from '@/lib/toast-wrapper';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ExerciseForm from '@/components/admin/ExerciseForm';
import BatchUploadForm from '@/components/admin/BatchUploadForm';
import ExerciseGallery from '@/components/admin/ExerciseGallery';

const ExerciseLibrary = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isBatchUploadOpen, setIsBatchUploadOpen] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'table' | 'gallery'>('table');
  
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
    processExerciseBatch,
    isBatchProcessing
  } = useAdminExercises();

  const filteredExercises = exercises.filter(exercise => 
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exercise.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exercise.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCreate = () => {
    setIsCreateDialogOpen(true);
  };

  const handleBatchUpload = () => {
    setIsBatchUploadOpen(true);
  };

  const handleEdit = (id: string) => {
    setSelectedExerciseId(id);
    setIsCreateDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this exercise?')) {
      deleteExercise(id);
    }
  };

  const handleBatchSubmit = async (data: FormData) => {
    try {
      await processExerciseBatch(data);
      setIsBatchUploadOpen(false);
      toast.success('Batch upload processed successfully');
    } catch (error) {
      console.error('Error processing batch:', error);
      toast.error('Failed to process batch upload');
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
      accessorKey: "has_image",
      header: "Media",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1">
          {row.original.image_url && <FileImage className="h-4 w-4 text-blue-500" />}
          {row.original.video_url && <FileVideo className="h-4 w-4 text-red-500" />}
        </div>
      )
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Biblioteca de Exercícios</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleBatchUpload}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload em Lote
          </Button>
          <Button 
            onClick={handleCreate}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Exercício
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filtrar Exercícios</CardTitle>
          <CardDescription>
            Busque exercícios por nome, descrição ou categoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center border rounded-md pl-3 pr-1 focus-within:ring-1 focus-within:ring-ring">
            <Search className="h-4 w-4 text-muted-foreground mr-2" />
            <Input
              placeholder="Buscar exercícios..."
              value={searchQuery}
              onChange={handleSearch}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as 'table' | 'gallery')}>
        <div className="flex justify-between items-center mb-2">
          <TabsList>
            <TabsTrigger value="table">Tabela</TabsTrigger>
            <TabsTrigger value="gallery">Galeria</TabsTrigger>
          </TabsList>
          <div className="text-sm text-muted-foreground">
            {filteredExercises.length} exercícios encontrados
          </div>
        </div>

        <TabsContent value="table" className="mt-0">
          <DataTable 
            columns={columns} 
            data={filteredExercises} 
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="gallery" className="mt-0">
          <ExerciseGallery
            exercises={filteredExercises}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Create/Edit Exercise Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {selectedExerciseId ? 'Editar Exercício' : 'Criar Novo Exercício'}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[70vh] pr-4">
            <ExerciseForm 
              onSubmit={(data) => {
                if (selectedExerciseId) {
                  updateExercise({
                    id: selectedExerciseId,
                    ...data
                  });
                } else {
                  createExercise(data);
                }
                setIsCreateDialogOpen(false);
                setSelectedExerciseId(null);
              }}
              isLoading={isCreating || isUpdating}
              categories={categories}
              initialData={selectedExercise || undefined}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Batch Upload Dialog */}
      <Dialog open={isBatchUploadOpen} onOpenChange={setIsBatchUploadOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upload em Lote de Exercícios</DialogTitle>
          </DialogHeader>
          <BatchUploadForm 
            onSubmit={handleBatchSubmit}
            isLoading={isBatchProcessing}
            categories={categories}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExerciseLibrary;
