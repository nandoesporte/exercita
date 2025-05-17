import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  DumbbellIcon, 
  Gift, 
  ImageIcon, 
  Clock, 
  CalendarIcon, 
  CreditCard,
  Shield,
  Library,
  Users
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface AdminSidebarProps {
  onNavItemClick?: () => void;
}

const AdminSidebar = ({ onNavItemClick }: AdminSidebarProps = {}) => {
  const handleClick = () => {
    if (onNavItemClick) onNavItemClick();
  };
  
  return (
    <div className="h-full py-6 px-3 border-r bg-white dark:bg-fitness-darkGray shadow-sm flex flex-col">
      <div className="flex-1">
        <div className="mb-4">
          <h2 className="text-l font-semibold tracking-tight px-4">App</h2>
          <Separator className="my-2" />
          <nav className="space-y-1">
            <NavLink
              to="/admin"
              className={({ isActive }) => 
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-fitness-green
                ${isActive ? 'bg-fitness-green/10 text-fitness-green' : 'text-gray-500 dark:text-gray-400'}`
              }
              onClick={handleClick}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </NavLink>
          </nav>
        </div>
        
        <div className="mb-4">
          <h2 className="text-l font-semibold tracking-tight px-4">Funcionalidades</h2>
          <Separator className="my-2" />
          <nav className="space-y-1">
            <NavLink
              to="/admin/workouts"
              className={({ isActive }) => 
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-fitness-green
                ${isActive ? 'bg-fitness-green/10 text-fitness-green' : 'text-gray-500 dark:text-gray-400'}`
              }
              onClick={handleClick}
            >
              <DumbbellIcon className="h-4 w-4" />
              Treinos
            </NavLink>
            
            <NavLink
              to="/admin/exercises"
              className={({ isActive }) => 
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-fitness-green
                ${isActive ? 'bg-fitness-green/10 text-fitness-green' : 'text-gray-500 dark:text-gray-400'}`
              }
              onClick={handleClick}
            >
              <DumbbellIcon className="h-4 w-4" />
              Exercícios
            </NavLink>
            
            <NavLink
              to="/admin/exercises/library"
              className={({ isActive }) => 
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-fitness-green
                ${isActive ? 'bg-fitness-green/10 text-fitness-green' : 'text-gray-500 dark:text-gray-400'}`
              }
              onClick={handleClick}
            >
              <Library className="h-4 w-4" />
              Biblioteca de Exercícios
            </NavLink>
            
            <NavLink
              to="/admin/products"
              className={({ isActive }) => 
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-fitness-green
                ${isActive ? 'bg-fitness-green/10 text-fitness-green' : 'text-gray-500 dark:text-gray-400'}`
              }
              onClick={handleClick}
            >
              <Gift className="h-4 w-4" />
              Produtos
            </NavLink>
            
            <NavLink
              to="/admin/photos"
              className={({ isActive }) => 
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-fitness-green
                ${isActive ? 'bg-fitness-green/10 text-fitness-green' : 'text-gray-500 dark:text-gray-400'}`
              }
              onClick={handleClick}
            >
              <ImageIcon className="h-4 w-4" />
              Fotos da Academia
            </NavLink>
            
            <NavLink
              to="/admin/schedule"
              className={({ isActive }) => 
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-fitness-green
                ${isActive ? 'bg-fitness-green/10 text-fitness-green' : 'text-gray-500 dark:text-gray-400'}`
              }
              onClick={handleClick}
            >
              <Clock className="h-4 w-4" />
              Agenda
            </NavLink>
            
            <NavLink
              to="/admin/appointments"
              className={({ isActive }) => 
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-fitness-green
                ${isActive ? 'bg-fitness-green/10 text-fitness-green' : 'text-gray-500 dark:text-gray-400'}`
              }
              onClick={handleClick}
            >
              <CalendarIcon className="h-4 w-4" />
              Consultas
            </NavLink>
            
            <NavLink
              to="/admin/payment-methods"
              className={({ isActive }) => 
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-fitness-green
                ${isActive ? 'bg-fitness-green/10 text-fitness-green' : 'text-gray-500 dark:text-gray-400'}`
              }
              onClick={handleClick}
            >
              <CreditCard className="h-4 w-4" />
              Métodos de Pagamento
            </NavLink>
            
            <NavLink
              to="/admin/users"
              className={({ isActive }) => 
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-fitness-green
                ${isActive ? 'bg-fitness-green/10 text-fitness-green' : 'text-gray-500 dark:text-gray-400'}`
              }
              onClick={handleClick}
            >
              <Users className="h-4 w-4" />
              Usuários
            </NavLink>
            
            <NavLink
              to="/admin/rls-checker"
              className={({ isActive }) => 
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-fitness-green
                ${isActive ? 'bg-fitness-green/10 text-fitness-green' : 'text-gray-500 dark:text-gray-400'}`
              }
              onClick={handleClick}
            >
              <Shield className="h-4 w-4" />
              Verificador de RLS
            </NavLink>
          </nav>
        </div>
      </div>
      
      {/* Admin Info */}
      <div className="mt-auto">
        <Separator className="my-4" />
        <div className="flex flex-col px-3 py-2">
          <span className="text-xs text-muted-foreground">Academia Fitness</span>
          <span className="text-xs text-muted-foreground">Painel Administrativo</span>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
