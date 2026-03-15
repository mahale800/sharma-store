/**
 * Utility to show native browser notifications.
 * Handles permission checks and service worker registration if available.
 */
export const showBrowserNotification = async (title, body, actionUrl = '/') => {
    // 1. Check if browser supports notifications
    if (!('Notification' in window)) {
        return;
    }

    // 2. Check Permission
    if (Notification.permission !== 'granted') {
        return;
    }

    // 3. Prepare Options
    const options = {
        body: body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        vibrate: [100, 50, 100],
        data: {
            url: actionUrl
        }
    };

    // 4. Show Notification based on Service Worker availability
    try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
            // Use Service Worker (Supports actions, better mobile support)
            await registration.showNotification(title, options);
        } else {
            // Fallback to basic Notification API
            const n = new Notification(title, options);
            n.onclick = function (event) {
                event.preventDefault(); // prevent the browser from focusing the Notification's tab
                window.open(actionUrl, '_blank');
            };
        }
    } catch (error) {
        console.error("Error showing notification:", error);
        // Fallback catch-all
        new Notification(title, options);
    }
};
