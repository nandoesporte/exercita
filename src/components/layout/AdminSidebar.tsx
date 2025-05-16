import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Dumbbell,
  Users,
  Settings,
  Camera
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const AdminSidebar = ({ onNavItemClick }: { onNavItemClick?: () => void }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  
  const getNavItemClass = (isActive: boolean) => {
    return `flex items-center px-4 py-2 rounded-md hover:bg-secondary ${
      isActive ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground'
    }`;
  };
  
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  return (
    <div className="h-full w-64 bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border mb-4 flex items-center gap-2">
        <img 
          src="/lovable-uploads/abe8bbb7-7e2f-4277-b5b0-1f923e57b6f7.png"
          alt="Mais Saúde Logo"
          className="h-10 w-10"
        />
        <div className="flex flex-col">
          <span className="font-extrabold text-xl">Mais Saúde</span>
          <span className="text-xs text-muted-foreground">Painel Administrativo</span>
        </div>
      </div>
      
      <nav className="flex-1 px-2">
        <ul className="space-y-1">
          <li>
            <NavLink 
              to="/admin" 
              onClick={onNavItemClick}
              className={({ isActive }) => getNavItemClass(isActive)}
            >
              <LayoutDashboard size={20} className="mr-3" />
              Dashboard
            </NavLink>
          </li>
          
          <li>
            <NavLink 
              to="/admin/users" 
              onClick={onNavItemClick}
              className={({ isActive }) => getNavItemClass(isActive)}
            >
              <Users size={20} className="mr-3" />
              Usuários
            </NavLink>
          </li>
          
          <li>
            <NavLink 
              to="/admin/workouts" 
              onClick={onNavItemClick}
              className={({ isActive }) => getNavItemClass(isActive)}
            >
              <Dumbbell size={20} className="mr-3" />
              Treinos
            </NavLink>
          </li>
          
          {/* Add new nav item for Gym Photos */}
          <li>
            <NavLink 
              to="/admin/gym-photos" 
              onClick={onNavItemClick}
              className={({ isActive }) => getNavItemClass(isActive)}
            >
              <Camera size={20} className="mr-3" />
              Fotos de Academia
            </NavLink>
          </li>
          
          <li>
            <NavLink 
              to="/admin/settings" 
              onClick={onNavItemClick}
              className={({ isActive }) => getNavItemClass(isActive)}
            >
              <Settings size={20} className="mr-3" />
              Configurações
            </NavLink>
          </li>
        </ul>
      </nav>
      
      <div className="p-4">
        <button 
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors"
        >
          Sair
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
