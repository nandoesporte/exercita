
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import MobileNavbar from './MobileNavbar';

const UserLayout = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Determine the header title based on the current route
  const getHeaderTitle = () => {
    switch (true) {
      case currentPath === '/profile':
        return 'Perfil';
      case currentPath === '/workouts':
        return 'Treinos';
      case currentPath === '/history':
        return 'Histórico';
      case currentPath.startsWith('/workout/'):
        return 'Detalhes do Treino';
      case currentPath === '/':
        return 'Início';
      default:
        return '';
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-fitness-dark text-white">
      <Header showSearch={false} title={getHeaderTitle()} />
      
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-3 pb-20 md:pb-8 animate-fade-in">
        <Outlet />
      </main>
      
      <MobileNavbar />
    </div>
  );
};

export default UserLayout;
