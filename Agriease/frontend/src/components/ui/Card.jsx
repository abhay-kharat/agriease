import React from 'react';

const Card = ({ children, className = '', hover = true }) => {
  return (
    <div className={`
      bg-surface rounded-md p-6 
      border border-gray-100/50
      shadow-soft
      ${hover ? 'transition-all duration-300 hover:shadow-premium hover:-translate-y-1' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Card;
