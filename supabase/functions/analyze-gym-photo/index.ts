
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

interface EquipmentDetection {
  equipment: Array<{
    name: string;
    type: string;
    confidence: number;
  }>;
  gym_type: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { photoId } = await req.json();
    
    // Create Supabase client using service role key (admin access)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the photo URL from the database
    const { data: photoData, error: photoError } = await supabase
      .from('user_gym_photos')
      .select('photo_url')
      .eq('id', photoId)
      .single();
      
    if (photoError || !photoData) {
      throw new Error('Photo not found');
    }
    
    console.log('Analyzing photo:', photoData.photo_url);
    
    // Mock AI analysis for now - in a real implementation, you would call an AI service
    // such as Gro3, OpenAI Vision API, or another computer vision service
    // This is a placeholder that simulates AI equipment detection
    const mockEquipmentDetection: EquipmentDetection = {
      equipment: [
        { name: 'Bench Press', type: 'strength', confidence: 0.95 },
        { name: 'Dumbbells', type: 'free_weights', confidence: 0.98 },
        { name: 'Squat Rack', type: 'strength', confidence: 0.92 },
        { name: 'Treadmill', type: 'cardio', confidence: 0.89 },
        { name: 'Pull-up Bar', type: 'bodyweight', confidence: 0.94 },
        { name: 'Cable Machine', type: 'strength', confidence: 0.87 },
        { name: 'Exercise Ball', type: 'functional', confidence: 0.82 }
      ],
      gym_type: 'full_service'
    };

    // Store the analysis results in the database
    const { data: analysisData, error: analysisError } = await supabase
      .from('gym_photo_analysis')
      .insert({
        photo_id: photoId,
        equipment_detected: mockEquipmentDetection
      })
      .select()
      .single();
      
    if (analysisError) {
      console.error('Error storing analysis:', analysisError);
      throw new Error('Failed to store analysis results');
    }
    
    // Update the photo record to mark it as processed by AI
    await supabase
      .from('user_gym_photos')
      .update({ processed_by_ai: true })
      .eq('id', photoId);
    
    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysisData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error('Error in analyze-gym-photo:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
