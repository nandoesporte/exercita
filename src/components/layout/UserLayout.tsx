
import React from 'react';
import { Outlet } from 'react-router-dom';
import MobileNavbar from './MobileNavbar';

const UserLayout = () => {
  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Outlet />
      <MobileNavbar />
    </div>
  );
};

export default UserLayout;
