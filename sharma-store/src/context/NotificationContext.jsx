import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { usePerformance } from '../hooks/usePerformance';
import { generateNotificationCopy } from '../services/aiService';
import { CartContext } from './CartContext';
import { WishlistContext } from './WishlistContext';
import { useEngagement } from '../hooks/useEngagement';
import { doc, onSnapshot, updateDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const { isLowPowerMode } = usePerformance();
    const { logEvent } = useEngagement();

    // Default States
    const defaultPreferences = { enabled: true, tone: 'Professional', sound: true };
    const [preferences, setPreferences] = useState(defaultPreferences);
    const [notifications, setNotifications] = useState([]);

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
        const userRef = doc(db, 'users', currentUser.uid);

        const unsubscribe = onSnapshot(userRef, async (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();

                // Load Preferences
                if (data.preferences) {
                    setPreferences(prev => ({ ...prev, ...data.preferences })); // Merge to keep defaults
                }

                // Load Notifications (stored in subcollection or field? field is easier for small lists)
                // For scalability, a subcollection is better, but for this "Status Bar" style, a field array is fine (capped at 50).
                if (data.notifications) {
                    setNotifications(data.notifications);
                }
            } else {
                // Initialize defaults if missing
                await setDoc(userRef, {
                    preferences: defaultPreferences,
                    notifications: []
                }, { merge: true });
            }
        });

        return () => unsubscribe();
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

    // Smart Triggers (Cart / Wishlist)
    const { cartCount, cartTotal } = useContext(CartContext);
    const { wishlistCount } = useContext(WishlistContext);

    useEffect(() => {
        if (cartCount > 0) {
            const timer = setTimeout(() => {
                addNotification('engagement', `You have ${cartCount} items (₹${cartTotal}) waiting in your cart.`);
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [cartCount]);

    useEffect(() => {
        if (wishlistCount > 0) {
            const timer = setTimeout(() => {
                addNotification('engagement', `Your wishlist has ${wishlistCount} items. Don't let them go out of stock!`);
            }, 15000);
            return () => clearTimeout(timer);
        }
    }, [wishlistCount]);

    const addNotification = async (type, rawMessage, force = false) => {
        if (!preferences.enabled && !force) return;
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
            const userRef = doc(db, 'users', currentUser.uid);
            updateDoc(userRef, {
                notifications: arrayUnion(newNotif)
            }).catch(e => console.error("Failed to sync notif", e));
        }

        // Analytics & Sound
        logEvent('notification_sent', 'notification', { type, tone: toneUsed });
        if (preferences.sound && !isLowPowerMode) {
            // Play sound logic here
        }
    };

    const markAsRead = async (id) => {
        // Optimistic
        const updatedNotifs = notifications.map(n => n.id === id ? { ...n, read: true } : n);
        setNotifications(updatedNotifs);

        if (currentUser) {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, { notifications: updatedNotifs });
        }
    };

    const markAllAsRead = async () => {
        const updatedNotifs = notifications.map(n => ({ ...n, read: true }));
        setNotifications(updatedNotifs);

        if (currentUser) {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, { notifications: updatedNotifs });
        }
    };

    const clearAll = async () => {
        setNotifications([]);
        if (currentUser) {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, { notifications: [] });
        }
    };

    const updatePreferences = async (newPrefs) => {
        const updated = { ...preferences, ...newPrefs };
        setPreferences(updated);

        if (currentUser) {
            const userRef = doc(db, 'users', currentUser.uid);
            // Updating nested field using dot notation needs carefulness with updateDoc
            // Assuming preferences is a map field
            await updateDoc(userRef, { preferences: updated });
        }
    };

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
            updatePreferences
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
