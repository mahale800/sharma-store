import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { usePerformance } from '../hooks/usePerformance';
import { generateNotificationCopy } from '../services/aiService';
import { CartContext } from './CartContext';
import { WishlistContext } from './WishlistContext';
import { useEngagement } from '../hooks/useEngagement';
import { doc, onSnapshot, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, messaging, functions } from '../firebase/firebase';
import { onMessage } from 'firebase/messaging';
import { httpsCallable } from 'firebase/functions';
import { showBrowserNotification } from '../utils/showNotification';
import { requestFcmToken } from '../firebase/messaging';
import { collection, query, where, orderBy, limit, addDoc, writeBatch } from 'firebase/firestore';
import { useStoreSettings } from './StoreSettingsContext';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

const resolveNotificationDate = (notification) => {
    if (notification?.timestamp?.toDate) return notification.timestamp.toDate();
    if (notification?.createdAt?.toDate) return notification.createdAt.toDate();

    const rawDate = notification?.createdAt || notification?.timestamp;
    const parsedDate = rawDate ? new Date(rawDate) : new Date();
    return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
};

const normalizeNotification = (notification) => ({
    id: notification.id,
    type: notification.type || 'announcement',
    title: notification.title || 'Sharma Store',
    message: notification.message || notification.body || notification.title || 'You have a new update.',
    tone: notification.tone || 'Neutral',
    read: Boolean(notification.read),
    createdAt: resolveNotificationDate(notification).toISOString(),
    actionUrl: notification.actionUrl || notification?.data?.url || '/'
});

