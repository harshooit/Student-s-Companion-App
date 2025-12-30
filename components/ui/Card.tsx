
import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, className = '' }: CardProps) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg ${className}`}
    >
      {children}
    </div>
  );
};

export const CardContent = ({ children, className = '' }: CardProps) => {
  return <div className={`p-4 sm:p-6 ${className}`}>{children}</div>;
};

export const CardHeader = ({ children, className = '' }: CardProps) => {
  return <div className={`p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 ${className}`}>{children}</div>;
};
