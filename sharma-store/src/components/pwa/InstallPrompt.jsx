import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI to notify the user they can add to home screen

            // Check if user has already dismissed it recently (optional optimization)
            const isDismissed = localStorage.getItem('pwa-install-dismissed');
            if (!isDismissed) {
                setShowPrompt(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        await deferredPrompt.userChoice;

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // Remember dismissal for a session or persistently
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom duration-500">
            <div className="bg-gray-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-gray-700/50">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl p-2 flex-shrink-0">
                        <img src="/pwa-192x192.png" alt="App Icon" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Install Sharma Store</h3>
                        <p className="text-gray-400 text-xs">Best experience, works offline</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleDismiss}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <button
                        onClick={handleInstallClick}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
                    >
                        <Download size={16} />
                        Install
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstallPrompt;
