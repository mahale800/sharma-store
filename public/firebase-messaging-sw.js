importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');
// importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-marketing-compat.js'); // Optional

const firebaseConfig = {
    apiKey: "AIzaSyCZWYxA7g0vkRFqqcBt6CA6wjZOJEbEcNA",
    authDomain: "sharma-store-96998.firebaseapp.com",
    projectId: "sharma-store-96998",
    storageBucket: "sharma-store-96998.firebasestorage.app",
    messagingSenderId: "878985953582",
    appId: "1:878985953582:web:f554ed69fa7b3d7b9e3abf"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = payload.notification?.title || 'Sharma Store Update';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new message.',
        icon: '/pwa-192x192.png', // Ensure this path is correct
        badge: '/pwa-192x192.png',
        data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    // Open the URL sent in the data
    const urlToOpen = event.notification.data?.url || '/'; // Default to root

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (windowClients) {
            // Check if there is already a window/tab open with the target URL
            for (let i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, open a new window
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
