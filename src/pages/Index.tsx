import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';

const Index = () => {
  const { user } = useAuth();
  const { profile, isLoading } = useProfile();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };
  
  const userName = profile?.first_name || user?.email?.split('@')[0] || 'Usuário';
  
  return (
    <div className="px-4 pb-8">
      {/* Centered Profile Picture Section */}
      <div className="flex flex-col items-center justify-center pt-6 pb-8">
        <Link to="/profile">
          <Avatar className="h-24 w-24 border-2 border-fitness-green cursor-pointer hover:scale-105 transition-transform duration-200">
            <AvatarImage 
              src={profile?.avatar_url || ''} 
              alt={`${userName}'s profile`}
              className="object-cover" 
            />
            <AvatarFallback className="bg-fitness-dark text-white text-2xl">
              {userName.substring(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white">
          {getGreeting()}, {userName}!
        </h1>
        <p className="text-gray-400 mt-2">
          Bem-vindo ao seu aplicativo de fitness
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-fitness-darkGray rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-fitness-green">Seu Progresso</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-400">Treinos esta semana</span>
                <span className="text-sm font-medium">3/5</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-fitness-green h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-400">Meta de peso</span>
                <span className="text-sm font-medium">70%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-fitness-orange h-2 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-400">Nutrição</span>
                <span className="text-sm font-medium">40%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-fitness-darkGray rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-fitness-green">Próximo Treino</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Treino:</span>
              <span className="font-medium">Treino de Peito</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Dia:</span>
              <span className="font-medium">Hoje</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Horário:</span>
              <span className="font-medium">18:00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Duração:</span>
              <span className="font-medium">45 minutos</span>
            </div>
            <div className="mt-4">
              <Link 
                to="/workout/1" 
                className="block w-full py-2 px-4 bg-fitness-green text-white rounded-lg text-center font-medium hover:bg-fitness-green/90 transition-colors"
              >
                Iniciar Treino
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-fitness-darkGray rounded-xl p-6 shadow-lg mb-8">
        <h2 className="text-xl font-bold mb-4 text-fitness-green">Dicas de Nutrição</h2>
        <div className="space-y-4">
          <div className="bg-fitness-dark/50 p-4 rounded-lg">
            <h3 className="font-medium mb-1">Hidratação</h3>
            <p className="text-sm text-gray-400">Lembre-se de beber pelo menos 2 litros de água por dia para manter-se hidratado.</p>
          </div>
          <div className="bg-fitness-dark/50 p-4 rounded-lg">
            <h3 className="font-medium mb-1">Proteínas</h3>
            <p className="text-sm text-gray-400">Consuma proteínas em todas as refeições para ajudar na recuperação muscular.</p>
          </div>
          <div className="bg-fitness-dark/50 p-4 rounded-lg">
            <h3 className="font-medium mb-1">Carboidratos</h3>
            <p className="text-sm text-gray-400">Priorize carboidratos complexos antes dos treinos para ter mais energia.</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Link 
          to="/schedule" 
          className="bg-fitness-darkGray rounded-xl p-6 text-center hover:bg-fitness-darkGray/80 transition-colors"
        >
          <div className="text-fitness-green text-3xl mb-2">📅</div>
          <h3 className="font-medium">Agendar Treino</h3>
        </Link>
        <Link 
          to="/history" 
          className="bg-fitness-darkGray rounded-xl p-6 text-center hover:bg-fitness-darkGray/80 transition-colors"
        >
          <div className="text-fitness-green text-3xl mb-2">📊</div>
          <h3 className="font-medium">Ver Histórico</h3>
        </Link>
      </div>
    </div>
  );
};

export default Index;
