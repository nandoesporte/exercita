
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Dumbbell, CalendarDays, FileText, Settings,
  BarChart, LogOut, ShoppingBag, Calendar, CreditCard
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  onNavItemClick?: () => void;
}

const AdminSidebar = ({ onNavItemClick }: AdminSidebarProps) => {
  const location = useLocation();
  const { signOut } = useAuth();

  const navItems = [
    { icon: LayoutDashboard, path: '/admin', label: 'Dashboard' },
    { icon: Users, path: '/admin/users', label: 'Usuários' },
    { 
      icon: Dumbbell, 
      path: '/admin/exercises', 
      label: 'Exercícios',
      children: [
        { path: '/admin/exercises', label: 'Gerenciar Exercícios' },
        { path: '/admin/exercises/library', label: 'Biblioteca de Exercícios' },
      ]
    },
    { icon: Dumbbell, path: '/admin/workouts', label: 'Treinos' },
    { icon: ShoppingBag, path: '/admin/products', label: 'Loja' },
    { icon: Calendar, path: '/admin/schedule', label: 'Agendamento' },
    { icon: CalendarDays, path: '/admin/appointments', label: 'Agendamentos' },
    { icon: CreditCard, path: '/admin/payments', label: 'Pagamentos' },
    { icon: FileText, path: '/admin/blog', label: 'Blog' },
    { icon: BarChart, path: '/admin/analytics', label: 'Estatísticas' },
    { icon: Settings, path: '/admin/settings', label: 'Configurações' },
  ];

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Logout button clicked in AdminSidebar");
    await signOut();
  };

  const handleNavClick = () => {
    if (onNavItemClick) {
      onNavItemClick();
    }
  };

  // Function to determine if a path is active or one of its children is active
  const isPathActive = (path: string, childPaths?: string[]) => {
    if (location.pathname === path) return true;
    if (childPaths) {
      return childPaths.some(childPath => location.pathname === childPath);
    }
    return false;
  };

  // Function to determine if a submenu should be expanded
  const shouldExpand = (item: any) => {
    if (!item.children) return false;
    return item.children.some((child: any) => location.pathname === child.path);
  };

  return (
    <aside className="flex flex-col bg-card border-r border-border h-full w-full md:w-64 p-4">
      <div className="flex items-center mb-8 px-2">
        <span className="text-2xl font-bold text-fitness-green">FitFlow</span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = isPathActive(item.path, item.children?.map(c => c.path));
          const isExpanded = shouldExpand(item);
          
          return (
            <div key={item.path} className="space-y-1">
              {/* Main Menu Item */}
              {item.children ? (
                // If the item has children, render a dropdown menu
                <>
                  <div
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer",
                      isActive 
                        ? 'bg-fitness-green text-white' 
                        : 'text-foreground hover:bg-muted'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={20} />
                      <span>{item.label}</span>
                    </div>
                  </div>

                  {/* Submenu Items */}
                  <div className="pl-10 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        onClick={handleNavClick}
                        className={cn(
                          "flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors",
                          location.pathname === child.path
                            ? 'bg-fitness-green/20 text-fitness-green font-medium' 
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        <span>{child.label}</span>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                // Regular menu item without children
                <Link
                  to={item.path}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    isActive 
                      ? 'bg-fitness-green text-white' 
                      : 'text-foreground hover:bg-muted'
                  )}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-border pt-4 mt-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
