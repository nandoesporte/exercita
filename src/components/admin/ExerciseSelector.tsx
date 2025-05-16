
import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminExercises } from '@/hooks/useAdminExercises';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
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
                  onClick={() => {
                    onSelectExercise(exercise.id, exercise.name);
                    if (isMobile && onClose) {
                      onClose();
                    }
                  }}
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
    </div>
  );

  return renderContent();
}