export const NotificationProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const { isLowPowerMode } = usePerformance();
    const { logEvent } = useEngagement();
    const { enableNotifications: storeNotificationsEnabled } = useStoreSettings();
    const knownOrdersRef = useRef({});
    const hasPrimedOrdersRef = useRef(false);

    // Default States
    const defaultPreferences = {
        userId: currentUser?.uid,
        orderUpdates: true,
        marketing: true,
        loyalty: true,
        cartReminders: true,
        enabled: true,
        sound: false,
        tone: 'Friendly'
    };
    const [preferences, setPreferences] = useState(defaultPreferences);
    const [notifications, setNotifications] = useState([]);
    const [fcmToken, setFcmToken] = useState(null);
    const [browserSupported, setBrowserSupported] = useState(typeof Notification !== 'undefined');
    const [permissionStatus, setPermissionStatus] = useState(
        typeof Notification !== 'undefined' ? Notification.permission : 'default'
    );

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
            if (savedPrefs) setPreferences(prev => ({ ...prev, ...JSON.parse(savedPrefs) }));
            if (savedNotifs) setNotifications(JSON.parse(savedNotifs).map(normalizeNotification));
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
            const fetchedNotifs = snapshot.docs.map(doc => normalizeNotification({
                id: doc.id,
                ...doc.data()
            }));
            setNotifications(fetchedNotifs);
        }, (error) => {
            if (error.code === 'permission-denied') {
                console.warn("Notifications access denied. Keeping local notifications only.");
            } else {
                console.error("Error fetching notifications:", error);
            }
        });

        return () => {
            prefsUnsubscribe();
            notifUnsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    useEffect(() => {
        const syncPermission = () => {
            const supported = typeof Notification !== 'undefined';
            setBrowserSupported(supported);
            setPermissionStatus(supported ? Notification.permission : 'default');
        };

        syncPermission();
        window.addEventListener('focus', syncPermission);
        document.addEventListener('visibilitychange', syncPermission);

        return () => {
            window.removeEventListener('focus', syncPermission);
            document.removeEventListener('visibilitychange', syncPermission);
        };
    }, []);

    const checkDailyUsage = useCallback(() => {
        const today = new Date().toDateString();
        if (dailyCount.date !== today) {
            setDailyCount({ date: today, count: 0 });
            return true;
        }
        return dailyCount.count < 5;
    }, [dailyCount]);

    // Notification logic
    const addNotification = useCallback(async (type, rawMessage, force = false, options = {}) => {
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
        const title = options.title || 'Sharma Store';
        const actionUrl = options.actionUrl || '/';

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

        const newNotif = normalizeNotification({
            id: Date.now().toString(),
            type,
            title,
            message: finalMessage,
            tone: toneUsed,
            read: false,
            createdAt: new Date().toISOString(),
            actionUrl
        });

        // Optimistic Update
        setNotifications(prev => [newNotif, ...prev].slice(0, 50));

        // Persist
        if (currentUser) {
            addDoc(collection(db, 'notifications'), {
                userId: currentUser.uid,
                type,
                title,
                body: finalMessage,
                read: false,
                timestamp: serverTimestamp(),
                createdAt: new Date().toISOString(),
                tone: toneUsed,
                actionUrl,
                meta: options.meta || {}
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
        if (permissionStatus === 'granted' && preferences.enabled && storeNotificationsEnabled && !options.suppressBrowser) {
            showBrowserNotification(title, finalMessage, {
                actionUrl,
                tag: options.tag || `${type}-${newNotif.id}`
            });
        }
    }, [checkDailyUsage, currentUser, isLowPowerMode, logEvent, permissionStatus, preferences, storeNotificationsEnabled]);

    // Smart Triggers (Cart / Wishlist)
    const { cartCount } = useContext(CartContext);
    const { wishlistCount } = useContext(WishlistContext);

    useEffect(() => {
        if (cartCount > 0) {
            // Abandoned Cart Recovery: Detect carts left for defined time (15 minutes)
            const timer = setTimeout(() => {
                addNotification('cart', `Your items are waiting in the cart.`);
            }, 900000); // 15 mins
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cartCount]); // Removed cartTotal as it's not used

    useEffect(() => {
        if (wishlistCount > 0) {
            const timer = setTimeout(() => {
                addNotification('engagement', `Your wishlist has ${wishlistCount} items. Don't let them go out of stock!`);
            }, 15000);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wishlistCount]);

    useEffect(() => {
        if (!currentUser) {
            knownOrdersRef.current = {};
            hasPrimedOrdersRef.current = false;
            return undefined;
        }

        const ordersQuery = query(collection(db, 'orders'), where('userId', '==', currentUser.uid));
        const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
            const nextKnownOrders = {};

            snapshot.docs.forEach((orderDoc) => {
                const data = orderDoc.data();
                const currentStatus = data.status || 'Pending';
                const readableOrderId = data.orderId || orderDoc.id.slice(0, 8).toUpperCase();
                const previous = knownOrdersRef.current[orderDoc.id];

                nextKnownOrders[orderDoc.id] = {
                    status: currentStatus,
                    orderId: readableOrderId
                };

                if (hasPrimedOrdersRef.current && previous && previous.status !== currentStatus) {
                    addNotification(
                        'order',
                        `Order #${readableOrderId} is now ${currentStatus}.`,
                        true,
                        {
                            title: 'Order Update',
                            actionUrl: `/track-order/${data.orderId || orderDoc.id}`,
                            tag: `order-${orderDoc.id}-${currentStatus}`
                        }
                    );
                }
            });

            knownOrdersRef.current = nextKnownOrders;
            hasPrimedOrdersRef.current = true;
        }, (error) => {
            console.warn('Live order notifications unavailable:', error?.message || error);
        });

        return () => unsubscribe();
    }, [addNotification, currentUser]);


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
        if (typeof Notification === 'undefined') return null;

        if (Notification.permission === 'default') {
            await Notification.requestPermission();
        }

        setPermissionStatus(Notification.permission);

        if (Notification.permission !== 'granted') {
            return null;
        }

        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.ready;
            } catch {
                // Ignore readiness issues and continue with in-app notifications.
            }
        }

        const token = currentUser && messaging ? await requestFcmToken(currentUser.uid) : null;
        if (token) setFcmToken(token);
        return token;
    };

    const triggerMarketing = async () => {
        if (!currentUser || !functions) return;
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
        if (!currentUser || !functions) return;
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
        if (permissionStatus !== 'granted') {
            await requestPermission();
        }

        if (currentUser && functions) {
            try {
                const sendTest = httpsCallable(functions, 'sendTestNotification');
                await sendTest({ userId: currentUser.uid });
                addNotification('announcement', 'Test notification sent! Check your other tabs/devices.', true, {
                    title: 'Test Notification',
                    actionUrl: '/account',
                    suppressBrowser: true
                });
                return;
            } catch (error) {
                console.error("Failed to send test notification:", error);
            }
        }

        const shown = await showBrowserNotification('Sharma Store', 'Device notifications are active on this browser.', {
            actionUrl: '/account',
            tag: 'device-test-notification'
        });

        addNotification(
            shown ? 'announcement' : 'alert',
            shown ? 'Local device notification sent successfully.' : 'We could not show a device notification on this browser.',
            true,
            { title: 'Notification Check', actionUrl: '/account', suppressBrowser: true }
        );
    };

    // Listen for Foreground Messages (FCM)
    useEffect(() => {
        if (permissionStatus === 'granted' && messaging) {
            const unsubscribe = onMessage(messaging, (payload) => {

                const title = payload.notification?.title || 'Sharma Store';
                const body = payload.notification?.body || 'You have a new message.';
                const actionUrl = payload.data?.url || '/account';

                // 1. Show In-App Toast
                addNotification(
                    'announcement',
                    body,
                    true,
                    { title, actionUrl, suppressBrowser: true }
                );
            });
            return () => unsubscribe();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [permissionStatus, messaging]);

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
            browserSupported,
            fcmToken,
            sendTestNotification,
            triggerMarketing,
            triggerAbandonedCart
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
