
import React, { useState, useEffect } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle } from "lucide-react";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { usePWAInstall } from "@/hooks/usePWAInstall";

const Login = () => {
  const { user, signIn, signUp, adminLogin } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const needsAdminAccess = searchParams.get('adminAccess') === 'required';
  
  // Show admin login automatically if redirected from admin page
  const [showAdminLogin, setShowAdminLogin] = useState(needsAdminAccess);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Register form state
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Admin login state
  const [adminPassword, setAdminPassword] = useState("");
  
  // PWA installation prompt
  const { showInstallPrompt, closePrompt } = usePWAInstall();
  const [showPWAPrompt, setShowPWAPrompt] = useState(false);
  
  useEffect(() => {
    // If redirected from admin page with adminAccess=required, show a message
    if (needsAdminAccess) {
      setShowAdminLogin(true);
    }
  }, [needsAdminAccess]);
  
  // If user is already logged in, redirect to home page
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signIn(loginEmail, loginPassword);
      // Show PWA install prompt after successful login
      setShowPWAPrompt(true);
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerPassword !== confirmPassword) {
      alert("As senhas não coincidem");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signUp(registerEmail, registerPassword, {
        first_name: firstName,
        last_name: lastName
      });
      
      // After sign up, switch to login tab
      setActiveTab("login");
      setLoginEmail(registerEmail);
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await adminLogin(adminPassword);
      // Show PWA install prompt after successful login
      setShowPWAPrompt(true);
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
                : "Entre na sua conta ou crie uma nova para começar"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="register">Registrar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
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
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="first-name" className="block text-sm font-medium mb-1">
                          Nome
                        </label>
                        <Input
                          id="first-name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="João"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="last-name" className="block text-sm font-medium mb-1">
                          Sobrenome
                        </label>
                        <Input
                          id="last-name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Silva"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="register-email" className="block text-sm font-medium mb-1">
                        Email
                      </label>
                      <Input
                        id="register-email"
                        type="email"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        placeholder="nome@exemplo.com"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="register-password" className="block text-sm font-medium mb-1">
                        Senha
                      </label>
                      <Input
                        id="register-password"
                        type="password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="confirm-password" className="block text-sm font-medium mb-1">
                        Confirmar Senha
                      </label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Criando conta..." : "Criar conta"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
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
        {showPWAPrompt && <PWAInstallPrompt onClose={() => setShowPWAPrompt(false)} />}
      </div>
    </div>
  );
};

export default Login;
