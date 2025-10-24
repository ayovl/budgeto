import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
}) => {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30',
    success: 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/30',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
};
