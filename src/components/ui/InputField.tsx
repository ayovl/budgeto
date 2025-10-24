import React from 'react';

interface InputFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'date';
  placeholder?: string;
  prefix?: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  prefix,
  min,
  max,
  step,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={`w-full px-3 ${prefix ? 'pl-7' : ''} py-2 bg-gray-900 border-2 border-gray-700 text-white rounded-lg focus:border-blue-500 focus:outline-none transition-colors placeholder:text-gray-500`}
        />
      </div>
    </div>
  );
};
