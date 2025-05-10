
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Dedicated storage client with special access keys
const SUPABASE_URL = "https://jplkrysolselfculqvqr.supabase.co";
const STORAGE_KEY = "63b690e66b1f25db23655d20aa27ea83fc85a4c670dc0e8f59e3e462c14ac236";
const STORAGE_ID = "8a9b669bc0c6b3b746cfe318291b112a";

// This client is specifically for storage operations with elevated permissions
export const storageClient = createClient<Database>(SUPABASE_URL, STORAGE_KEY, {
  auth: {
    persistSession: false
  }
});

// Helper function to check if the storage is configured properly
export const verifyStorageAccess = async (): Promise<boolean> => {
  try {
    const { data, error } = await storageClient.storage.getBucket('exercises');
    
    if (error) {
      console.error("Storage verification failed:", error.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error verifying storage access:", error);
    return false;
  }
};
