
import React from 'react';
import { Bell } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useProfile } from '@/hooks/useProfile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
  showBack?: boolean;
  onBackClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showSearch = false,
  showNotifications = true,
  showBack = false,
  onBackClick
}) => {
  const isMobile = useIsMobile();
  const { profile } = useProfile();
  const location = useLocation();
  
  // Check if we're on a workout detail page to hide the header
  const isWorkoutDetailPage = location.pathname.startsWith('/workout/');
  
  // Don't render anything on workout detail pages
  if (isWorkoutDetailPage) {
    return null;
  }
  
  const getInitials = () => {
    if (!profile) return 'U';
    
    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-fitness-dark/95 backdrop-blur-lg border-b border-fitness-darkGray/50">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {showBack && (
            <button 
              onClick={onBackClick} 
              className="p-2 rounded-full hover:bg-fitness-darkGray/60 active:scale-95 transition-all"
            >
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M19 12H5M5 12L12 19M5 12L12 5" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
          {!isMobile && title && (
            <h1 className="text-xl font-bold text-white">{title}</h1>
          )}
        </div>
        
        {/* App Logo for Mobile (centered) */}
        <div className={`absolute left-1/2 transform -translate-x-1/2 flex items-center ${!isMobile && 'hidden'}`}>
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/abe8bbb7-7e2f-4277-b5b0-1f923e57b6f7.png"
              alt="Mais Saúde Logo"
              className="h-10 w-10"
            />
            <span className="font-extrabold text-xl text-white">Mais Saúde</span>
          </Link>
        </div>

        {/* App Logo for Desktop (left aligned) */}
        {!isMobile && (
          <div className="flex-1 flex justify-center">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/abe8bbb7-7e2f-4277-b5b0-1f923e57b6f7.png"
                alt="Mais Saúde Logo"
                className="h-10 w-10"
              />
              <span className="font-extrabold text-xl text-white">Mais Saúde</span>
            </Link>
          </div>
        )}

        <div className="flex items-center gap-4">
          {showNotifications && (
            <Link to="/notifications" className="p-2 rounded-full hover:bg-fitness-darkGray/60 active:scale-95 transition-all text-white">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-fitness-green rounded-full"></span>
            </Link>
          )}
          
          {/* Profile Icon */}
          <Link 
            to="/profile" 
            className="p-1 rounded-full hover:bg-fitness-darkGray/60 active:scale-95 transition-all"
          >
            <Avatar className="h-8 w-8 border-2 border-fitness-green">
              <AvatarImage 
                src={profile?.avatar_url || ''} 
                alt={`${profile?.first_name || 'Usuário'}'s profile`} 
              />
              <AvatarFallback className="bg-fitness-dark text-white">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
