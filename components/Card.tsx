
import React, { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`bg-card-light dark:bg-card-dark border border-primary/20 rounded-lg shadow-md hover:shadow-accent/30 transition-shadow duration-300 p-6 ${className}`}>
            {children}
        </div>
    );
};

export default Card;
