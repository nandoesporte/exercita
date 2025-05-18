import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Dumbbell, Clock, Activity, MapPin, ChevronRight, Camera, ShoppingBag, Settings, Calendar } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { useWorkouts } from '@/hooks/useWorkouts';
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

const Index = () => {
  const { user, isAdmin } = useAuth();
  const { profile } = useProfile();
  const { data: workouts, isLoading } = useWorkouts();
  const { data: workoutHistory } = useWorkoutHistory();
  const { featuredProducts, isLoadingFeaturedProducts } = useStore();
  
  // Verificar se o usuário já tem algum treino atribuído a ele
  const hasAssignedWorkout = workoutHistory && workoutHistory.length > 0;
  
  // Obter o treino recomendado com base no nível de condicionamento físico do usuário ou no primeiro treino em destaque
  const recommendedWorkout = workouts?.find(workout => 
    workout.level === (profile?.fitness_goal?.toLowerCase() || 'intermediate')
  ) || workouts?.[0];
  
  // Horário atual para saudação personalizada
  const hour = new Date().getHours();
  let greeting = "Olá";
  if (hour < 12) greeting = "Bom dia";
  else if (hour < 18) greeting = "Boa tarde";
  else greeting = "Boa noite";

  // Determine target muscles based on the workout
  const targetMuscles = recommendedWorkout?.category?.name || "Corpo completo";
  
  return (
    <div className="home-page">
      {/* Seção de Boas-vindas */}
      <section className="text-center mb-8 pt-4">
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
            <CardContent className="p-6 space-y-6">
              {/* Seletor de Academia */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">Academia</h2>
                </div>
                
                <div className="flex items-center">
                  <span className="bg-fitness-orange text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                    <Activity size={16} className="mr-1" /> PREMIUM
                  </span>
                </div>
              </div>
              
              {/* Detalhes do Treino */}
              <div>
                <h3 className="text-xl font-bold">
                  {recommendedWorkout?.title || 'Treino Personalizado'}
                </h3>
                <div className="flex justify-between mt-1">
                  <Link to="/workouts" className="text-sm text-gray-300 hover:text-fitness-orange">
                    Ver mais <span>&gt;</span>
                  </Link>
                </div>
                
                {/* Áreas Alvo */}
                <div className="mt-4">
                  <div className="bg-fitness-dark p-4 rounded-md">
                    <div className="mb-2">
                      <span className="font-bold">Alvo</span>
                      <span className="ml-2 text-gray-300">{targetMuscles}</span>
                    </div>
                    
                    {/* Estatísticas do Treino - usando dados reais */}
                    <div className="flex justify-between mt-4">
                      <div className="text-center">
                        <div className="flex justify-center mb-2">
                          <Dumbbell size={28} className="text-gray-300" />
                        </div>
                        <div className="text-lg font-bold">
                          {recommendedWorkout?.workout_exercises?.length || 0} exercícios
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex justify-center mb-2">
                          <Clock size={28} className="text-gray-300" />
                        </div>
                        <div className="text-lg font-bold">
                          {recommendedWorkout?.duration || 0} min
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex justify-center mb-2">
                          <Activity size={28} className="text-gray-300" />
                        </div>
                        <div className="text-lg font-bold">
                          {recommendedWorkout?.calories || 0} kcal
                        </div>
                      </div>
                    </div>
                    
                    {/* Botão Iniciar Treino */}
                    <Button 
                      className="w-full mt-6 bg-fitness-orange hover:bg-fitness-orange/90 text-white text-lg font-semibold h-14 rounded-xl"
                      asChild
                      disabled={isLoading || !recommendedWorkout}
                    >
                      <Link to={`/workout/${recommendedWorkout?.id || ''}`}>
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
            <CardContent className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Primeira Consultoria</h2>
                
                <div className="flex items-center">
                  <span className="bg-fitness-orange text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                    <Activity size={16} className="mr-1" /> GRATUITO
                  </span>
                </div>
              </div>
              
              <div className="bg-fitness-dark p-6 rounded-md text-center">
                <div className="mb-6">
                  <div className="mx-auto bg-fitness-darkGray/50 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                    <Calendar size={36} className="text-fitness-orange" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Você ainda não tem um treino personalizado</h3>
                  <p className="text-gray-300">
                    Agende uma consultoria com nossos especialistas e receba um plano de treino personalizado para suas necessidades.
                  </p>
                </div>
                
                <Button 
                  className="w-full mt-4 bg-fitness-orange hover:bg-fitness-orange/90 text-white text-lg font-semibold h-14 rounded-xl"
                  asChild
                >
                  <Link to="/schedule">
                    <Calendar className="mr-2 h-5 w-5" />
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
            {workouts?.slice(0, 5).map((workout) => (
              <CarouselItem key={workout.id} className="md:basis-1/2 lg:basis-1/3">
                <WorkoutCard 
                  id={workout.id}
                  title={workout.title}
                  image={workout.image_url || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop"}
                  duration={`${workout.duration || 30} min`}
                  level={workout.level === 'beginner' ? 'Iniciante' : workout.level === 'intermediate' ? 'Intermediário' : 'Avançado'}
                  calories={workout.calories}
                />
              </CarouselItem>
            ))}
            {(!workouts || workouts.length === 0) && (
              <>
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <WorkoutCard 
                    id="1"
                    title="Treino Full Body"
                    image="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop"
                    duration="45 min"
                    level="Iniciante"
                    calories={320}
                  />
                </CarouselItem>
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <WorkoutCard 
                    id="2"
                    title="HIIT Cardio"
                    image="https://images.unsplash.com/photo-1434682881908-b43d0467b798?q=80&w=1474&auto=format&fit=crop"
                    duration="30 min"
                    level="Intermediário"
                    calories={450}
                  />
                </CarouselItem>
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <WorkoutCard 
                    id="3"
                    title="Core e Abdômen"
                    image="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1470&auto=format&fit=crop"
                    duration="25 min"
                    level="Avançado"
                    calories={280}
                  />
                </CarouselItem>
              </>
            )}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
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
