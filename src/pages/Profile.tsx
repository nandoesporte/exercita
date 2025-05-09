
import React from 'react';
import Header from '@/components/layout/Header';
import { 
  User, Settings, Calendar, Clock, Heart, LogOut,
  CreditCard, HelpCircle, Bell, UserPlus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

const Profile = () => {
  const { profile, isLoading } = useProfile();
  const { signOut, user } = useAuth();
  
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return format(date, 'MMMM yyyy');
  };

  const userData = {
    name: profile?.first_name && profile?.last_name 
      ? `${profile.first_name} ${profile.last_name}` 
      : user?.email || 'User',
    email: user?.email || '',
    avatar: profile?.avatar_url || 'https://randomuser.me/api/portraits/men/32.jpg',
    memberSince: user?.created_at 
      ? formatDate(new Date(user.created_at)) 
      : 'Unknown',
    workoutsCompleted: 0, // This could be implemented with a count query
    favoriteWorkout: 'Unknown', // This could be implemented with a query
  };
  
  if (isLoading) {
    return (
      <>
        <Header title="Profile" />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fitness-green"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Profile" />
      
      <main className="container">
        <section className="mobile-section">
          {/* User Info */}
          <div className="flex items-center mb-8">
            <div className="h-20 w-20 rounded-full overflow-hidden mr-4">
              <img
                src={userData.avatar}
                alt={userData.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold">{userData.name}</h2>
              <p className="text-muted-foreground">{userData.email}</p>
              <p className="text-sm mt-1">Member since {userData.memberSince}</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="fitness-card p-4 text-center">
              <div className="text-2xl font-bold text-fitness-green">
                {userData.workoutsCompleted}
              </div>
              <p className="text-sm">Workouts completed</p>
            </div>
            <div className="fitness-card p-4 text-center">
              <div className="text-2xl font-bold text-fitness-green">
                {profile?.weight ? `${profile?.weight} kg` : 'N/A'}
              </div>
              <p className="text-sm">Current weight</p>
            </div>
          </div>
          
          {/* Menu Items */}
          <div className="space-y-1">
            <Link
              to="/account"
              className="flex items-center px-4 py-3 hover:bg-muted rounded-lg"
            >
              <User size={20} className="mr-3 text-muted-foreground" />
              <span>Account Information</span>
            </Link>
            
            <Link
              to="/settings"
              className="flex items-center px-4 py-3 hover:bg-muted rounded-lg"
            >
              <Settings size={20} className="mr-3 text-muted-foreground" />
              <span>Settings</span>
            </Link>
            
            <Link
              to="/workout-history"
              className="flex items-center px-4 py-3 hover:bg-muted rounded-lg"
            >
              <Calendar size={20} className="mr-3 text-muted-foreground" />
              <span>Workout History</span>
            </Link>
            
            <Link
              to="/health-stats"
              className="flex items-center px-4 py-3 hover:bg-muted rounded-lg"
            >
              <Heart size={20} className="mr-3 text-muted-foreground" />
              <span>Health Stats</span>
            </Link>
            
            <Link
              to="/reminders"
              className="flex items-center px-4 py-3 hover:bg-muted rounded-lg"
            >
              <Clock size={20} className="mr-3 text-muted-foreground" />
              <span>Reminders</span>
            </Link>
            
            <Link
              to="/notifications"
              className="flex items-center px-4 py-3 hover:bg-muted rounded-lg"
            >
              <Bell size={20} className="mr-3 text-muted-foreground" />
              <span>Notification Preferences</span>
            </Link>
            
            <Link
              to="/payment"
              className="flex items-center px-4 py-3 hover:bg-muted rounded-lg"
            >
              <CreditCard size={20} className="mr-3 text-muted-foreground" />
              <span>Payment Methods</span>
            </Link>
            
            <Link
              to="/invite"
              className="flex items-center px-4 py-3 hover:bg-muted rounded-lg"
            >
              <UserPlus size={20} className="mr-3 text-muted-foreground" />
              <span>Invite Friends</span>
            </Link>
            
            <Link
              to="/help"
              className="flex items-center px-4 py-3 hover:bg-muted rounded-lg"
            >
              <HelpCircle size={20} className="mr-3 text-muted-foreground" />
              <span>Help Center</span>
            </Link>
            
            <button
              onClick={signOut}
              className="w-full flex items-center px-4 py-3 text-destructive hover:bg-destructive/10 rounded-lg mt-4"
            >
              <LogOut size={20} className="mr-3" />
              <span>Log Out</span>
            </button>
          </div>
        </section>
      </main>
    </>
  );
};

export default Profile;
