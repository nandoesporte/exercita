
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useGymPhotosBase, PhotoAnalysis } from './useGymPhotosBase';

export function usePhotoAnalysis() {
  const { queryClient, analyzing, setAnalyzing, supabase } = useGymPhotosBase();
  
  // Admin function to analyze photo with AI
  const { mutate: analyzePhotoWithAI } = useMutation({
    mutationFn: async (photoId: string) => {
      setAnalyzing(true);
      
      try {
        // Call the edge function for AI analysis
        const { data, error } = await supabase.functions.invoke('analyze-gym-photo', {
          body: { photoId }
        });
        
        if (error) throw new Error(error.message);
        
        // Mark photo as processed by AI
        await supabase
          .from('user_gym_photos')
          .update({ processed_by_ai: true })
          .eq('id', photoId);
          
        return data;
      } finally {
        setAnalyzing(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminGymPhotos'] });
      queryClient.invalidateQueries({ queryKey: ['gymPhotoAnalysis'] });
      toast.success('Foto analisada com sucesso');
    },
    onError: (error) => {
      console.error('Error analyzing photo:', error);
      toast.error('Erro ao analisar foto');
    }
  });

  // Get photo analysis for a specific photo
  const getPhotoAnalysis = (photoId: string) => {
    return useQuery({
      queryKey: ['gymPhotoAnalysis', photoId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('gym_photo_analysis')
          .select('*')
          .eq('photo_id', photoId)
          .single();
          
        if (error) {
          console.error('Error fetching photo analysis:', error);
          return null;
        }
        
        return data as PhotoAnalysis;
      },
      enabled: !!photoId
    });
  };

  // Generate workout plan based on photo analysis and user profile
  const { mutate: generateWorkoutPlan } = useMutation({
    mutationFn: async ({ 
      analysisId, 
      userId, 
      fitnessGoal, 
      fitnessLevel, 
      availableTime 
    }: { 
      analysisId: string;
      userId: string;
      fitnessGoal: string;
      fitnessLevel: string;
      availableTime: number;
    }) => {
      const result = await supabase.functions.invoke('generate-workout-plan', {
        body: { 
          analysisId,
          userId,
          fitnessGoal,
          fitnessLevel,
          availableTime
        }
      });
      
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      toast.success('Plano de treino gerado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
    onError: (error) => {
      console.error('Error generating workout plan:', error);
      toast.error('Erro ao gerar plano de treino');
    }
  });

  return {
    analyzing,
    analyzePhotoWithAI,
    getPhotoAnalysis,
    generateWorkoutPlan
  };
}
