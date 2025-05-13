
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ChevronLeft, Menu, LogOut, ShoppingCart, ShoppingBag } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useStore } from '@/hooks/useStore';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

// Header component props type
type HeaderProps = {
  title?: string;
  showBackButton?: boolean;
  backTo?: string;
};

const Header = ({ title, showBackButton = false, backTo = "/" }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { cart } = useStore();
  const isMobile = useIsMobile();
  
  // Calculate total items in cart
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  
  // Handle logout
  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="flex flex-1 items-center justify-between md:justify-start">
          {/* Back button - only visible if showBackButton is true */}
          {showBackButton && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(backTo)} 
              className="mr-2"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Voltar</span>
            </Button>
          )}
          
          {/* Title */}
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">
              {title}
            </h1>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden mx-6 md:flex items-center gap-6 text-sm">
            <Link to="/" className="font-medium transition-colors hover:text-primary">
              Início
            </Link>
            <Link to="/workouts" className="font-medium transition-colors hover:text-primary">
              Treinos
            </Link>
            <Link to="/history" className="font-medium transition-colors hover:text-primary">
              Histórico
            </Link>
            <Link to="/store" className="font-medium transition-colors hover:text-primary flex items-center gap-1">
              <ShoppingBag className="h-4 w-4" />
              Loja
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center">
          {/* Cart */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative mr-2" 
            onClick={() => navigate('/cart')}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <Badge 
                variant="destructive" 
                className={cn(
                  "absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0",
                  cartItemCount > 9 ? "text-[10px]" : "text-xs"
                )}
              >
                {cartItemCount > 99 ? "99+" : cartItemCount}
              </Badge>
            )}
            <span className="sr-only">Carrinho</span>
          </Button>
          
          {/* Dropdown menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/profile">Perfil</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings">Configurações</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/my-orders">Meus Pedidos</Link>
              </DropdownMenuItem>
              {user?.isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/admin">Painel Admin</Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
