import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
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
import { WorkoutCategoryForm } from '@/components/admin/WorkoutCategoryForm';
import { DataTable } from "@/components/ui/data-table";
import { useWorkoutCategories, WorkoutCategory } from '@/hooks/useWorkoutCategories';

const WorkoutCategoryManagement = () => {
  const navigate = useNavigate();
  const { categories, isLoadingCategories, deleteCategory, isDeleting } = useWorkoutCategories();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<WorkoutCategory | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const handleCreateNew = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleEdit = (category: WorkoutCategory) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      try {
        await deleteCategory(deleteId);
        setDeleteId(null);
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const columns = [
    {
      accessorKey: 'name',
      header: 'Nome',
    },
    {
      accessorKey: 'color',
      header: 'Cor',
      cell: ({ row }: { row: { original: WorkoutCategory } }) => (
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded-full border"
            style={{ backgroundColor: row.original.color || '#00CB7E' }}
          />
          <span>{row.original.color || '#00CB7E'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'icon',
      header: 'Ícone',
    },
    {
      accessorKey: 'actions',
      header: 'Ações',
      cell: ({ row }: { row: { original: WorkoutCategory } }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorias de Exercícios</h1>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={categories}
        isLoading={isLoadingCategories}
      />

      <WorkoutCategoryForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        category={editingCategory}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WorkoutCategoryManagement;