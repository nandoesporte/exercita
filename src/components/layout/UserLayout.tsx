
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import MobileNavbar from './MobileNavbar';

const UserLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-fitness-dark text-white">
      <Header />
      
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-6 pb-20 md:pb-8">
        <Outlet />
      </main>
      
      <MobileNavbar />
    </div>
  );
};

export default UserLayout;
