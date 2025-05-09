
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import MobileNavbar from './MobileNavbar';

const UserLayout = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Determine the header title based on the current route
  const getHeaderTitle = () => {
    switch (currentPath) {
      case '/profile':
        return 'Profile';
      case '/workouts':
        return 'Workouts';
      case '/appointments':
        return 'Schedule';
      case '/':
        return '';
      default:
        return '';
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-fitness-dark text-white">
      <Header showSearch={true} title={getHeaderTitle()} />
      
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-6 pb-20 md:pb-8">
        <Outlet />
      </main>
      
      <MobileNavbar />
    </div>
  );
};

export default UserLayout;
