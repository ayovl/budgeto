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
    blue: 'border-blue-300 bg-blue-50/50',
    orange: 'border-orange-300 bg-orange-50/50',
    green: 'border-green-300 bg-green-50/50',
    purple: 'border-purple-300 bg-purple-50/50',
  };

  const titleColorClasses = {
    blue: 'text-blue-700',
    orange: 'text-orange-700',
    green: 'text-green-700',
    purple: 'text-purple-700',
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
