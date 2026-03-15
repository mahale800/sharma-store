import { useState, useEffect } from 'react';

export const usePerformance = () => {
    const [isLowPowerMode, setIsLowPowerMode] = useState(false);
    const [isPageVisible, setIsPageVisible] = useState(!document.hidden);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );

    useEffect(() => {
        // 1. Page Visibility Tracker
        const handleVisibilityChange = () => {
            setIsPageVisible(!document.hidden);
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // 2. Battery Status API (Progressive Enhancement)
        let batteryMonitor = null;
        if ('getBattery' in navigator) {
            navigator.getBattery().then((battery) => {
                batteryMonitor = battery;
                const updateBatteryStatus = () => {
                    // Consider low power if battery is low (< 20%) and not charging, 
                    // or if the browser reports saveData (NetworkInformation API - separate but related)
                    // For now, simple heuristic: < 20% + discharging
                    const isLow = battery.level < 0.2 && !battery.charging;
                    setIsLowPowerMode(isLow);
                };

                updateBatteryStatus();
                battery.addEventListener('levelchange', updateBatteryStatus);
                battery.addEventListener('chargingchange', updateBatteryStatus);
            });
        }

        // 3. Reduced Motion Listener
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const handleMotionChange = (e) => setPrefersReducedMotion(e.matches);
        motionQuery.addEventListener('change', handleMotionChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            motionQuery.removeEventListener('change', handleMotionChange);
            if (batteryMonitor) {
                batteryMonitor.removeEventListener('levelchange', () => { });
                batteryMonitor.removeEventListener('chargingchange', () => { });
            }
        };
    }, []);

    // Derived State: Should we allow animations/heavy tasks?
    // Stop if: User wants reduced motion OR Page is hidden OR Low Battery
    const shouldAnimate = !prefersReducedMotion && isPageVisible && !isLowPowerMode;

    // Derived State: Should we run heavy background tasks (like polling)?
    // Stop if: Page hidden OR Low Battery
    const allowBackgroundTasks = isPageVisible && !isLowPowerMode;

    return {
        isLowPowerMode,
        isPageVisible,
        prefersReducedMotion,
        shouldAnimate,
        allowBackgroundTasks
    };
};
