import React from 'react';

const Input = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  label, 
  error,
  className = ''
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-semibold text-text-muted px-1">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`
          w-full px-4 py-3 rounded-md border-2 bg-surface transition-all duration-200
          font-body text-text-main placeholder:text-gray-400
          ${error 
            ? 'border-error focus:ring-error/20' 
            : 'border-gray-100 focus:border-primary focus:ring-primary/10'}
          focus:outline-none focus:ring-4
        `}
      />
      {error && (
        <span className="text-xs font-medium text-error px-1">
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
