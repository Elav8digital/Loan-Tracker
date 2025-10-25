
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseClasses = "px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-transform transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2";
    
    const variantClasses = {
        primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary',
        secondary: 'bg-secondary text-white hover:bg-secondary/90 focus:ring-secondary',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    };

    return (
        <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};

export default Button;
