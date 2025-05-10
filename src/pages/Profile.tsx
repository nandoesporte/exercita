import React, { useRef, useState } from 'react';
import { 
  User, Settings, Calendar, Clock, Heart, LogOut,
  CreditCard, HelpCircle, Bell, UserPlus, ChevronRight, Camera
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Profile = () => {
  const { profile, isLoading, uploadProfileImage } = useProfile();
  const { signOut, user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImageHovered, setIsImageHovered] = useState(false);
  
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return format(date, 'MMMM yyyy');
  };

  const userData = {
    name: profile?.first_name && profile?.last_name 
      ? `${profile.first_name} ${profile.last_name}` 
      : user?.email || 'User',
    email: user?.email || '',
    avatar: profile?.avatar_url || 'https://randomuser.me/api/portraits/men/32.jpg',
    memberSince: user?.created_at 
      ? formatDate(new Date(user.created_at)) 
      : 'Unknown',
    workoutsCompleted: 0, // This could be implemented with a count query
    favoriteWorkout: 'Unknown', // This could be implemented with a query
  };
  
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, or GIF)');
      return;
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    // Upload the image
    uploadProfileImage(file);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fitness-orange"></div>
      </div>
    );
  }

  return (
    <main className="container">
      <section className="mobile-section">
        {/* User Info */}
        <div className="flex items-center mb-8">
          <div 
            className="relative mr-4"
            onMouseEnter={() => setIsImageHovered(true)}
            onMouseLeave={() => setIsImageHovered(false)}
          >
            <Avatar 
              className="h-20 w-20 cursor-pointer border-2 border-fitness-orange"
              onClick={handleImageClick}
            >
              <AvatarImage src={userData.avatar} alt={userData.name} className="object-cover" />
              <AvatarFallback className="bg-fitness-darkGray text-xl">
                {userData.name.substring(0, 1)}
              </AvatarFallback>
            </Avatar>
            
            {isImageHovered && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full"
                onClick={handleImageClick}
              >
                <Camera className="text-white h-6 w-6" />
              </div>
            )}
            
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          
          <div>
            <h2 className="text-xl font-bold">{userData.name}</h2>
            <p className="text-muted-foreground">{userData.email}</p>
            <p className="text-sm mt-1">Membro desde {userData.memberSince}</p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="fitness-card p-4 text-center bg-fitness-darkGray shadow-lg">
            <div className="text-2xl font-bold text-fitness-orange">
              {userData.workoutsCompleted}
            </div>
            <p className="text-sm text-gray-300">Treinos completados</p>
          </div>
          <div className="fitness-card p-4 text-center bg-fitness-darkGray shadow-lg">
            <div className="text-2xl font-bold text-fitness-orange">
              {profile?.weight ? `${profile?.weight} kg` : 'N/A'}
            </div>
            <p className="text-sm text-gray-300">Peso atual</p>
          </div>
        </div>
        
        {/* Menu Items */}
        <div className="space-y-2 rounded-xl overflow-hidden bg-fitness-darkGray divide-y divide-gray-700/50">
          <Link
            to="/account"
            className="flex items-center justify-between px-4 py-3.5 hover:bg-fitness-dark/50 active:bg-fitness-dark transition-colors"
          >
            <div className="flex items-center">
              <User size={20} className="mr-3 text-fitness-orange" />
              <span>Informações da Conta</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </Link>
          
          <Link
            to="/settings"
            className="flex items-center justify-between px-4 py-3.5 hover:bg-fitness-dark/50 active:bg-fitness-dark transition-colors"
          >
            <div className="flex items-center">
              <Settings size={20} className="mr-3 text-fitness-orange" />
              <span>Configurações</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </Link>
          
          <Link
            to="/workout-history"
            className="flex items-center justify-between px-4 py-3.5 hover:bg-fitness-dark/50 active:bg-fitness-dark transition-colors"
          >
            <div className="flex items-center">
              <Calendar size={20} className="mr-3 text-fitness-orange" />
              <span>Histórico de Treinos</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </Link>
          
          <Link
            to="/health-stats"
            className="flex items-center justify-between px-4 py-3.5 hover:bg-fitness-dark/50 active:bg-fitness-dark transition-colors"
          >
            <div className="flex items-center">
              <Heart size={20} className="mr-3 text-fitness-orange" />
              <span>Estatísticas de Saúde</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </Link>
          
          <Link
            to="/reminders"
            className="flex items-center justify-between px-4 py-3.5 hover:bg-fitness-dark/50 active:bg-fitness-dark transition-colors"
          >
            <div className="flex items-center">
              <Clock size={20} className="mr-3 text-fitness-orange" />
              <span>Lembretes</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </Link>
          
          <Link
            to="/notifications"
            className="flex items-center justify-between px-4 py-3.5 hover:bg-fitness-dark/50 active:bg-fitness-dark transition-colors"
          >
            <div className="flex items-center">
              <Bell size={20} className="mr-3 text-fitness-orange" />
              <span>Preferências de Notificações</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </Link>
          
          <Link
            to="/payment"
            className="flex items-center justify-between px-4 py-3.5 hover:bg-fitness-dark/50 active:bg-fitness-dark transition-colors"
          >
            <div className="flex items-center">
              <CreditCard size={20} className="mr-3 text-fitness-orange" />
              <span>Métodos de Pagamento</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </Link>
          
          <Link
            to="/invite"
            className="flex items-center justify-between px-4 py-3.5 hover:bg-fitness-dark/50 active:bg-fitness-dark transition-colors"
          >
            <div className="flex items-center">
              <UserPlus size={20} className="mr-3 text-fitness-orange" />
              <span>Convidar Amigos</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </Link>
          
          <Link
            to="/help"
            className="flex items-center justify-between px-4 py-3.5 hover:bg-fitness-dark/50 active:bg-fitness-dark transition-colors"
          >
            <div className="flex items-center">
              <HelpCircle size={20} className="mr-3 text-fitness-orange" />
              <span>Central de Ajuda</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </Link>
          
          <button
            onClick={signOut}
            className="w-full flex items-center px-4 py-4 text-red-400 hover:bg-red-900/20 active:bg-red-900/30 transition-colors mt-4"
          >
            <LogOut size={20} className="mr-3" />
            <span>Sair</span>
          </button>
        </div>
      </section>
    </main>
  );
};

export default Profile;
