
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Dedicated storage client with special access keys
const SUPABASE_URL = "https://jplkrysolselfculqvqr.supabase.co";
const STORAGE_KEY = "63b690e66b1f25db23655d20aa27ea83fc85a4c670dc0e8f59e3e462c14ac236";
const STORAGE_ID = "8a9b669bc0c6b3b746cfe318291b112a";

// This client is specifically for storage operations with elevated permissions
export const storageClient = createClient<Database>(
  SUPABASE_URL, 
  STORAGE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Helper function to check if the storage is configured properly
export const verifyStorageAccess = async (): Promise<boolean> => {
  try {
    // First check if the bucket exists
    const { data, error } = await storageClient.storage.getBucket('exercises');
    
    if (error) {
      console.error("Storage verification failed:", error.message);
      
      // If the bucket doesn't exist, try to create it
      if (error.message.includes('not found')) {
        try {
          const { data: newBucket, error: createError } = await storageClient.storage.createBucket('exercises', {
            public: true,
            fileSizeLimit: 5242880 // 5MB limit
          });
          
          if (!createError) {
            console.log("Successfully created exercises bucket");
            return true;
          }
          
          console.error("Failed to create bucket:", createError?.message);
          return false;
        } catch (createErr: any) {
          console.error("Error creating bucket:", createErr);
          return false;
        }
      }
      
      return false;
    }
    
    console.log("Storage bucket verified successfully");
    return true;
  } catch (error) {
    console.error("Error verifying storage access:", error);
    return false;
  }
};
