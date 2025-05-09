
import React from 'react';
import { Link } from 'react-router-dom';

interface CategoryCardProps {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
  color?: string;
}

export function CategoryCard({ id, name, icon, count, color = '#00CB7E' }: CategoryCardProps) {
  return (
    <Link
      to={`/category/${id}`}
      className="fitness-card flex items-center gap-4 p-4 group"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-foreground group-hover:text-fitness-green transition-colors">{name}</h3>
        <p className="text-sm text-muted-foreground">{count} exercises</p>
      </div>
    </Link>
  );
}
