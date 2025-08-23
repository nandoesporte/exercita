
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useAdminRole } from "@/hooks/useAdminRole";
import {
  LineChart,
  Dumbbell,
  ListVideo,
  ShoppingBag,
  Calendar,
  CalendarRange,
  CreditCard,
  Users,
  ShieldCheck,
  Camera,
  List,
  Crown,
  Shield,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface AdminSidebarProps {
  onNavItemClick?: () => void;
}

const AdminSidebar = ({ onNavItemClick }: AdminSidebarProps = {}) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isSuperAdmin, isAdmin } = useAdminRole();
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (onNavItemClick) {
      onNavItemClick();
    }
  };

  const items = [
    {
      title: isSuperAdmin ? 'Dashboard Geral' : 'Dashboard',
      icon: <LineChart className="mr-2 h-4 w-4" />,
      to: '/admin'
    },
    // Only show super admin dashboard for Super Admins
    ...(isSuperAdmin ? [{
      title: 'Super Admin',
      icon: <Crown className="mr-2 h-4 w-4" />,
      to: '/admin/super-dashboard'
    }] : []),
    // Only show admin management for Super Admins
    ...(isSuperAdmin ? [{
      title: 'Gerenciar Admins',
      icon: <Shield className="mr-2 h-4 w-4" />,
      to: '/admin/admins'
    }] : []),
    {
      title: 'Gerenciamento de Treinos',
      icon: <Dumbbell className="mr-2 h-4 w-4" />,
      to: '/admin/workouts'
    },
    {
      title: 'Biblioteca de Exercícios',
      icon: <ListVideo className="mr-2 h-4 w-4" />,
      to: '/admin/exercises'
    },
    {
      title: 'Categorias de Exercícios',
      icon: <Dumbbell className="mr-2 h-4 w-4" />,
      to: '/admin/exercises/categories'
    },
    {
      title: 'Produtos',
      icon: <ShoppingBag className="mr-2 h-4 w-4" />,
      to: '/admin/products'
    },
    {
      title: 'Categorias',
      icon: <List className="mr-2 h-4 w-4" />,
      to: '/admin/categories'
    },
    {
      title: 'Fotos da Academia',
      icon: <Camera className="mr-2 h-4 w-4" />,
      to: '/admin/photos'
    },
    {
      title: 'Horários',
      icon: <Calendar className="mr-2 h-4 w-4" />,
      to: '/admin/schedule'
    },
    {
      title: 'Agendamentos',
      icon: <CalendarRange className="mr-2 h-4 w-4" />,
      to: '/admin/appointments'
    },
    {
      title: 'Métodos de Pagamento',
      icon: <CreditCard className="mr-2 h-4 w-4" />,
      to: '/admin/payment-methods'
    },
    // Only show user management for Super Admins
    ...(isSuperAdmin ? [{
      title: 'Gerenciamento de Usuários',
      icon: <Users className="mr-2 h-4 w-4" />,
      to: '/admin/users'
    }] : []),
    // Only show RLS Checker for Super Admins
    ...(isSuperAdmin ? [{
      title: 'RLS Checker',
      icon: <ShieldCheck className="mr-2 h-4 w-4" />,
      to: '/admin/rls-checker'
    }] : [])
  ];

  return (
    <div
      className={`flex flex-col h-full bg-gray-50 border-r border-r-gray-200 dark:bg-gray-900 dark:border-r-gray-700 ${
        isExpanded ? "w-64" : "w-20"
      } transition-width duration-300 ease-in-out`}
    >
      <div className="flex items-center justify-center py-6">
        <div className="flex items-center gap-3">
          {isSuperAdmin && <Crown className="h-6 w-6 text-yellow-500" />}
          <span
            className={`text-xl font-bold transition-opacity duration-300 ${
              isExpanded ? "opacity-100" : "opacity-0"
            }`}
          >
            Painel Admin
          </span>
        </div>
      </div>
      <nav className="flex-grow px-3 space-y-2">
        {items.map((item) => (
          <Button
            key={item.title}
            variant="ghost"
            className={`flex items-center w-full justify-start py-4 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-base font-medium min-h-[52px] transition-all duration-200 active:scale-[0.98] ${
              isExpanded ? "pl-5" : "justify-center"
            }`}
            onClick={() => handleNavigation(item.to)}
          >
            <span className="flex items-center gap-3 w-full">
              {item.icon}
              <span
                className={`transition-opacity duration-300 truncate ${
                  isExpanded ? "opacity-100" : "opacity-0"
                }`}
              >
                {item.title}
              </span>
            </span>
          </Button>
        ))}
      </nav>
      <div className="p-3 sm:p-5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-3 w-full justify-start py-4 px-4 min-h-[60px] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="text-base font-medium">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span
                  className={`font-semibold transition-opacity duration-300 truncate text-base ${
                    isExpanded ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {user?.email}
                </span>
                {isSuperAdmin && (
                  <Badge variant="secondary" className={`text-sm ${isExpanded ? "opacity-100" : "opacity-0"}`}>
                    Super Admin
                  </Badge>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/account")}>
              Informações da Conta
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default AdminSidebar;
