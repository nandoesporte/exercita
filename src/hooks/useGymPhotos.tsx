
import { useUserGymPhotos } from './gym-photos/useUserGymPhotos';
import { usePhotoAnalysis } from './gym-photos/usePhotoAnalysis';
import { useAdminGymPhotos } from './gym-photos/useAdminGymPhotos';
import { GymPhoto, PhotoAnalysis } from './gym-photos/useGymPhotosBase';

// Re-export types
export { GymPhoto, PhotoAnalysis };

// Composite hook that combines all functionality for backward compatibility
export function useGymPhotos() {
  const userGymPhotos = useUserGymPhotos();
  const photoAnalysis = usePhotoAnalysis();
  const adminGymPhotos = useAdminGymPhotos();

  return {
    // User photo functions
    ...userGymPhotos,
    // AI analysis functions
    ...photoAnalysis,
    // Admin functions
    ...adminGymPhotos
  };
}
