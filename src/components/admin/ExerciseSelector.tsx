
import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminExercises } from '@/hooks/useAdminExercises';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExerciseSelectorProps {
  onSelectExercise: (exerciseId: string, exerciseName: string) => void;
  onClose?: () => void;
}

export function ExerciseSelector({ onSelectExercise, onClose }: ExerciseSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [previewExercise, setPreviewExercise] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const isMobile = useIsMobile();
  
  const { exercises, categories, isLoading } = useAdminExercises();
  
  // Filter exercises based on search term and selected category
  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === null || exercise.category?.id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === 'all' ? null : value);
  };

  const handleExercisePreview = (exercise: any) => {
    setPreviewExercise(exercise);
    setShowPreview(true);
  };

  const handleExerciseSelect = (exercise: any) => {
    onSelectExercise(exercise.id, exercise.name);
    if (isMobile && onClose) {
      onClose();
    }
    setShowPreview(false);
  };

  // Render the exercise preview dialog/drawer
  const renderExercisePreview = () => {
    if (!previewExercise) return null;

    const previewContent = (
      <>
        <div className="flex flex-col space-y-4">
          <div className="aspect-square relative bg-muted rounded-md overflow-hidden">
            {previewExercise.image_url ? (
              <img 
                src={previewExercise.image_url} 
                alt={previewExercise.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Sem imagem
              </div>
            )}
          </div>
          
          {previewExercise.video_url && (
            <div className="aspect-video rounded-md overflow-hidden bg-black">
              <video 
                controls 
                autoPlay 
                muted 
                loop 
                className="w-full h-full"
                src={previewExercise.video_url}
              >
                Seu navegador não suporta o elemento de vídeo.
              </video>
            </div>
          )}
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{previewExercise.name}</h3>
            <p className="text-sm text-muted-foreground">{previewExercise.category?.name || 'Sem categoria'}</p>
            {previewExercise.description && (
              <p className="text-sm">{previewExercise.description}</p>
            )}
          </div>
        </div>

        <Button 
          className="mt-4 w-full"
          onClick={() => handleExerciseSelect(previewExercise)}
        >
          Selecionar este exercício
        </Button>
      </>
    );

    if (isMobile) {
      return (
        <Drawer open={showPreview} onOpenChange={setShowPreview}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Pré-visualização do Exercício</DrawerTitle>
            </DrawerHeader>
            <div className="p-4">
              {previewContent}
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Fechar</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      );
    }

    return (
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pré-visualização do Exercício</DialogTitle>
            <DialogDescription>
              Visualize o exercício antes de selecionar
            </DialogDescription>
          </DialogHeader>
          {previewContent}
        </DialogContent>
      </Dialog>
    );
  };

  // Render the exercise selector content
  const renderContent = () => (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar exercícios..."
          className="pl-9"
        />
      </div>
      
      {/* Category Selection - Tabs for desktop, Dropdown for mobile */}
      {isMobile ? (
        <Select defaultValue="all" onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecionar categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Tabs defaultValue="all" onValueChange={handleCategoryChange}>
          <TabsList className="w-full flex overflow-x-auto">
            <TabsTrigger value="all">Todos</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}
      
      {/* Exercise List */}
      <ScrollArea className={isMobile ? "h-[300px]" : "h-[400px]"}>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredExercises.length > 0 ? (
          <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-3`}>
            {filteredExercises.map((exercise) => (
              <div key={exercise.id} className="border rounded-md overflow-hidden bg-card hover:border-primary transition-colors">
                <div 
                  className="cursor-pointer"
                  onClick={() => handleExercisePreview(exercise)}
                >
                  <div className="aspect-square relative bg-muted">
                    {exercise.image_url ? (
                      <img 
                        src={exercise.image_url} 
                        alt={exercise.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        Sem imagem
                      </div>
                    )}
                    {exercise.video_url && (
                      <div className="absolute bottom-2 right-2 bg-background/80 p-1 rounded-full">
                        <Filter className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-sm">{exercise.name}</h4>
                    <p className="text-xs text-muted-foreground">{exercise.category?.name || 'Sem categoria'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum exercício encontrado.
          </div>
        )}
      </ScrollArea>
      
      {isMobile && (
        <Button variant="outline" className="w-full" onClick={onClose}>
          Fechar
        </Button>
      )}

      {renderExercisePreview()}
    </div>
  );

  return renderContent();
}
