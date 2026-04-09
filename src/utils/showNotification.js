/**
 * Utility to show native browser notifications.
 * Handles permission checks and service worker registration if available.
 */
export const showBrowserNotification = async (title, body, options = {}) => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        return false;
    }

    if (Notification.permission !== 'granted') {
        return false;
    }

    const {
        actionUrl = '/',
        icon = '/pwa-192x192.png',
        badge = '/pwa-192x192.png',
        tag,
        silent = false
    } = options;

    const notificationOptions = {
        body,
        icon,
        badge,
        tag,
        silent,
        vibrate: [100, 50, 100],
        data: {
            url: actionUrl,
            tag
        }
    };

    try {
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready;
            if (registration?.showNotification) {
                await registration.showNotification(title, notificationOptions);
                return true;
            }
        }

        const notification = new Notification(title, notificationOptions);
        notification.onclick = (event) => {
            event.preventDefault();
            window.open(actionUrl, '_blank', 'noopener,noreferrer');
        };
        return true;
    } catch (error) {
        console.error('Error showing notification:', error);

        try {
            // Basic fallback for browsers where service worker notification throws.
            new Notification(title, notificationOptions);
            return true;
        } catch {
            return false;
        }
    }
};
