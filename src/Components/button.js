import React from 'react';
import '../css/Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  onClick, 
  disabled = false, 
  type = 'button',
  className = '',
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  ...props 
}) => {
  const buttonClasses = [
    'reusable-btn',
    `btn-${variant}`,
    `btn-${size}`,
    disabled && 'btn-disabled',
    fullWidth && 'btn-full-width',
    className
  ].filter(Boolean).join(' ');

  return (
    <button 
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className="btn-icon btn-icon-left" />}
      <span className="btn-text">{children}</span>
      {Icon && iconPosition === 'right' && <Icon className="btn-icon btn-icon-right" />}
    </button>
  );
};

export default Button;