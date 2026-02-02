import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled,
    className = '',
    ...props
}) => {

    const baseStyles = "inline-flex items-center justify-center font-outfit font-bold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 gpu-accelerated";

    const variants = {
        primary: "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 glow-hover",
        secondary: "bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-900/20",
        outline: "border-2 border-gray-200 hover:border-orange-500 text-gray-700 hover:text-orange-500 bg-transparent",
        ghost: "bg-transparent hover:bg-orange-50 text-gray-600 hover:text-orange-600",
        danger: "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-5 py-2.5 text-sm",
        lg: "px-8 py-3 text-base w-full sm:w-auto"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
};

export default Button;
