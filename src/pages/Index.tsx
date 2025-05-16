import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Dumbbell, Clock, Activity, MapPin, ChevronRight } from 'lucide-react';
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

const Index = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { data: workouts, isLoading } = useWorkouts();
  
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
    <div className="space-y-6 pb-16">
      {/* Seção de Boas-vindas */}
      <section className="text-center mb-8 pt-4">
        <h1 className="text-3xl md:text-4xl font-bold text-fitness-orange mb-2">
          {greeting}, {profile?.first_name || 'Atleta'}!
        </h1>
        <p className="text-xl text-gray-200">
          Seus planos personalizados estão prontos
        </p>
      </section>
      
      {/* Card Principal de Treino */}
      <section className="mb-8">
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
              
              {/* Não exibir os parâmetros dias, duração e condição - escondido conforme solicitado */}
              
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
      <section>
        <h2 className="text-xl font-bold mb-4">Minha Academia</h2>
        
        <Card className="bg-fitness-darkGray border-none text-white">
          <CardContent className="p-4">
            <Link 
              to="/find-gym" 
              className="flex items-center justify-between p-3 hover:bg-fitness-dark rounded-lg transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="bg-fitness-orange h-10 w-10 rounded-full flex items-center justify-center">
                  <MapPin className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-bold">Encontrar Minha Academia</h3>
                  <p className="text-sm text-gray-300">Obtenha treinos com base na sua academia</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-300" />
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Index;
