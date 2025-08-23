
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
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

interface AdminSidebarProps {
  onNavItemClick?: () => void;
}

const AdminSidebar = ({ onNavItemClick }: AdminSidebarProps = {}) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
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
      title: 'Dashboard',
      icon: <LineChart className="mr-2 h-4 w-4" />,
      to: '/admin'
    },
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
    {
      title: 'Gerenciamento de Usuários',
      icon: <Users className="mr-2 h-4 w-4" />,
      to: '/admin/users'
    },
    {
      title: 'RLS Checker',
      icon: <ShieldCheck className="mr-2 h-4 w-4" />,
      to: '/admin/rls-checker'
    }
  ];

  return (
    <div
      className={`flex flex-col h-full bg-gray-50 border-r border-r-gray-200 dark:bg-gray-900 dark:border-r-gray-700 ${
        isExpanded ? "w-64" : "w-20"
      } transition-width duration-300 ease-in-out`}
    >
      <div className="flex items-center justify-center py-4">
        <span
          className={`text-lg font-bold transition-opacity duration-300 ${
            isExpanded ? "opacity-100" : "opacity-0"
          }`}
        >
          Painel Admin
        </span>
      </div>
      <nav className="flex-grow px-2 space-y-1">
        {items.map((item) => (
          <Button
            key={item.title}
            variant="ghost"
            className={`flex items-center w-full justify-start py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-sm sm:text-base ${
              isExpanded ? "pl-4" : "justify-center"
            }`}
            onClick={() => handleNavigation(item.to)}
          >
            {item.icon}
            <span
              className={`transition-opacity duration-300 truncate ${
                isExpanded ? "opacity-100" : "opacity-0"
              }`}
            >
              {item.title}
            </span>
          </Button>
        ))}
      </nav>
      <div className="p-2 sm:p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 w-full justify-start">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span
                className={`font-semibold transition-opacity duration-300 truncate text-sm sm:text-base ${
                  isExpanded ? "opacity-100" : "opacity-0"
                }`}
              >
                {user?.email}
              </span>
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
