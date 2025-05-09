
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Dumbbell, Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const MobileNavbar = () => {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, path: '/', label: 'Início' },
    { icon: Dumbbell, path: '/workouts', label: 'Treinos' },
    { icon: Calendar, path: '/appointments', label: 'Agenda' },
    { icon: User, path: '/profile', label: 'Perfil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-fitness-dark/95 backdrop-blur-md border-t border-fitness-darkGray/50 z-50 px-2 py-1 md:hidden animate-slide-up">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-4 rounded-2xl transition-all duration-200",
                isActive 
                  ? "text-fitness-orange bg-fitness-darkGray/50" 
                  : "text-muted-foreground hover:text-white"
              )}
            >
              <item.icon size={20} className={cn(isActive ? "text-fitness-orange" : "text-muted-foreground")} />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavbar;
