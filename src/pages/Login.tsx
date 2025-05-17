
import React, { useState, useEffect } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Loader2 } from "lucide-react";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { toast } from "sonner";

const Login = () => {
  const { user, signIn, adminLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const searchParams = new URLSearchParams(location.search);
  const needsAdminAccess = searchParams.get('adminAccess') === 'required';
  
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
      toast.info("Acesso administrativo necessário. Por favor, faça login.");
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
  
  // Fix for login loop - Use a local indicator rather than relying only on auth context
  // which might cause render loops
  const [shouldRedirect, setShouldRedirect] = useState(false);
  
  // Check if user is logged in to prevent loop
  useEffect(() => {
    if (user && !shouldRedirect) {
      // Log detailed user information for debugging
      console.log("User authenticated in Login page:", { 
        id: user.id,
        email: user.email,
        metadata: user.user_metadata,
        createdAt: user.created_at
      });
      
      // Set a small timeout to avoid immediate redirects that might cause loops
      setTimeout(() => {
        setShouldRedirect(true);
      }, 100);
    }
  }, [user, shouldRedirect]);
  
  // If user is already logged in and we've confirmed we should redirect, do so
  if (shouldRedirect) {
    // If login was just successful, delay redirect slightly to show PWA prompt
    if (loginSuccess && canInstall && showPWAPrompt) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="w-full max-w-md text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fitness-orange mx-auto"></div>
            <p className="mt-4">Redirecionando...</p>
            <PWAInstallPrompt onClose={handleClosePWAPrompt} />
          </div>
        </div>
      );
    }
    
    // Normal redirect
    console.log("Redirecting to home page");
    return <Navigate to="/" replace />;
  }
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('Attempting login with:', loginEmail);
      
      // Add extra debugging to check credentials
      console.log('Login credentials:', { 
        email: loginEmail, 
        passwordLength: loginPassword.length 
      });
      
      await signIn(loginEmail, loginPassword);
      console.log('Login successful, setting loginSuccess state');
      // Mark login as successful to trigger PWA prompt
      setLoginSuccess(true);
    } catch (error) {
      console.error("Login error details:", error);
      
      // Show more specific error message
      if ((error as Error).message?.includes('Invalid login credentials')) {
        toast.error("Credenciais inválidas. Por favor, verifique seu email e senha.");
      } else {
        toast.error(`Erro ao fazer login: ${(error as Error).message || "Erro desconhecido"}`);
      }
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
      console.error("Admin login error details:", error);
      toast.error(`Erro de login admin: ${(error as Error).message || "Erro desconhecido"}`);
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
                    autoComplete="email"
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
                    autoComplete="current-password"
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Entrando...
                    </>
                  ) : "Entrar"}
                </Button>

                {/* Removido botão de mostrar/esconder o formulário admin */}

                {/* O formulário de login admin está sempre visível */}
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
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Verificando...
                          </>
                        ) : "Acessar Admin"}
                      </Button>
                    </div>
                  </form>
                </div>
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
