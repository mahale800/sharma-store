import React from 'react';

const Card = ({
    children,
    className = '',
    hoverable = false,
    padded = true,
    onClick,
    ...props
}) => {
    return (
        <div
            className={`
                bg-white/80 backdrop-blur-md 
                border border-white/60 
                rounded-3xl 
                shadow-sm 
                transition-all duration-300
                ${hoverable ? 'hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10 cursor-pointer' : ''}
                ${padded ? 'p-6' : ''}
                ${className}
            `}
            onClick={onClick}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
