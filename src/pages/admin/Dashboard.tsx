
import React from 'react';
import { BarChart3, Users, Dumbbell, CalendarCheck, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      // Get counts from different tables
      const [usersResult, workoutsResult, appointmentsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('workouts').select('id', { count: 'exact', head: true }),
        supabase.from('appointments').select('id', { count: 'exact', head: true }),
      ]);
      
      if (usersResult.error) throw new Error(usersResult.error.message);
      if (workoutsResult.error) throw new Error(workoutsResult.error.message);
      if (appointmentsResult.error) throw new Error(appointmentsResult.error.message);
      
      return {
        users: usersResult.count || 0,
        workouts: workoutsResult.count || 0,
        appointments: appointmentsResult.count || 0,
      };
    },
  });
  
  // Fetch recent activity
  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['admin-recent-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) throw new Error(error.message);
      
      return data.map(user => ({
        id: user.id,
        user: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'New User',
        email: '', // We don't store emails in profiles
        action: 'Registered an account',
        time: user.created_at,
        avatar: user.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + user.first_name,
      }));
    },
  });

  // Create stats array based on real data
  const stats = [
    { 
      title: 'Total Users', 
      value: statsLoading ? '...' : statsData?.users.toString(), 
      change: '+12%', // These would ideally come from comparing current vs previous time period
      trend: 'up', 
      icon: Users,
      isLoading: statsLoading
    },
    { 
      title: 'Active Workouts', 
      value: statsLoading ? '...' : statsData?.workouts.toString(), 
      change: '+5%', 
      trend: 'up', 
      icon: Dumbbell,
      isLoading: statsLoading
    },
    { 
      title: 'Appointments', 
      value: statsLoading ? '...' : statsData?.appointments.toString(), 
      change: '+18%', 
      trend: 'up', 
      icon: CalendarCheck,
      isLoading: statsLoading
    },
    { 
      title: 'Revenue', 
      value: '$12,540', // Mock data for now - would need a payments table
      change: '-2%', 
      trend: 'down', 
      icon: BarChart3,
      isLoading: false
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <h3 className="text-2xl font-bold mt-1">
                  {stat.isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    stat.value
                  )}
                </h3>
              </div>
              <div className="p-2 rounded-md bg-secondary">
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              {stat.trend === 'up' ? (
                <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                {stat.change}
              </span>
              <span className="text-xs text-muted-foreground ml-2">vs last month</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent User Activity */}
        <div className="lg:col-span-2 bg-card rounded-lg border border-border p-4">
          <h2 className="text-lg font-semibold mb-4">Recent User Activity</h2>
          {activityLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-fitness-green mr-2" />
              <span>Loading activity...</span>
            </div>
          ) : recentActivity && recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center p-3 hover:bg-muted rounded-lg transition-colors">
                  <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                    <img
                      src={activity.avatar}
                      alt={activity.user}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${activity.user}`;
                      }}
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium">{activity.user}</h3>
                    <div className="text-sm text-muted-foreground flex flex-col sm:flex-row sm:items-center gap-1">
                      <span>{activity.action}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>
                        {activity.time ? formatDistanceToNow(new Date(activity.time), { addSuffix: true }) : 'Recently'}
                      </span>
                    </div>
                  </div>
                  <button className="text-sm text-fitness-green hover:underline">
                    View
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-muted-foreground">
              No recent activity found.
            </div>
          )}
          <button className="w-full text-center text-fitness-green hover:underline py-2 mt-2 text-sm">
            View All Activity
          </button>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-card rounded-lg border border-border p-4">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link 
              to="/admin/workouts/new" 
              className="block w-full bg-fitness-green text-white py-2 rounded-lg hover:bg-fitness-darkGreen transition-colors text-center"
            >
              Add New Workout
            </Link>
            <button className="w-full bg-secondary text-foreground py-2 rounded-lg hover:bg-muted transition-colors">
              Manage Appointments
            </button>
            <button className="w-full bg-secondary text-foreground py-2 rounded-lg hover:bg-muted transition-colors">
              Create Blog Post
            </button>
            <button className="w-full bg-secondary text-foreground py-2 rounded-lg hover:bg-muted transition-colors">
              View Reports
            </button>
          </div>
          
          {/* Recent Notifications */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-3">Recent Notifications</h2>
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium">System Maintenance</h4>
                <p className="text-sm text-muted-foreground">Scheduled for May 15, 2025 at 2:00 AM</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium">New Feature Available</h4>
                <p className="text-sm text-muted-foreground">Video workouts now available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
