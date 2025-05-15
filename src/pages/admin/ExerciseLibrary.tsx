import React, { useState } from 'react';
import { Search, Plus, Upload } from 'lucide-react';
import { useAdminExercises } from '@/hooks/useAdminExercises';
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import ExerciseForm from '@/components/admin/ExerciseForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BatchUploadForm from '@/components/admin/BatchUploadForm';
import { Input } from "@/components/ui/input";
import { toast } from '@/components/ui/use-toast';

const ExerciseLibrary = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBatchUploadOpen, setIsBatchUploadOpen] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
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
    if (window.confirm('Tem certeza que deseja excluir este exercício?')) {
      deleteExercise(id);
    }
  };

  const handleBatchUpload = () => {
    setIsBatchUploadOpen(true);
  };

  const selectedExercise = selectedExerciseId 
    ? exercises.find(exercise => exercise.id === selectedExerciseId) 
    : null;

  // Filter exercises based on search query and category
  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = searchQuery.toLowerCase() === '' || 
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeTab === 'all' || 
      exercise.category?.id === activeTab;
    
    return matchesSearch && matchesCategory;
  });

  const columns = [
    {
      accessorKey: "name",
      header: "Nome",
    },
    {
      accessorKey: "category.name",
      header: "Categoria",
      cell: ({ row }: any) => row.original.category?.name || 'Sem categoria'
    },
    {
      accessorKey: "image",
      header: "Imagem",
      cell: ({ row }: any) => (
        row.original.image_url ? (
          <div className="w-12 h-12 relative">
            <img 
              src={row.original.image_url} 
              alt={row.original.name} 
              className="absolute inset-0 w-full h-full object-cover rounded-md"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          </div>
        ) : (
          <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
            N/A
          </div>
        )
      )
    },
    {
      accessorKey: "actions",
      header: "Ações",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleEdit(row.original.id)}
          >
            Editar
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => handleDelete(row.original.id)}
            disabled={isDeleting}
          >
            Excluir
          </Button>
        </div>
      )
    }
  ];

  if (error) {
    return (
      <div className="p-4 bg-destructive/20 rounded-md">
        <p className="text-destructive">Erro: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Biblioteca de Exercícios</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleBatchUpload}>
            <Upload className="mr-2 h-4 w-4" />
            Upload em Lote
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Criar Exercício
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar exercícios..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="all">Todos</TabsTrigger>
            {categories.map(category => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <DataTable 
        columns={columns} 
        data={filteredExercises} 
        isLoading={isLoading}
      />

      {/* Create Exercise Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Criar Novo Exercício</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
            <ExerciseForm 
              onSubmit={(data) => {
                createExercise(data);
                setIsCreateDialogOpen(false);
              }}
              isLoading={isCreating}
              categories={categories}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Edit Exercise Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Editar Exercício</DialogTitle>
          </DialogHeader>
          {selectedExercise && (
            <ScrollArea className="max-h-[70vh] pr-4">
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
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Batch Upload Dialog */}
      <Dialog open={isBatchUploadOpen} onOpenChange={setIsBatchUploadOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Upload em Lote de Exercícios</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
            <BatchUploadForm
              onComplete={() => {
                setIsBatchUploadOpen(false);
              }}
              categories={categories}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExerciseLibrary;
