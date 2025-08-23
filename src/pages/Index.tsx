import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Dumbbell, Clock, Activity, MapPin, ChevronRight, Camera, ShoppingBag, Settings, Calendar, MessageCircle } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { useRecommendedWorkoutsForUser } from '@/hooks/useWorkouts';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { WorkoutCard } from '@/components/ui/workout-card';
import { useStore } from '@/hooks/useStore';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Index = () => {
  const { user, isAdmin } = useAuth();
  const { profile } = useProfile();
  const userId = user?.id;
  const { data: userWorkouts, isLoading } = useRecommendedWorkoutsForUser(userId);
  const { data: workoutHistory } = useWorkoutHistory();
  const { featuredProducts, isLoadingFeaturedProducts } = useStore();
  
  // Debug logs
  console.log('Current userId:', userId);
  console.log('User workouts on home page:', userWorkouts);
  
  // Verificar se o usuário já tem algum treino atribuído a ele
  const hasAssignedWorkout = userWorkouts && userWorkouts.length > 0;
  
  // Obter o treino recomendado específico para este usuário - use o primeiro disponível
  const recommendedWorkout = userWorkouts && userWorkouts.length > 0 
    ? userWorkouts[0] 
    : null;
  
  // Horário atual para saudação personalizada
  const hour = new Date().getHours();
  let greeting = "Olá";
  if (hour < 12) greeting = "Bom dia";
  else if (hour < 18) greeting = "Boa tarde";
  else greeting = "Boa noite";

  // Determine target muscles based on the workout
  const targetMuscles = recommendedWorkout?.category?.name || "Corpo completo";
  
  // Add timestamp to force avatar refresh
  const [avatarTimestamp, setAvatarTimestamp] = useState(() => Date.now());
  
  // Update timestamp when profile changes
  useEffect(() => {
    if (profile?.avatar_url) {
      setAvatarTimestamp(Date.now());
    }
  }, [profile?.avatar_url]);
  
  // Function to get user initials for the avatar fallback
  const getInitials = () => {
    if (!profile) return 'U';
    
    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };
  
  return (
    <div className="home-page">
      {/* Profile Avatar Section */}
      <section className="flex justify-center mb-4 pt-6">
        <Link to="/profile">
          <Avatar className="h-24 w-24 border-4 border-fitness-green cursor-pointer hover:border-fitness-orange transition-all duration-300">
            <AvatarImage 
              src={profile?.avatar_url ? `${profile.avatar_url}?t=${avatarTimestamp}` : undefined} 
              alt={`${profile?.first_name || 'Usuário'}'s profile`} 
              onError={(e) => {
                console.error('Error loading profile image on index page:', e);
                // Fallback to initials on error
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <AvatarFallback className="bg-fitness-dark text-white text-3xl">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Link>
      </section>
      
      {/* Seção de Boas-vindas */}
      <section className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-fitness-orange mb-2">
          {greeting}, {profile?.first_name || 'Atleta'}!
        </h1>
        <p className="text-xl text-gray-200">
          {hasAssignedWorkout 
            ? 'Seus planos personalizados estão prontos' 
            : 'Agende uma consultoria para começar'}
        </p>
        
        {/* Admin button - only visible for admin users on mobile */}
        {isAdmin && (
          <div className="mt-4 md:hidden">
            <Button 
              variant="outline" 
              className="bg-fitness-dark border-fitness-orange text-fitness-orange hover:bg-fitness-darkGray"
              asChild
            >
              <Link to="/admin">
                <Settings className="mr-2 h-5 w-5" />
                Área do Personal
              </Link>
            </Button>
          </div>
        )}
      </section>
      
      {/* Card Principal de Treino ou Botão Agendar Consultoria */}
      <section className="mb-8">
        {hasAssignedWorkout ? (
          // Card com treino recomendado - exibido quando o usuário tem treino atribuído
          <Card className="bg-fitness-darkGray border-none text-white">
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Seletor de Academia */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold">Seu Treino</h2>
                </div>
                
                <div className="flex items-center">
                  <span className="bg-fitness-orange text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold flex items-center">
                    <Activity size={14} className="mr-1 sm:mr-1" /> ATIVO
                  </span>
                </div>
              </div>
              
              {/* Detalhes do Treino */}
              <div>
                <h3 className="text-lg sm:text-xl font-bold">
                  {recommendedWorkout?.title || 'Treino Personalizado'}
                </h3>
                <div className="flex justify-between mt-1">
                  <Link to="/workouts" className="text-xs sm:text-sm text-gray-300 hover:text-fitness-orange">
                    Ver todos os treinos <span>&gt;</span>
                  </Link>
                </div>
                
                {/* Áreas Alvo */}
                <div className="mt-4">
                  <div className="bg-fitness-dark p-3 sm:p-4 rounded-md">
                    <div className="mb-2">
                      <span className="font-bold text-sm sm:text-base">Alvo</span>
                      <span className="ml-2 text-gray-300 text-sm sm:text-base">{targetMuscles}</span>
                    </div>
                    
                    {/* Estatísticas do Treino - usando dados reais */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4">
                      <div className="text-center">
                        <div className="flex justify-center mb-1 sm:mb-2">
                          <Dumbbell size={20} className="text-gray-300 sm:w-7 sm:h-7" />
                        </div>
                        <div className="text-sm sm:text-lg font-bold">
                          {recommendedWorkout?.workout_exercises?.length || 0}
                        </div>
                        <div className="text-xs text-gray-400">exercícios</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex justify-center mb-1 sm:mb-2">
                          <Clock size={20} className="text-gray-300 sm:w-7 sm:h-7" />
                        </div>
                        <div className="text-sm sm:text-lg font-bold">
                          {recommendedWorkout?.duration || 0}
                        </div>
                        <div className="text-xs text-gray-400">minutos</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex justify-center mb-1 sm:mb-2">
                          <Activity size={20} className="text-gray-300 sm:w-7 sm:h-7" />
                        </div>
                        <div className="text-sm sm:text-lg font-bold">
                          {recommendedWorkout?.calories || 0}
                        </div>
                        <div className="text-xs text-gray-400">kcal</div>
                      </div>
                    </div>
                    
                    {/* Botão Iniciar Treino */}
                    <Button 
                      className="w-full mt-4 sm:mt-6 bg-fitness-orange hover:bg-fitness-orange/90 text-white text-sm sm:text-lg font-semibold h-12 sm:h-14 rounded-xl"
                      asChild
                      disabled={isLoading || !recommendedWorkout}
                    >
                      <Link to={`/workout/${recommendedWorkout?.id || ''}`}>
                        <Dumbbell className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        {isLoading ? 'Carregando...' : 'Iniciar Treino'}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Card para agendar consultoria - exibido quando não há treinos atribuídos
          <Card className="bg-fitness-darkGray border-none text-white">
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                <h2 className="text-xl sm:text-2xl font-bold">Primeira Consultoria</h2>
                
                <div className="flex items-center">
                  <span className="bg-fitness-orange text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold flex items-center">
                    <Activity size={14} className="mr-1" /> GRATUITO
                  </span>
                </div>
              </div>
              
              <div className="bg-fitness-dark p-4 sm:p-6 rounded-md text-center">
                <div className="mb-4 sm:mb-6">
                  <div className="mx-auto bg-fitness-darkGray/50 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                    <Calendar size={28} className="text-fitness-orange sm:w-9 sm:h-9" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2">Você ainda não tem um treino personalizado</h3>
                  <p className="text-gray-300 text-sm sm:text-base">
                    Agende uma consultoria com nossos especialistas e receba um plano de treino personalizado para suas necessidades.
                  </p>
                </div>
                
                <Button 
                  className="w-full mt-3 sm:mt-4 bg-fitness-orange hover:bg-fitness-orange/90 text-white text-sm sm:text-lg font-semibold h-12 sm:h-14 rounded-xl"
                  asChild
                >
                  <Link to="/schedule">
                    <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Agendar Consultoria
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </section>
      
      {/* Seção de Treinos Recomendados */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Treinos Recomendados</h2>
          <Link to="/workouts" className="text-fitness-orange text-sm">Ver todos</Link>
        </div>
        
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="py-2">
            {hasAssignedWorkout ? (
              userWorkouts?.map((workout) => (
                <CarouselItem key={workout.id} className="md:basis-1/2 lg:basis-1/3">
                  <WorkoutCard 
                    id={workout.id}
                    title={workout.title}
                    image={workout.image_url || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop"}
                    duration={`${workout.duration || 30} min`}
                    level={workout.level === 'beginner' ? 'Iniciante' : workout.level === 'intermediate' ? 'Intermediário' : 'Avançado'}
                    calories={workout.calories}
                    daysOfWeek={workout.days_of_week}
                  />
                </CarouselItem>
              ))
            ) : (
              <>
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <div className="bg-fitness-darkGray/30 rounded-xl p-8 text-center">
                    <p className="text-gray-300">Nenhum treino disponível. Agende uma consultoria.</p>
                  </div>
                </CarouselItem>
              </>
            )}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </section>
      
      {/* Nova Seção: Consultoria Online */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Consultoria Online</h2>
          <Link to="/schedule" className="text-fitness-orange text-sm">Ver detalhes</Link>
        </div>
        
        <Card className="bg-gradient-to-r from-fitness-dark to-fitness-darkGray border-none text-white overflow-hidden">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-6 flex flex-col justify-center space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <MessageCircle className="h-5 w-5 text-fitness-green" />
                  <h3 className="text-xl font-bold">Agende uma Consultoria Online</h3>
                </div>
                
                <p className="text-gray-300">
                  Receba orientação personalizada para seus treinos e objetivos fitness diretamente de um personal trainer especializado.
                </p>
                
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="mt-1 bg-fitness-orange/20 p-1 rounded-full">
                      <Activity className="h-4 w-4 text-fitness-orange" />
                    </div>
                    <span className="text-sm text-gray-300">Avaliação detalhada do seu perfil e objetivos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 bg-fitness-orange/20 p-1 rounded-full">
                      <Calendar className="h-4 w-4 text-fitness-orange" />
                    </div>
                    <span className="text-sm text-gray-300">Escolha o dia e horário que melhor se adapta à sua agenda</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 bg-fitness-orange/20 p-1 rounded-full">
                      <Dumbbell className="h-4 w-4 text-fitness-orange" />
                    </div>
                    <span className="text-sm text-gray-300">Receba um plano de treino personalizado</span>
                  </li>
                </ul>
                
                <Button 
                  asChild 
                  className="mt-4 bg-fitness-orange hover:bg-fitness-orange/90 text-white font-medium"
                >
                  <Link to="/schedule" className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Agendar Consultoria
                  </Link>
                </Button>
              </div>
              
              <div className="bg-fitness-darkGray/50 hidden md:block">
                <div className="h-full w-full relative">
                  <img 
                    src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=800&auto=format&fit=crop" 
                    alt="Consultoria online" 
                    className="w-full h-full object-cover opacity-70"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-fitness-dark/80 to-transparent"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
      
      {/* Minha Academia Seção */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Minha Academia</h2>
        
        <Card className="bg-fitness-darkGray border-none text-white">
          <CardContent className="p-4">
            <Link 
              to="/gym-photos" 
              className="flex items-center justify-between p-3 hover:bg-fitness-dark rounded-lg transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="bg-fitness-orange h-10 w-10 rounded-full flex items-center justify-center">
                  <Camera className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-bold">Envie fotos da sua academia</h3>
                  <p className="text-sm text-gray-300">Ajude o personal trainer a analisar seu ambiente</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-300" />
            </Link>
          </CardContent>
        </Card>
      </section>
      
      {/* Produtos em Destaque */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Produtos em Destaque</h2>
          <Link to="/store" className="text-fitness-orange text-sm flex items-center gap-1">
            <span>Visitar loja</span>
            <ChevronRight size={16} />
          </Link>
        </div>
        
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="py-2">
            {isLoadingFeaturedProducts ? (
              // Placeholders de carregamento - dois por linha no mobile
              [...Array(4)].map((_, index) => (
                <CarouselItem key={`loading-${index}`} className="basis-1/2 md:basis-1/2 lg:basis-1/3">
                  <div className="h-[240px] md:h-[280px] rounded-xl bg-fitness-darkGray/40 animate-pulse"></div>
                </CarouselItem>
              ))
            ) : featuredProducts && featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <CarouselItem key={product.id} className="basis-1/2 md:basis-1/2 lg:basis-1/3">
                  <Link to={`/store/${product.id}`} className="block">
                    <div className="bg-white bg-opacity-5 rounded-xl overflow-hidden h-[240px] md:h-[280px] relative group hover:shadow-lg transition-all duration-300">
                      {/* Imagem do produto */}
                      <div className="h-[140px] md:h-[180px] overflow-hidden">
                        <img 
                          src={product.image_url || "https://via.placeholder.com/300x180?text=Produto"} 
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      
                      {/* Informações do produto */}
                      <div className="p-2 md:p-4 relative">
                        <h3 className="font-bold text-sm md:text-lg text-white truncate">{product.name}</h3>
                        <p className="text-gray-300 text-xs md:text-sm line-clamp-1 md:line-clamp-2 h-[20px] md:h-[40px]">{product.description}</p>
                        
                        <div className="flex items-center justify-between mt-1 md:mt-2">
                          <span className="text-fitness-green font-bold text-sm md:text-base">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                          </span>
                          <span className="bg-fitness-darkGray/30 p-1 md:p-1.5 rounded-full">
                            <ShoppingBag size={16} className="text-fitness-orange" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              ))
            ) : (
              // Sem produtos
              <CarouselItem className="basis-full">
                <div className="bg-fitness-darkGray/30 rounded-xl p-8 text-center">
                  <p className="text-gray-300">Nenhum produto disponível no momento</p>
                </div>
              </CarouselItem>
            )}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </section>
    </div>
  );
};

export default Index;
