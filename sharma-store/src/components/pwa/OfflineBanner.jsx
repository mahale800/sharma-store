import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

const OfflineBanner = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (isOnline) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-red-500 text-white text-xs font-bold py-1 px-4 text-center shadow-md animate-in slide-in-from-top flex items-center justify-center gap-2">
            <WifiOff size={12} />
            You are offline. Some features may be unavailable.
        </div>
    );
};

export default OfflineBanner;
