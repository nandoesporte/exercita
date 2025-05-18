
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { 
      analysisId, 
      userId, 
      fitnessGoal, 
      fitnessLevel, 
      availableTime 
    } = await req.json();
    
    // Create Supabase client using service role key (admin access)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the analysis data
    const { data: analysisData, error: analysisError } = await supabase
      .from('gym_photo_analysis')
      .select('*')
      .eq('id', analysisId)
      .single();
      
    if (analysisError || !analysisData) {
      throw new Error('Analysis not found');
    }
    
    console.log('Generating workout plan based on analysis:', analysisId);
    console.log('User profile:', { fitnessGoal, fitnessLevel, availableTime });
    
    // Get available exercises from the database
    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .select('*');
      
    if (exercisesError) {
      throw new Error('Failed to fetch exercises');
    }

    // Store the equipment data for future workout generation
    await supabase
      .from('equipment_based_workouts')
      .insert({
        user_id: userId,
        photo_analysis_id: analysisId,
        fitness_goal: fitnessGoal,
        fitness_level: fitnessLevel,
        available_time: availableTime,
        equipment_list: analysisData.equipment_detected
      });
    
    // Create a new workout
    const workoutTitle = `Treino personalizado - ${fitnessLevel} - ${fitnessGoal}`;
    
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        title: workoutTitle,
        description: `Treino personalizado baseado na análise da sua academia, focado em ${fitnessGoal}.`,
        duration: availableTime,
        level: fitnessLevel === 'iniciante' ? 'beginner' : 
               fitnessLevel === 'intermediario' ? 'intermediate' : 'advanced',
        calories: availableTime * 10, // Simple estimation
        is_recommended: true
      })
      .select()
      .single();
      
    if (workoutError) {
      throw new Error('Failed to create workout');
    }
    
    // Create workout recommendation for the user
    await supabase
      .from('workout_recommendations')
      .insert({
        workout_id: workout.id,
        user_id: userId
      });
    
    // Assign appropriate exercises based on available equipment
    // This is a simplified approach - in a real implementation, you would use more sophisticated 
    // exercise selection and sequencing logic based on the user's goals and equipment
    const availableEquipment = analysisData.equipment_detected.equipment.map((e: any) => e.name.toLowerCase());
    
    // Filter exercises based on available equipment (simple matching)
    const relevantExercises = exercises.filter((exercise: any) => {
      // Simple exercise-to-equipment matching logic
      // In production, you would have a more sophisticated mapping
      const description = (exercise.description || '').toLowerCase();
      return availableEquipment.some((equipment: string) => 
        description.includes(equipment)
      );
    });
    
    // Create workout day entry for each day of the week (simplified approach)
    const daysOfWeek = ['monday', 'wednesday', 'friday'];
    
    for (const day of daysOfWeek) {
      await supabase
        .from('workout_days')
        .insert({
          workout_id: workout.id,
          day_of_week: day
        });
    }
    
    // Add exercises to the workout with section titles
    let orderPosition = 1;
    const sections = [
      { title: "Aquecimento", exercises: 2 },
      { title: "Parte Principal", exercises: 5 },
      { title: "Finalização", exercises: 2 }
    ];
    
    // For each workout day, add sections and exercises
    for (const day of daysOfWeek) {
      for (const section of sections) {
        // Add section title
        await supabase
          .from('workout_exercises')
          .insert({
            workout_id: workout.id,
            order_position: orderPosition++,
            day_of_week: day,
            is_title_section: true,
            section_title: section.title
          });
        
        // Add exercises for the section
        const sectionExercises = relevantExercises
          .sort(() => Math.random() - 0.5) // Shuffle
          .slice(0, section.exercises);
        
        for (const exercise of sectionExercises) {
          await supabase
            .from('workout_exercises')
            .insert({
              workout_id: workout.id,
              exercise_id: exercise.id,
              order_position: orderPosition++,
              day_of_week: day,
              sets: 3,
              reps: section.title === "Aquecimento" ? 12 : 10,
              rest: 60
            });
        }
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        workout_id: workout.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error('Error in generate-workout-plan:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
