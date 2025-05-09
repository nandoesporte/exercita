
import React from 'react';
import { BarChart3, Users, Dumbbell, CalendarCheck, ArrowUp, ArrowDown } from 'lucide-react';

// Admin dashboard stats
const stats = [
  { 
    title: 'Total Users', 
    value: '5,248', 
    change: '+12%', 
    trend: 'up', 
    icon: Users 
  },
  { 
    title: 'Active Workouts', 
    value: '124', 
    change: '+5%', 
    trend: 'up', 
    icon: Dumbbell 
  },
  { 
    title: 'Appointments', 
    value: '346', 
    change: '+18%', 
    trend: 'up', 
    icon: CalendarCheck 
  },
  { 
    title: 'Revenue', 
    value: '$12,540', 
    change: '-2%', 
    trend: 'down', 
    icon: BarChart3 
  },
];

// Recent user activity
const recentActivity = [
  { 
    id: '1', 
    user: 'Sarah Johnson', 
    email: 'sarah.j@example.com',
    action: 'Completed a workout', 
    time: '10 minutes ago',
    avatar: 'https://randomuser.me/api/portraits/women/32.jpg' 
  },
  { 
    id: '2', 
    user: 'Michael Rodriguez', 
    email: 'michael.r@example.com',
    action: 'Booked an appointment', 
    time: '25 minutes ago',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg' 
  },
  { 
    id: '3', 
    user: 'Emma Wilson', 
    email: 'emma.w@example.com',
    action: 'Registered an account', 
    time: '1 hour ago',
    avatar: 'https://randomuser.me/api/portraits/women/66.jpg' 
  },
  { 
    id: '4', 
    user: 'David Lee', 
    email: 'david.l@example.com',
    action: 'Purchased premium plan', 
    time: '3 hours ago',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg' 
  },
];

const Dashboard = () => {
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
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
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
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center p-3 hover:bg-muted rounded-lg transition-colors">
                <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                  <img
                    src={activity.avatar}
                    alt={activity.user}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-grow">
                  <h3 className="font-medium">{activity.user}</h3>
                  <div className="text-sm text-muted-foreground flex flex-col sm:flex-row sm:items-center gap-1">
                    <span>{activity.action}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{activity.time}</span>
                  </div>
                </div>
                <button className="text-sm text-fitness-green hover:underline">
                  View
                </button>
              </div>
            ))}
          </div>
          <button className="w-full text-center text-fitness-green hover:underline py-2 mt-2 text-sm">
            View All Activity
          </button>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-card rounded-lg border border-border p-4">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button className="w-full bg-fitness-green text-white py-2 rounded-lg hover:bg-fitness-darkGreen transition-colors">
              Add New Workout
            </button>
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
