
import React from 'react';
import { Bell, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

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

  return (
    <header className="sticky top-0 z-40 w-full bg-fitness-dark backdrop-blur-sm border-b border-fitness-darkGray/50">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {showBack && (
            <button 
              onClick={onBackClick} 
              className="p-2 rounded-full hover:bg-fitness-darkGray/60"
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
          {!isMobile && title && <h1 className="text-xl font-bold text-white">{title}</h1>}
        </div>
        
        {/* App Logo for Mobile (centered) */}
        <div className={`absolute left-1/2 transform -translate-x-1/2 flex items-center ${!isMobile && 'hidden'}`}>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-fitness-orange flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="font-bold text-xl text-white">Exercita</span>
          </Link>
        </div>

        {/* App Logo for Desktop (left aligned) */}
        {!isMobile && (
          <div className="flex-1 flex justify-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-fitness-orange flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="font-bold text-xl text-white">Exercita</span>
            </Link>
          </div>
        )}

        <div className="flex items-center gap-4">
          {showSearch && (
            <Link to="/search" className="p-2 rounded-full hover:bg-fitness-darkGray/60 text-white">
              <Search className="h-5 w-5" />
            </Link>
          )}
          {showNotifications && (
            <Link to="/notifications" className="p-2 rounded-full hover:bg-fitness-darkGray/60 text-white">
              <Bell className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
