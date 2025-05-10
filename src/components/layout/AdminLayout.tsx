
import React, { useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { Menu, BadgeDollarSign } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  
  // Add extra protection to make sure only admins can access this layout
  useEffect(() => {
    if (!isAdmin) {
      console.log('Non-admin trying to access admin layout, redirecting to home');
      navigate('/', { replace: true });
    }
  }, [isAdmin, navigate]);

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border h-16 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-md hover:bg-muted"
            >
              <Menu size={24} />
            </button>
            
            {/* Logo in admin header */}
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fitness-orange to-fitness-orange/80 flex items-center justify-center shadow-lg shadow-fitness-orange/20">
                <BadgeDollarSign className="text-white h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl">Exercita</span>
                <span className="text-xs text-muted-foreground">Admin Dashboard</span>
              </div>
            </Link>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-card z-50 md:hidden">
            <AdminSidebar />
          </div>
        </>
      )}
    </div>
  );
};

export default AdminLayout;
