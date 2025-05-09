
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import MobileNavbar from './MobileNavbar';
import { useAuth } from '@/hooks/useAuth';

const UserLayout = () => {
  const { isAdmin } = useAuth();
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-8">
        {isAdmin && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800 font-medium">
              You have admin access! 
              <a href="/admin" className="ml-2 text-fitness-green underline">
                Go to Admin Dashboard
              </a>
            </p>
          </div>
        )}
        <Outlet />
      </main>
      
      <MobileNavbar />
    </div>
  );
};

export default UserLayout;
