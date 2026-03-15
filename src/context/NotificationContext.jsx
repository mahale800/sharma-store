import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { usePerformance } from '../hooks/usePerformance';
import { generateNotificationCopy } from '../services/aiService';
import { CartContext } from './CartContext';
import { WishlistContext } from './WishlistContext';
import { useEngagement } from '../hooks/useEngagement';
import { doc, onSnapshot, updateDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { db, messaging, functions } from '../firebase/firebase';
import { onMessage } from 'firebase/messaging';
import { httpsCallable } from 'firebase/functions';
import { showBrowserNotification } from '../utils/showNotification';
import { requestFcmToken } from '../firebase/messaging';
import { collection, query, where, orderBy, limit, addDoc, getDocs, writeBatch } from 'firebase/firestore';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const { isLowPowerMode } = usePerformance();
    const { logEvent } = useEngagement();

    // Default States
    const defaultPreferences = {
        userId: currentUser?.uid,
        orderUpdates: true,
        marketing: true,
        loyalty: true,
        cartReminders: true
    };
    const [preferences, setPreferences] = useState(defaultPreferences);
    const [notifications, setNotifications] = useState([]);
    const [fcmToken, setFcmToken] = useState(null);
    const [permissionStatus, setPermissionStatus] = useState(Notification.permission);

    // Daily Limit Tracker ({ date: 'YYYY-MM-DD', count: 0 })
    const [dailyCount, setDailyCount] = useState(() => {
        const saved = localStorage.getItem('sharma-notification-daily-count');
        return saved ? JSON.parse(saved) : { date: new Date().toDateString(), count: 0 };
    });

    // --- PERSISTENCE LOGIC ---
    useEffect(() => {
        if (!currentUser) {
            // GUEST MODE: Load from LocalStorage
            const savedPrefs = localStorage.getItem('sharma-notification-prefs');
            const savedNotifs = localStorage.getItem('sharma-notifications');
            if (savedPrefs) setPreferences(JSON.parse(savedPrefs));
            if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
            return;
        }

        // USER MODE: Sync with Firestore
        // 1. Listen to User Preferences
        const prefsRef = doc(db, 'notificationPreferences', currentUser.uid);
        const prefsUnsubscribe = onSnapshot(prefsRef, (docSnap) => {
            if (docSnap.exists()) {
                setPreferences(prev => ({ ...prev, ...docSnap.data() }));
            } else {
                // Initialize defaults if missing
                setDoc(prefsRef, defaultPreferences, { merge: true });
            }
        }, (error) => {
            if (error.code === 'permission-denied') {
                console.warn("Notification prefs access denied. Using defaults.");
            } else {
                console.error("Error fetching notification prefs:", error);
            }
        });

        // 2. Listen to User Notifications from 'notifications' collection
        const notifQuery = query(
            collection(db, 'notifications'),
            where('userId', '==', currentUser.uid),
            orderBy('timestamp', 'desc'),
            limit(50)
        );

        const notifUnsubscribe = onSnapshot(notifQuery, (snapshot) => {
            const fetchedNotifs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNotifications(fetchedNotifs);
        }, (error) => {
            if (error.code === 'permission-denied') {
                console.warn("Notifications access denied. Using empty list.");
                setNotifications([]);
            } else {
                console.error("Error fetching notifications:", error);
            }
        });

        return () => {
            prefsUnsubscribe();
            notifUnsubscribe();
        };
    }, [currentUser]);

    // Save to LocalStorage (Guest) or Firestore (User)
    useEffect(() => {
        if (!currentUser) {
            localStorage.setItem('sharma-notification-prefs', JSON.stringify(preferences));
            localStorage.setItem('sharma-notifications', JSON.stringify(notifications));
        }
        // Firestore updates happen via the action functions to allow atomicity
    }, [preferences, notifications, currentUser]);

    // Check Daily Limit
    useEffect(() => {
        localStorage.setItem('sharma-notification-daily-count', JSON.stringify(dailyCount));
    }, [dailyCount]);

    const checkDailyUsage = () => {
        const today = new Date().toDateString();
        if (dailyCount.date !== today) {
            setDailyCount({ date: today, count: 0 });
            return true;
        }
        return dailyCount.count < 5;
    };

    // Notification logic
    const addNotification = async (type, rawMessage, force = false) => {
        // Flat Preference Check
        // Type map: 'order' -> orderUpdates, 'marketing' -> marketing, 'loyalty' -> loyalty, 'cart' -> cartReminders
        const typeMap = {
            'order': 'orderUpdates',
            'marketing': 'marketing',
            'loyalty': 'loyalty',
            'cart': 'cartReminders'
        };

        const prefKey = typeMap[type];
        if (prefKey && preferences[prefKey] === false && !force) {
            return;
        }

        if (isLowPowerMode && type !== 'order') return;

        let finalMessage = rawMessage;
        let toneUsed = 'Neutral';

        // AI Styling
        if (type === 'engagement' && checkDailyUsage()) {
            toneUsed = preferences.tone;
            try {
                // Optimization: Skip AI call if tone is Neutral or Simple
                if (toneUsed !== 'Neutral') {
                    const aiMessage = await generateNotificationCopy(rawMessage, toneUsed);
                    if (aiMessage) finalMessage = aiMessage;
                }
                setDailyCount(prev => ({ ...prev, count: prev.count + 1 }));
            } catch (e) {
                console.error("Notification Gen Error", e);
            }
        }

        const newNotif = {
            id: Date.now().toString(),
            type,
            message: finalMessage,
            tone: toneUsed,
            read: false,
            createdAt: new Date().toISOString()
        };

        // Optimistic Update
        setNotifications(prev => [newNotif, ...prev].slice(0, 50));

        // Persist
        if (currentUser) {
            addDoc(collection(db, 'notifications'), {
                userId: currentUser.uid,
                type,
                title: 'Sharma Store',
                body: finalMessage,
                read: false,
                createdAt: new Date().toISOString(),
                tone: toneUsed,
                meta: {} // Optional meta field
            }).catch(e => console.error("Failed to add notification", e));
        }

        // Analytics & Sound
        logEvent('notification_sent', 'notification', { type, tone: toneUsed });
        if (preferences.sound && !isLowPowerMode) {
            // Play sound logic here
            // const audio = new Audio('/notification.mp3'); audio.play();
        }

        // TRIGGER BROWSER NOTIFICATION (Native)
        // Only if it's an engagement/order alert and permissions are granted
        // We skip this if it was a 'forced' foreground message to avoid double toast + system notif if desired,
        // but user requested "Notifications appear outside the tab".
        if (permissionStatus === 'granted' && preferences.enabled) {
            showBrowserNotification('Sharma Store', finalMessage);
        }
    };

    // Smart Triggers (Cart / Wishlist)
    const { cartCount, cartTotal } = useContext(CartContext);
    const { wishlistCount } = useContext(WishlistContext);

    useEffect(() => {
        if (cartCount > 0) {
            // Abandoned Cart Recovery: Detect carts left for defined time (15 minutes)
            const timer = setTimeout(() => {
                addNotification('cart', `Your items are waiting in the cart.`);
            }, 900000); // 15 mins
            return () => clearTimeout(timer);
        }
    }, [cartCount, cartTotal]);

    useEffect(() => {
        if (wishlistCount > 0) {
            const timer = setTimeout(() => {
                addNotification('engagement', `Your wishlist has ${wishlistCount} items. Don't let them go out of stock!`);
            }, 15000);
            return () => clearTimeout(timer);
        }
    }, [wishlistCount]);


    const markAsRead = async (id) => {
        // Optimistic
        const updatedNotifs = notifications.map(n => n.id === id ? { ...n, read: true } : n);
        setNotifications(updatedNotifs);

        if (currentUser) {
            const notifRef = doc(db, 'notifications', id);
            await updateDoc(notifRef, { read: true });
        }
    };

    const markAllAsRead = async () => {
        const updatedNotifs = notifications.map(n => ({ ...n, read: true }));
        setNotifications(updatedNotifs);

        if (currentUser) {
            const batch = writeBatch(db);
            notifications.forEach(n => {
                if (!n.read) {
                    const ref = doc(db, 'notifications', n.id);
                    batch.update(ref, { read: true });
                }
            });
            await batch.commit();
        }
    };

    const clearAll = async () => {
        setNotifications([]);
        if (currentUser) {
            // Deleting collection documents is expensive/complex client-side in bulk
            // For now, let's just mark deleted or actually delete batch.
            // A simple "clear" usually means "delete all".
            const batch = writeBatch(db);
            notifications.forEach(n => {
                const ref = doc(db, 'notifications', n.id);
                batch.delete(ref);
            });
            await batch.commit();
        }
    };

    const updatePreferences = async (newPrefs) => {
        const updated = { ...preferences, ...newPrefs };
        setPreferences(updated);

        if (currentUser) {
            const prefsRef = doc(db, 'notificationPreferences', currentUser.uid);
            await setDoc(prefsRef, updated, { merge: true });
        }
    };

    // --- FCM LOGIC ---
    const requestPermission = async () => {
        if (!currentUser) return; // Only save token if logged in (or handle guest tokens separately)

        const token = await requestFcmToken(currentUser.uid);
        setPermissionStatus(Notification.permission);
        if (token) {
            setFcmToken(token);
        }
        return token;
    };

    const triggerMarketing = async () => {
        if (!currentUser) return;
        try {
            const trigger = httpsCallable(functions, 'triggerDailyMarketing');
            await trigger();
            addNotification('announcement', 'Marketing campaign triggered!', true);
        } catch (error) {
            console.error(error);
            addNotification('alert', 'Failed to trigger campaign.', true);
        }
    };

    const triggerAbandonedCart = async () => {
        if (!currentUser) return;
        try {
            const trigger = httpsCallable(functions, 'triggerAbandonedCart');
            await trigger();
            // addNotification('announcement', 'Abandoned cart check triggered!', true); 
            // Don't show toast, let the real push come through if meaningful
        } catch (error) {
            console.error(error);
        }
    };

    const sendTestNotification = async () => {
        if (!currentUser) return;
        try {
            const sendTest = httpsCallable(functions, 'sendTestNotification');
            const result = await sendTest({ userId: currentUser.uid });
            addNotification('announcement', 'Test notification sent! Check your other tabs/devices.', true);
        } catch (error) {
            console.error("Failed to send test notification:", error);
            // Fallback to local
            showBrowserNotification('Sharma Store', 'Local Test: This is a fallback notification.');
            addNotification('alert', 'Cloud test failed. Sent local fallback.', true);
        }
    };

    // Listen for Foreground Messages (FCM)
    useEffect(() => {
        if (permissionStatus === 'granted') {
            const unsubscribe = onMessage(messaging, (payload) => {
                const title = payload.notification?.title || 'New Update';
                const body = payload.notification?.body || 'You have a new message.';

                // 1. Show In-App Toast
                addNotification(
                    'announcement',
                    body,
                    true // force
                );
            });
            return () => unsubscribe();
        }
    }, [permissionStatus]);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            preferences,
            addNotification,
            markAsRead,
            markAllAsRead,
            clearAll,
            updatePreferences,
            requestPermission,
            permissionStatus,
            fcmToken,
            sendTestNotification,
            triggerMarketing,
            triggerAbandonedCart
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
