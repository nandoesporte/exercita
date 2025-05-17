
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
  Users,
  ChevronRight
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

interface AdminSidebarProps {
  onNavItemClick?: () => void;
}

type NavItemProps = {
  to: string;
  icon: React.ElementType;
  label: string;
  badge?: string;
  onClick?: () => void;
}

const NavItem = ({ to, icon: Icon, label, badge, onClick }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => 
        `flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-fitness-green
        ${isActive ? 'bg-fitness-green/10 text-fitness-green' : 'text-gray-500 dark:text-gray-400'}`
      }
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      {badge && (
        <Badge variant="outline" className="text-xs bg-fitness-green/10 text-fitness-green">
          {badge}
        </Badge>
      )}
      <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
    </NavLink>
  );
};

const AdminSidebar = ({ onNavItemClick }: AdminSidebarProps = {}) => {
  const isMobile = useIsMobile();
  const handleClick = () => {
    if (onNavItemClick) onNavItemClick();
  };
  
  const navSections = [
    {
      title: "App",
      items: [
        { to: "/admin", icon: LayoutDashboard, label: "Dashboard" }
      ]
    },
    {
      title: "Funcionalidades",
      items: [
        { to: "/admin/workouts", icon: DumbbellIcon, label: "Treinos", badge: "5" },
        { to: "/admin/exercises", icon: DumbbellIcon, label: "Exercícios" },
        { to: "/admin/exercises/library", icon: Library, label: "Biblioteca de Exercícios" },
        { to: "/admin/products", icon: Gift, label: "Produtos" },
        { to: "/admin/photos", icon: ImageIcon, label: "Fotos da Academia" },
        { to: "/admin/schedule", icon: Clock, label: "Agenda" },
        { to: "/admin/appointments", icon: CalendarIcon, label: "Consultas", badge: "3" },
        { to: "/admin/payment-methods", icon: CreditCard, label: "Métodos de Pagamento" },
        { to: "/admin/users", icon: Users, label: "Usuários" },
        { to: "/admin/rls-checker", icon: Shield, label: "Verificador de RLS" }
      ]
    }
  ];
  
  return (
    <div className="h-full py-4 px-2 border-r bg-white dark:bg-fitness-darkGray shadow-sm flex flex-col overflow-y-auto">
      <div className="flex-1 space-y-4">
        {navSections.map((section, index) => (
          <div key={index} className="mb-2">
            <h2 className="text-sm font-semibold tracking-tight px-3 py-1">{section.title}</h2>
            <Separator className="my-2" />
            <nav className="space-y-1">
              {section.items.map((item, itemIndex) => (
                <NavItem 
                  key={itemIndex} 
                  to={item.to} 
                  icon={item.icon} 
                  label={item.label} 
                  badge={item.badge}
                  onClick={handleClick}
                />
              ))}
            </nav>
          </div>
        ))}
      </div>
      
      {/* Admin Info */}
      <div className="mt-auto">
        <Separator className="my-4" />
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800">
          <div className="w-8 h-8 rounded-full bg-fitness-green/20 flex items-center justify-center">
            <Users className="h-4 w-4 text-fitness-green" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Academia Fitness</span>
            <span className="text-xs text-muted-foreground">Admin Panel</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
