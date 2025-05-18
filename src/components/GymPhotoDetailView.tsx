
import React, { useState } from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GymPhoto, PhotoAnalysis, useGymPhotos } from '@/hooks/useGymPhotos';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Loader2, Info, DumbbellIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';

interface GymPhotoDetailViewProps {
  photo: GymPhoto;
}

const GymPhotoDetailView = ({ photo }: GymPhotoDetailViewProps) => {
  const { getPhotoAnalysis, generateWorkoutPlan } = useGymPhotos();
  const { data: analysis, isLoading: isLoadingAnalysis } = getPhotoAnalysis(photo.id);
  const { user } = useAuth();
  const [generating, setGenerating] = useState(false);
  
  // Form state for workout generation
  const [fitnessGoal, setFitnessGoal] = useState('hipertrofia');
  const [fitnessLevel, setFitnessLevel] = useState('intermediario');
  const [availableTime, setAvailableTime] = useState(60);
  
  const handleGenerateWorkout = async () => {
    if (!analysis) {
      toast.error('É necessário analisar a foto antes de gerar um treino');
      return;
    }
    
    if (!user) {
      toast.error('Você precisa estar logado para gerar um treino');
      return;
    }
    
    setGenerating(true);
    
    try {
      await generateWorkoutPlan({
        analysisId: analysis.id,
        userId: user.id,
        fitnessGoal,
        fitnessLevel,
        availableTime
      });
      
      toast.success('Plano de treino gerado com sucesso!');
    } catch (error) {
      console.error('Error generating workout plan:', error);
      toast.error('Erro ao gerar plano de treino');
    } finally {
      setGenerating(false);
    }
  };
  
  return (
    <>
      <DialogHeader>
        <DialogTitle>Detalhes da Foto</DialogTitle>
      </DialogHeader>
      
      <Tabs defaultValue="photo" className="mt-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="photo">Foto</TabsTrigger>
          <TabsTrigger value="analysis" disabled={!photo.processed_by_ai}>
            Análise e Treino
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="photo" className="mt-4">
          <div className="space-y-4">
            <div className="rounded-md overflow-hidden">
              <img src={photo.photo_url} alt="Academia" className="w-full h-auto" />
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Informações:</h3>
              <p className="text-sm">Enviada em: {new Date(photo.created_at).toLocaleDateString()}</p>
              {photo.description && (
                <p className="text-sm mt-1">Descrição: {photo.description}</p>
              )}
              <div className="flex mt-2 space-x-2">
                <Badge variant={
                  photo.approved === true ? "success" : 
                  photo.approved === false ? "destructive" : 
                  "outline"
                }>
                  {photo.approved === true ? "Aprovada" : 
                   photo.approved === false ? "Rejeitada" : 
                   "Pendente"}
                </Badge>
                <Badge variant={photo.processed_by_ai ? "secondary" : "outline"}>
                  {photo.processed_by_ai ? "Analisada por IA" : "Não analisada"}
                </Badge>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="analysis" className="mt-4 space-y-6">
          {isLoadingAnalysis ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span>Carregando análise...</span>
            </div>
          ) : analysis ? (
            <>
              <div className="bg-muted/50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Equipamentos Detectados:</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {analysis.equipment_detected?.equipment?.map((item, index) => (
                    <div key={index} className="flex items-center bg-background p-2 rounded-md">
                      <DumbbellIcon className="h-4 w-4 mr-2 text-primary" />
                      <span className="text-sm">{item.name}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm mt-4">
                  <strong>Tipo de academia:</strong> {analysis.equipment_detected?.gym_type || 'Não detectado'}
                </p>
                <p className="text-sm mt-1">
                  <strong>Data da análise:</strong> {new Date(analysis.analysis_date).toLocaleString()}
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-4">Gerar Plano de Treino Personalizado</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="goal">Objetivo do treino</Label>
                    <Select value={fitnessGoal} onValueChange={setFitnessGoal}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o objetivo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
                        <SelectItem value="emagrecimento">Emagrecimento</SelectItem>
                        <SelectItem value="condicionamento">Condicionamento</SelectItem>
                        <SelectItem value="definicao">Definição</SelectItem>
                        <SelectItem value="forca">Força</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="level">Nível de condicionamento</Label>
                    <Select value={fitnessLevel} onValueChange={setFitnessLevel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o nível" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="iniciante">Iniciante</SelectItem>
                        <SelectItem value="intermediario">Intermediário</SelectItem>
                        <SelectItem value="avancado">Avançado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Tempo disponível: {availableTime} minutos</Label>
                    <Slider 
                      value={[availableTime]} 
                      onValueChange={(values) => setAvailableTime(values[0])} 
                      min={30} 
                      max={120} 
                      step={5}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>30 min</span>
                      <span>120 min</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full"
                    onClick={handleGenerateWorkout}
                    disabled={generating}
                  >
                    {generating ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando treino...</>
                    ) : (
                      <>Gerar Plano de Treino</>
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-10">
              <Info className="h-10 w-10 mx-auto text-gray-400 mb-2" />
              <p>Análise não disponível para esta foto.</p>
              <p className="text-sm text-gray-500 mt-1">
                Entre em contato com o administrador para solicitar uma análise.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
};

export default GymPhotoDetailView;
