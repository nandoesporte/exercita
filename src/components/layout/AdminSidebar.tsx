import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Settings, ListChecks, Book } from 'lucide-react';

const AdminSidebar = ({ onNavItemClick }: { onNavItemClick?: () => void }) => {
  const location = useLocation();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: Home
    },
    {
      name: 'Usuários',
      href: '/admin/users',
      icon: Users
    },
    {
      name: 'Workouts',
      href: '/admin/workouts',
      icon: ListChecks
    },
    {
      name: 'Biblioteca de Exercícios',
      href: '/admin/exercise-library',
      icon: Book
    },
    {
      name: 'Configurações',
      href: '/admin/settings',
      icon: Settings
    },
  ];

  return (
    <div className="w-64 flex-shrink-0 border-r border-border bg-secondary py-4">
      <nav className="flex flex-col h-full">
        <div className="px-4 pb-4">
          <span className="block text-sm font-semibold text-muted-foreground">Administração</span>
        </div>
        <ul className="space-y-1 flex-1">
          {navigationItems.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground ${location.pathname === item.href ? 'bg-accent text-accent-foreground' : 'text-foreground'}`}
                onClick={onNavItemClick}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;
