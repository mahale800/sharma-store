import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
    children,
    variant = 'primary', // primary, secondary, outline, ghost, danger
    size = 'md', // sm, md, lg, icon
    className = '',
    isLoading = false,
    disabled = false,
    onClick,
    type = 'button',
    ...props
}) => {

    // Base styles
    const baseStyles = "relative inline-flex items-center justify-center font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 select-none";

    // Variants
    const variants = {
        primary: "bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 border border-transparent focus:ring-orange-500",
        secondary: "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm focus:ring-gray-200",
        outline: "bg-transparent border-2 border-orange-600 text-orange-600 hover:bg-orange-50 focus:ring-orange-500",
        ghost: "bg-transparent text-gray-600 hover:text-orange-600 hover:bg-orange-50 border border-transparent focus:ring-gray-200",
        danger: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30 border border-transparent focus:ring-red-500",
        white: "bg-white text-gray-900 shadow-md hover:bg-gray-50 border border-transparent"
    };

    // Sizes
    const sizes = {
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-6 text-sm",
        lg: "h-14 px-8 text-base",
        icon: "h-11 w-11 p-0",
        "icon-md": "h-11 w-11 p-0",
        "icon-sm": "h-9 w-9 p-0",
        "icon-lg": "h-14 w-14 p-0"
    };

    return (
        <button
            type={type}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            onClick={onClick}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    <span>Loading...</span>
                </>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;
