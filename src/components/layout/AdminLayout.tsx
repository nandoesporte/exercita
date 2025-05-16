
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { Menu, X, HeartPulse } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useIsMobile } from '@/hooks/use-mobile';

const AdminLayout = () => {
  const [open, setOpen] = useState(false);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Add extra protection to make sure only admins can access this layout
  useEffect(() => {
    if (!isAdmin) {
      console.log('Non-admin trying to access admin layout, redirecting to home');
      navigate('/', { replace: true });
    }
  }, [isAdmin, navigate]);

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border h-16 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            {/* Mobile sidebar trigger */}
            {isMobile && (
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu size={24} />
                    <span className="sr-only">Alternar menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[80%] max-w-xs">
                  <AdminSidebar onNavItemClick={() => setOpen(false)} />
                </SheetContent>
              </Sheet>
            )}
            
            {/* Logo in admin header */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fitness-orange to-fitness-orange/80 flex items-center justify-center shadow-lg shadow-fitness-orange/20">
                <HeartPulse className="text-white h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl">Exercita</span>
                <span className="text-xs text-muted-foreground">Painel Administrativo</span>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
