import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAdminWorkouts } from '@/hooks/useAdminWorkouts';
import { Loader2, Search, UserPlus, UserX, Users } from 'lucide-react';

export function RecommendWorkoutDialog({
  workoutId,
  onClose,
}: {
  workoutId: string;
  onClose: () => void;
}) {
  const { 
    workouts, 
    getWorkoutRecommendations,
    addWorkoutRecommendation,
    removeWorkoutRecommendation,
    isAddingRecommendation,
    isRemovingRecommendation,
    updateWorkout,
    users
  } = useAdminWorkouts();
  
  // Find the current workout
  const workout = workouts.find(w => w.id === workoutId);
  
  // Get workout recommendations
  const { 
    data: recommendations, 
    isLoading: recommendationsLoading 
  } = getWorkoutRecommendations(workoutId);
  
  const [isRecommended, setIsRecommended] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync the initial state with the workout data
  useEffect(() => {
    if (workout) {
      setIsRecommended(false); // Simplified since we don't have is_recommended
    }
  }, [workout]);

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    const nome = user.nome || '';
    return nome.toLowerCase().includes(searchQuery.toLowerCase()) || 
           (user.id && user.id.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  // Check if a user already has this workout recommended
  const isUserRecommended = (userId: string) => {
    return recommendations?.some(rec => rec.user_id === userId);
  };

  // Handle toggling the global recommendation state
  const handleToggleRecommended = async () => {
    if (!workout) return;
    
    setIsProcessing(true);
    // Simplified - just update local state since we don't have is_recommended field
    setIsRecommended(!isRecommended);
    setIsProcessing(false);
  };

  // Handle recommending to a specific user
  const handleRecommendToUser = (userId: string) => {
    if (isUserRecommended(userId)) {
      const recommendation = recommendations?.find(rec => rec.user_id === userId);
      if (recommendation) {
        removeWorkoutRecommendation({
          recommendationId: recommendation.id,
          workoutId
        });
      }
    } else {
      addWorkoutRecommendation({
        workout_id: workoutId,
        user_id: userId
      });
    }
  };

  // Handle recommending to all users
  const handleRecommendToAll = () => {
    addWorkoutRecommendation({
      workout_id: workoutId,
      user_id: null // null means recommended for all users
    });
  };

  // Check if the workout is recommended to all users
  const isRecommendedToAll = recommendations?.some(rec => rec.user_id === null);

  // Remove recommendation for all users
  const handleRemoveForAll = () => {
    const allUsersRecommendation = recommendations?.find(rec => rec.user_id === null);
    if (allUsersRecommendation) {
      removeWorkoutRecommendation({
        recommendationId: allUsersRecommendation.id,
        workoutId
      });
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Workout Recommendations</DialogTitle>
          <DialogDescription>
            Mark this workout as recommended for all users or assign it to specific users.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center space-x-4 py-4 border-y">
          <div className="flex-1">
            <h3 className="font-medium">Mark as Featured Workout</h3>
            <p className="text-sm text-muted-foreground">
              This workout will be marked as recommended for all users in the app
            </p>
          </div>
          <Switch 
            checked={isRecommended}
            onCheckedChange={handleToggleRecommended}
            disabled={isProcessing}
          />
        </div>

        <div className="py-4 space-y-4 flex-1 overflow-hidden flex flex-col">
          <h3 className="font-medium">Recommend to Specific Users</h3>
          
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={isRecommendedToAll ? handleRemoveForAll : handleRecommendToAll}
              disabled={isAddingRecommendation || isRemovingRecommendation}
              className={isRecommendedToAll ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
            >
              <Users className="h-4 w-4 mr-2" />
              {isRecommendedToAll ? "Recommended to All" : "Recommend to All Users"}
            </Button>
          </div>

          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search users..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <ScrollArea className="flex-1 border rounded-md">
            {recommendationsLoading ? (
              <div className="p-4 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading recommendations...</span>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="p-0">
                {filteredUsers.map((user) => {
                  const displayName = user.nome || user.id;
                  const isRecommended = isUserRecommended(user.id);
                  
                  return (
                    <div 
                      key={user.id} 
                      className="flex items-center justify-between p-3 hover:bg-muted/50 border-b last:border-b-0"
                    >
                      <div>
                        <p className="text-sm font-medium">{displayName}</p>
                      </div>
                      <Button
                        variant={isRecommended ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleRecommendToUser(user.id)}
                        disabled={isAddingRecommendation || isRemovingRecommendation}
                      >
                        {isRecommended ? (
                          <>
                            <UserX className="h-4 w-4 mr-2" />
                            Remove
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Recommend
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">No users found</p>
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}