
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Dumbbell, CalendarDays, FileText, Settings,
  BarChart, LogOut, ShoppingBag, Package, CreditCard
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
    { icon: Users, path: '/admin/users', label: 'Users' },
    { icon: Dumbbell, path: '/admin/exercises', label: 'Exercises' },
    { icon: Dumbbell, path: '/admin/workouts', label: 'Workouts' },
    { icon: ShoppingBag, path: '/admin/products', label: 'Products' },
    { icon: CreditCard, path: '/admin/orders', label: 'Orders' },
    { icon: CalendarDays, path: '/admin/appointments', label: 'Appointments' },
    { icon: FileText, path: '/admin/blog', label: 'Blog' },
    { icon: BarChart, path: '/admin/analytics', label: 'Analytics' },
    { icon: Settings, path: '/admin/settings', label: 'Settings' },
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

  return (
    <aside className="flex flex-col bg-card border-r border-border h-full w-full md:w-64 p-4">
      <div className="flex items-center mb-8 px-2">
        <span className="text-2xl font-bold text-fitness-green">FitFlow</span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
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
