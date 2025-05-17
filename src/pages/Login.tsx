
import React, { useState, useEffect } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { toast } from "sonner";

const Login = () => {
  const { user, signIn, adminLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const needsAdminAccess = searchParams.get('adminAccess') === 'required';
  
  // Show admin login automatically if redirected from admin page
  const [showAdminLogin, setShowAdminLogin] = useState(needsAdminAccess);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Admin login state
  const [adminPassword, setAdminPassword] = useState("");
  
  // PWA installation prompt
  const { canInstall, showPrompt, closePrompt, showInstallPrompt } = usePWAInstall();
  const [showPWAPrompt, setShowPWAPrompt] = useState(false);
  
  // Track successful login to show PWA prompt
  const [loginSuccess, setLoginSuccess] = useState(false);
  
  // Define handleClosePWAPrompt before it's used
  const handleClosePWAPrompt = () => {
    console.log('Closing PWA prompt');
    setShowPWAPrompt(false);
    closePrompt();
  };
  
  useEffect(() => {
    // If redirected from admin page with adminAccess=required, show a message
    if (needsAdminAccess) {
      setShowAdminLogin(true);
    }
  }, [needsAdminAccess]);
  
  // Show PWA install prompt after successful login if available
  useEffect(() => {
    if (loginSuccess && canInstall) {
      console.log('Login successful and PWA can be installed, showing prompt');
      // Small delay to ensure the navigation completes first
      const timer = setTimeout(() => {
        console.log('Attempting to show PWA prompt after successful login');
        if (showPrompt()) {
          setShowPWAPrompt(true);
        } else {
          console.log('showPrompt() returned false, not showing PWA prompt');
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [loginSuccess, canInstall, showPrompt]);
  
  // If user is already logged in, redirect to home page
  if (user) {
    // If login was just successful, delay redirect slightly to show PWA prompt
    if (loginSuccess && canInstall && !showPWAPrompt) {
      // Give time for the PWA prompt to appear
      setTimeout(() => {
        console.log('Redirecting after login');
      }, 1500);
      
      // Return null to delay redirect while showing the PWA prompt
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="w-full max-w-md text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fitness-orange mx-auto"></div>
            <p className="mt-4">Redirecionando...</p>
            {showPWAPrompt && <PWAInstallPrompt onClose={handleClosePWAPrompt} />}
          </div>
        </div>
      );
    }
    
    return <Navigate to="/" replace />;
  }
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signIn(loginEmail, loginPassword);
      console.log('Login successful, setting loginSuccess state');
      // Mark login as successful to trigger PWA prompt
      setLoginSuccess(true);
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await adminLogin(adminPassword);
      console.log('Admin login successful, setting loginSuccess state');
      // Show PWA install prompt after successful login
      setLoginSuccess(true);
    } catch (error) {
      console.error("Admin login error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-2">
            {/* Logo updated to match the logo used in other pages */}
            <img 
              src="/lovable-uploads/abe8bbb7-7e2f-4277-b5b0-1f923e57b6f7.png"
              alt="Mais Saúde Logo"
              className="h-10 w-10"
            />
            <span className="font-extrabold text-xl text-fitness-orange">Mais Saúde</span>
          </div>
          <p className="text-muted-foreground">Seu companheiro de fitness pessoal</p>
        </div>
      
        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo</CardTitle>
            <CardDescription>
              {needsAdminAccess 
                ? "Acesso administrativo necessário. Por favor, faça login e digite a senha de administrador."
                : "Entre na sua conta para começar"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="login-email" className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="nome@exemplo.com"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="login-password" className="block text-sm font-medium mb-1">
                    Senha
                  </label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>

                <div className="text-center">
                  <button 
                    type="button" 
                    onClick={() => setShowAdminLogin(!showAdminLogin)}
                    className="text-sm text-fitness-green hover:underline"
                  >
                    {showAdminLogin ? "Ocultar Login Admin" : "Login Admin"}
                  </button>
                </div>

                {showAdminLogin && (
                  <div className="mt-4 border border-gray-200 rounded-md p-4">
                    <form onSubmit={handleAdminLogin}>
                      <div className="space-y-4">
                        <div className="flex items-center text-amber-600 mb-2">
                          <AlertTriangle size={16} className="mr-2" />
                          <span className="text-sm">Acesso administrativo apenas</span>
                        </div>
                        <div>
                          <label htmlFor="admin-password" className="block text-sm font-medium mb-1">
                            Senha de Administrador
                          </label>
                          <Input
                            id="admin-password"
                            type="password"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            placeholder="Senha de administrador"
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={isLoading}>
                          {isLoading ? "Verificando..." : "Acessar Admin"}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <p className="text-center text-sm text-muted-foreground">
              <Link to="/" className="text-fitness-green hover:underline">
                Voltar à página inicial
              </Link>
            </p>
          </CardFooter>
        </Card>
        
        {/* PWA Installation Prompt */}
        {showPWAPrompt && <PWAInstallPrompt onClose={handleClosePWAPrompt} />}
      </div>
    </div>
  );
};

export default Login;
