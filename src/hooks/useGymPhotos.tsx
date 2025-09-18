// Simplified gym photos for physiotherapy app
export function useGymPhotos() {
  return {
    photos: [],
    isLoading: false,
    refetch: () => Promise.resolve(),
    deletePhoto: (_id: string) => Promise.resolve(),
    uploadPhoto: (_file: File) => Promise.resolve()
  };
}