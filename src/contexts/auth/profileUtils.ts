
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

// Updated function to handle profiles without requiring instance_id
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
      .select('id')
      .eq('id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking profile existence:', checkError);
      return;
    }

    // If profile doesn't exist, create it
    if (!existingProfile) {
      console.log("Profile doesn't exist, creating now for user:", userId);
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          first_name: metadata?.first_name || '',
          last_name: metadata?.last_name || '',
          avatar_url: metadata?.avatar_url || ''
        });

      if (insertError) {
        console.error('Error creating profile:', insertError);
      } else {
        console.log("Profile created successfully");
      }
    } else {
      console.log("Profile already exists for user:", userId);
    }
  } catch (error) {
    console.error('Exception in ensureProfileExists:', error);
  }
};

// New function to update profile with better error handling
export const updateUserProfile = async (userId: string, profileData: any): Promise<boolean> => {
  try {
    if (!userId) {
      console.error("Cannot update profile without user ID");
      return false;
    }
    
    console.log("Updating profile for user:", userId, "with data:", profileData);
    
    const { error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating profile:', error);
      return false;
    }
    
    console.log("Profile updated successfully");
    return true;
  } catch (error) {
    console.error('Exception in updateUserProfile:', error);
    return false;
  }
};
