
import React from 'react';
import { Bell, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {showBack && (
            <button 
              onClick={onBackClick} 
              className="p-2 rounded-full hover:bg-muted"
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
          {title && <h1 className="text-xl font-bold">{title}</h1>}
        </div>

        <div className="flex items-center gap-4">
          {showSearch && (
            <Link to="/search" className="p-2 rounded-full hover:bg-muted">
              <Search className="h-5 w-5" />
            </Link>
          )}
          {showNotifications && (
            <Link to="/notifications" className="p-2 rounded-full hover:bg-muted">
              <Bell className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
