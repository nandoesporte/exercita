
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface CloneWorkoutDialogProps {
  workoutId: string;
  workoutTitle?: string;
  onClose: () => void;
}

export const CloneWorkoutDialog = ({ workoutId, workoutTitle, onClose }: CloneWorkoutDialogProps) => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isCloning, setIsCloning] = useState(false);
  
  // Fetch users for selection
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['admin-users-for-clone'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .order('first_name');
      
      if (error) {
        toast.error(`Error fetching users: ${error.message}`);
        throw new Error(`Error fetching users: ${error.message}`);
      }
      
      return data || [];
    },
  });

  const handleCloneWorkout = async () => {
    if (!selectedUserId || !workoutId) {
      toast.error('Please select a user');
      return;
    }
    
    setIsCloning(true);
    
    try {
      const { data, error } = await supabase.rpc(
        'clone_workout_for_user',
        {
          source_workout_id: workoutId,
          target_user_id: selectedUserId
        }
      );
      
      if (error) {
        throw error;
      }
      
      toast.success(`Workout cloned successfully for user!`);
      onClose();
    } catch (error: any) {
      console.error('Error cloning workout:', error);
      toast.error(`Failed to clone workout: ${error.message}`);
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Clone Workout for User</DialogTitle>
          <DialogDescription>
            {workoutTitle 
              ? `Clone "${workoutTitle}" workout to another user`
              : "Select a user to clone this workout to their account"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-2">
            <label htmlFor="user-select" className="text-sm font-medium block mb-1">
              Select User
            </label>
            <Select
              disabled={isLoadingUsers || isCloning}
              value={selectedUserId}
              onValueChange={setSelectedUserId}
            >
              <SelectTrigger id="user-select" className="w-full">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingUsers ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Loading users...</span>
                  </div>
                ) : (
                  users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <div className="bg-primary text-white rounded-full h-full w-full flex items-center justify-center text-xs">
                            {user.first_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                          </div>
                        </Avatar>
                        <span>
                          {user.first_name && user.last_name 
                            ? `${user.first_name} ${user.last_name}`
                            : user.email}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedUserId && (
            <div className="mt-4 p-3 bg-muted rounded-md">
              <p className="text-sm mb-2">
                <strong>Important:</strong> Cloning will:
              </p>
              <ul className="text-xs space-y-1">
                <li className="flex items-center">
                  <Check className="h-3 w-3 mr-1 text-green-500" />
                  Create a new workout in the user's account
                </li>
                <li className="flex items-center">
                  <Check className="h-3 w-3 mr-1 text-green-500" />
                  Copy all exercises and schedule days
                </li>
                <li className="flex items-center">
                  <Check className="h-3 w-3 mr-1 text-green-500" />
                  Add it as a recommended workout for the user
                </li>
              </ul>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isCloning}>
            Cancel
          </Button>
          <Button 
            onClick={handleCloneWorkout}
            disabled={!selectedUserId || isCloning}
          >
            {isCloning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cloning...
              </>
            ) : (
              'Clone Workout'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
