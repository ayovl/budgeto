import React from 'react';

interface SectionContainerProps {
  title: string;
  color?: 'blue' | 'orange' | 'green' | 'purple';
  children: React.ReactNode;
  className?: string;
}

export const SectionContainer: React.FC<SectionContainerProps> = ({
  title,
  color = 'blue',
  children,
  className = '',
}) => {
  const colorClasses = {
    blue: 'border-blue-500/30 bg-gray-800/50',
    orange: 'border-orange-500/30 bg-gray-800/50',
    green: 'border-green-500/30 bg-gray-800/50',
    purple: 'border-purple-500/30 bg-gray-800/50',
  };

  const titleColorClasses = {
    blue: 'text-blue-400',
    orange: 'text-orange-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
  };

  return (
    <div className={`border-2 ${colorClasses[color]} rounded-2xl p-4 sm:p-6 ${className}`}>
      <h2 className={`text-xl sm:text-2xl font-bold ${titleColorClasses[color]} mb-4`}>
        {title}
      </h2>
      {children}
    </div>
  );
};
