import React from 'react';

interface ExercitaLogoProps {
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

export function ExercitaLogo({ 
  className = "h-10 w-10", 
  showText = false, 
  textClassName = "font-extrabold text-xl text-foreground" 
}: ExercitaLogoProps) {
  return (
    <div className="flex items-center gap-2">
      <img 
        src="/lovable-uploads/5771c69f-e35b-497b-a3f2-473c28b4fc44.png"
        alt="Exercita Logo"
        className={className}
      />
      {showText && (
        <span className={textClassName}>Exercita</span>
      )}
    </div>
  );
}