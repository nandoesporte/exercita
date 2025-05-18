
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Trash2, PenSquare, Dumbbell, Star, UserCheck, Users
} from 'lucide-react';
import { useAdminWorkouts } from '@/hooks/useAdminWorkouts';
import { Input } from "@/components/ui/input";
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
import { RecommendWorkoutDialog } from '@/components/admin/RecommendWorkoutDialog';
import { CloneWorkoutDialog } from '@/components/admin/CloneWorkoutDialog';

const WorkoutManagement = () => {
  const navigate = useNavigate();
  const { workouts, isLoading, deleteWorkout } = useAdminWorkouts();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [recommendWorkoutId, setRecommendWorkoutId] = useState<string | null>(null);
  const [cloneWorkoutId, setCloneWorkoutId] = useState<string | null>(null);
  
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

  const handleOpenRecommendDialog = (id: string) => {
    setRecommendWorkoutId(id);
  };

  const handleOpenCloneDialog = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setCloneWorkoutId(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gerenciamento de Treinos</h1>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Criar Novo
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          placeholder="Buscar treinos..." 
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Carregando treinos...</p>
          </div>
        ) : filteredWorkouts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Título</th>
                  <th className="text-left py-3 px-4 font-medium">Nível</th>
                  <th className="text-left py-3 px-4 font-medium">Duração</th>
                  <th className="text-left py-3 px-4 font-medium">Categoria</th>
                  <th className="text-center py-3 px-4 font-medium">Recomendado</th>
                  <th className="text-right py-3 px-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkouts.map((workout) => (
                  <tr key={workout.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">{workout.title}</td>
                    <td className="py-3 px-4 capitalize">{workout.level}</td>
                    <td className="py-3 px-4">{workout.duration} min</td>
                    <td className="py-3 px-4">{workout.category?.name || 'Sem categoria'}</td>
                    <td className="py-3 px-4 text-center">
                      {workout.is_recommended && <Star className="h-4 w-4 text-amber-400 inline" />}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleOpenCloneDialog(workout.id, e)}
                          title="Clonar para usuário"
                        >
                          <Users className="h-4 w-4" />
                          <span className="sr-only">Clonar para Usuário</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenRecommendDialog(workout.id)}
                          className={workout.is_recommended ? "border-amber-400 text-amber-500" : ""}
                        >
                          <UserCheck className="h-4 w-4" />
                          <span className="sr-only">Gerenciar Recomendações</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditExercises(workout.id)}
                        >
                          <Dumbbell className="h-4 w-4" />
                          <span className="sr-only">Editar Exercícios</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(workout.id)}
                        >
                          <PenSquare className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(workout.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Excluir</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Nenhum treino encontrado</p>
            <Button variant="link" onClick={handleCreateNew}>Crie seu primeiro treino</Button>
          </div>
        )}
      </div>
      
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o
              treino selecionado e todos os dados associados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {recommendWorkoutId && (
        <RecommendWorkoutDialog
          workoutId={recommendWorkoutId}
          onClose={() => setRecommendWorkoutId(null)}
        />
      )}

      {cloneWorkoutId && (
        <CloneWorkoutDialog
          workoutId={cloneWorkoutId}
          workoutTitle={filteredWorkouts.find(w => w.id === cloneWorkoutId)?.title}
          onClose={() => setCloneWorkoutId(null)}
        />
      )}
    </div>
  );
};

export default WorkoutManagement;
