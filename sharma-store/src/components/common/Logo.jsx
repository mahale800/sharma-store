import React from 'react';

/**
 * Sharma Store Brand Logo
 * Concept: "The Signature S" - A stylized pen stroke 'S' representing stationery + signature quality.
 * 
 * @param {Object} props
 * @param {'full' | 'icon'} props.variant - 'full' (Icon + Text) or 'icon' (Icon only)
 * @param {'sm' | 'md' | 'lg' | 'xl' | '2xl'} props.size - Size of the logo
 * @param {'colored' | 'white' | 'dark'} props.color - Color theme
 * @param {string} props.className - Additional classes
 */
const Logo = ({ variant = 'full', size = 'md', color = 'colored', className = '' }) => {

    // Size Mapping
    const sizes = {
        sm: { icon: 'w-6 h-6', text: 'text-lg' },
        md: { icon: 'w-8 h-8', text: 'text-2xl' },
        lg: { icon: 'w-10 h-10', text: 'text-3xl' },
        xl: { icon: 'w-16 h-16', text: 'text-4xl' },
        '2xl': { icon: 'w-24 h-24', text: 'text-6xl' }
    };

    const currentSize = sizes[size] || sizes.md;

    // Color Mapping
    const colors = {
        colored: { icon: '#ea580c', text: 'text-slate-900', bg: 'bg-orange-50', svgText: 'white' },
        white: { icon: '#ffffff', text: 'text-white', bg: 'bg-white/10', svgText: '#ea580c' },
        dark: { icon: '#1e293b', text: 'text-slate-900', bg: 'bg-slate-100', svgText: 'white' }
    };

    const currentColor = colors[color] || colors.colored;

    return (
        <div className={`inline-flex items-center gap-3 ${className} select-none group`}>
            {/* Symbol: The Signature S */}
            <div className={`relative flex items-center justify-center rounded-xl md:rounded-2xl transition-transform duration-300 group-hover:scale-105 ${currentColor.bg} p-1 aspect-square ${currentSize.icon.replace('w-', 'w-auto h-')}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
                    <circle cx="50" cy="50" r="50" fill={currentColor.icon} />
                    <text x="50" y="72" fontFamily="Arial, sans-serif" fontSize="70" fontWeight="bold" fill={currentColor.svgText} textAnchor="middle">S</text>
                </svg>
            </div>

            {/* Text: Wordmark */}
            {variant === 'full' && (
                <div className="flex flex-col justify-center leading-none">
                    <span className={`font-['Outfit'] font-black tracking-tight whitespace-nowrap ${currentSize.text} ${currentColor.text}`}>
                        Sharma Store
                    </span>
                </div>
            )}
        </div>
    );
};

export default Logo;
