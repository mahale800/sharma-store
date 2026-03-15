import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

/**
 * Premium Splash Screen
 * Shows strictly on first session load to reinforce brand identity.
 */
const SplashScreen = ({ onComplete }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Run animation sequence then hide
        const timer = setTimeout(() => {
            setIsVisible(false);
            if (onComplete) setTimeout(onComplete, 500); // Allow exit anim to finish
        }, 2500);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-slate-50"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                    {/* Background Subtle Mesh */}
                    <div className="absolute inset-0 opacity-40 overflow-hidden pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-200/30 rounded-full blur-3xl animate-pulse"></div>
                    </div>

                    <div className="relative z-10 flex flex-col items-center max-w-[40%]">
                        {/* Logo Anim */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="mb-6"
                        >
                            <Logo variant="icon" size="2xl" />
                        </motion.div>

                        {/* Text Reveal */}
                        <motion.div
                            className="overflow-hidden"
                            initial={{ width: 0 }}
                            animate={{ width: "auto" }}
                            transition={{ delay: 0.4, duration: 1, ease: "easeInOut" }}
                        >
                            <h1 className="text-4xl font-black text-slate-900 font-['Outfit'] tracking-tight whitespace-nowrap px-1">
                                Sharma Store
                            </h1>
                        </motion.div>

                        {/* Tagline Fade */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2, duration: 0.8 }}
                            className="text-xs font-bold text-orange-600 uppercase tracking-[0.3em] mt-3"
                        >
                            Premium Stationery
                        </motion.p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SplashScreen;
