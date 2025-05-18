
import { supabase } from '@/integrations/supabase/client';

// Check admin status safely with timeout to avoid deadlocks
export const checkAdminStatus = async (userId: string): Promise<boolean> => {
  try {
    console.log(`Checking admin status for user: ${userId}`);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    console.log("Admin status check result:", data);
    const adminStatus = data?.is_admin || false;
    
    if (adminStatus) {
      console.log("User has admin privileges!");
    } else {
      console.log("User does not have admin privileges");
    }
    
    return adminStatus;
  } catch (error) {
    console.error('Exception checking admin status:', error);
    return false;
  }
};

// Check if profile exists and create if needed
export const ensureProfileExists = async (userId: string, metadata?: any): Promise<void> => {
  try {
    if (!userId) {
      console.error("Cannot ensure profile without user ID");
      return;
    }
    
    console.log("Ensuring profile exists for user:", userId, "with metadata:", metadata);
    
    // First check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id, instance_id')
      .eq('id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking profile existence:', checkError);
      return;
    }

    // If profile doesn't exist, create it
    if (!existingProfile) {
      console.log("Profile doesn't exist, creating now for user:", userId);
      
      // Make sure we have an instance_id
      const instance_id = metadata?.instance_id || crypto.randomUUID();
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          first_name: metadata?.first_name || '',
          last_name: metadata?.last_name || '',
          avatar_url: metadata?.avatar_url || '',
          instance_id: instance_id
        });

      if (insertError) {
        console.error('Error creating profile:', insertError);
      } else {
        console.log("Profile created successfully with instance_id:", instance_id);
      }
    } else {
      console.log("Profile already exists for user:", userId);
      
      // Check if instance_id exists, if not update it
      if (!existingProfile.instance_id && metadata?.instance_id) {
        console.log("Adding missing instance_id to profile");
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ instance_id: metadata.instance_id })
          .eq('id', userId);
          
        if (updateError) {
          console.error('Error updating profile with instance_id:', updateError);
        } else {
          console.log("Profile updated with instance_id:", metadata.instance_id);
        }
      }
    }
  } catch (error) {
    console.error('Exception in ensureProfileExists:', error);
  }
};
