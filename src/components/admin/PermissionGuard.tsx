import React from 'react';

interface PermissionGuardProps {
  children: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ children }) => {
  // Simplified for physiotherapy app - always allow access
  return <>{children}</>;
};

export { PermissionGuard };