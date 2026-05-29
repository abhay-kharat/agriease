import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  size = 'md', 
  className = '',
  disabled = false,
  loading = false
}) => {
  const baseStyles = "inline-flex items-center justify-center font-body font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-primary text-surface hover:bg-primary-light shadow-soft hover:shadow-premium",
    secondary: "bg-secondary text-surface hover:bg-secondary-light shadow-soft hover:shadow-premium",
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-surface",
    ghost: "text-primary hover:bg-surface-soft",
    danger: "bg-error text-surface hover:opacity-90",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm rounded-md",
    md: "px-6 py-3 text-base rounded-md",
    lg: "px-8 py-4 text-lg rounded-lg",
    full: "px-6 py-3 text-base rounded-full",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
};

export default Button;
