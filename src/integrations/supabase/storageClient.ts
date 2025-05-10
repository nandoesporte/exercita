
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Dedicated storage client with special access keys
const SUPABASE_URL = "https://jplkrysolselfculqvqr.supabase.co";
const STORAGE_KEY = "63b690e66b1f25db23655d20aa27ea83fc85a4c670dc0e8f59e3e462c14ac236";
const STORAGE_ID = "8a9b669bc0c6b3b746cfe318291b112a";

// This client is specifically for storage operations with elevated permissions
// Using anonymous key rather than JWT for direct storage access
export const storageClient = createClient<Database>(
  SUPABASE_URL, 
  STORAGE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
);

// Helper function to check if the storage is configured properly
export const verifyStorageAccess = async (): Promise<boolean> => {
  try {
    console.log("Verifying storage access with ID:", STORAGE_ID);
    
    // First check if the bucket exists
    const { data, error } = await storageClient.storage.getBucket('exercises');
    
    if (error) {
      console.error("Storage verification failed:", error.message);
      
      // If the bucket doesn't exist, try to create it
      if (error.message.includes('not found')) {
        try {
          console.log("Attempting to create exercises bucket");
          const { data: newBucket, error: createError } = await storageClient.storage.createBucket('exercises', {
            public: true,
            fileSizeLimit: 5242880 // 5MB limit
          });
          
          if (createError) {
            console.error("Failed to create bucket:", createError.message);
            return false;
          }
          
          console.log("Successfully created exercises bucket");
          return true;
        } catch (createErr: any) {
          console.error("Error creating bucket:", createErr);
          return false;
        }
      }
      
      return false;
    }
    
    console.log("Storage bucket verified successfully:", data);
    return true;
  } catch (error: any) {
    console.error("Error verifying storage access:", error);
    return false;
  }
};

// Helper function to upload a file to the exercises bucket
export const uploadExerciseFile = async (file: File): Promise<string> => {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = fileName;
    
    console.log(`Attempting to upload file ${fileName} to exercises bucket`);
    
    // Upload file with retry logic
    let attempts = 0;
    const maxAttempts = 3;
    let lastError = null;
    
    while (attempts < maxAttempts) {
      try {
        console.log(`Upload attempt ${attempts + 1}`);
        
        const { data, error } = await storageClient.storage
          .from('exercises')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: attempts > 0 // Try upsert on retry attempts
          });
        
        if (error) {
          lastError = error;
          console.error(`Upload attempt ${attempts + 1} failed:`, error);
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts))); // Exponential backoff
          continue;
        }
        
        // Get public URL
        const { data: { publicUrl } } = storageClient.storage
          .from('exercises')
          .getPublicUrl(filePath);
        
        console.log("Upload successful, public URL:", publicUrl);
        return publicUrl;
      } catch (uploadError: any) {
        lastError = uploadError;
        console.error(`Upload attempt ${attempts + 1} exception:`, uploadError);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts))); // Exponential backoff
      }
    }
    
    throw lastError || new Error("Upload failed after multiple attempts");
  } catch (error: any) {
    console.error("File upload error:", error);
    throw error;
  }
};
