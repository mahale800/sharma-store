import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { usePerformance } from './usePerformance';
import { useAuth } from '../context/AuthContext';

// Queue for batching events
let eventQueue = [];
const BATCH_SIZE = 5;
const FLUSH_INTERVAL = 30000; // 30 seconds

export const useEngagement = () => {
    const { isLowPowerMode } = usePerformance();
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);

    // Flush Queue to Firestore
    const flushQueue = useCallback(async () => {
        if (eventQueue.length === 0) return;

        const batch = [...eventQueue];
        eventQueue = []; // Clear queue

        try {
            // In a real high-scale app, we'd use a cloud function or batch write.
            // For now, simple looping addDoc is fine for this scale, or batch() if ids known.
            // keeping it simple for client-side demo.
            await Promise.all(batch.map(event => addDoc(collection(db, "analytics_events"), event)));
        } catch (error) {
            console.warn("Failed to flush analytics:", error.message);
            // Re-queue failed events (optional, maybe complicated to avoid dupes)
        }
    }, []);

    // Auto-flush on interval
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isLowPowerMode) flushQueue();
        }, FLUSH_INTERVAL);
        return () => clearInterval(interval);
    }, [isLowPowerMode, flushQueue]);

    // Cleanup on unmount (try to flush)
    useEffect(() => {
        return () => {
            // Best effort flush on close
            if (eventQueue.length > 0) flushQueue();
        };
    }, [flushQueue]);

    const logEvent = useCallback((eventType, source, details = {}) => {
        // 1. Rules: No logging in Low Power (unless critical?), Respect Opt-out (check logic elsewhere or here)
        if (isLowPowerMode && eventType !== 'purchase') return;

        const event = {
            userId: currentUser?.uid || 'guest',
            eventType, // notification_click, ai_chat, add_to_cart
            source, // notification, ai, organic
            timestamp: Timestamp.now(),
            ...details
        };

        eventQueue.push(event);

        if (eventQueue.length >= BATCH_SIZE) {
            flushQueue();
        }
    }, [currentUser, isLowPowerMode, flushQueue]);

    // Analytics Fetching for Admin
    const getEngagementStats = async (days = 7) => {
        setLoading(true);
        try {
            // Fetch raw events (Simulated aggregation since Firestore client-side aggregation is limited)
            // Real-world: Use BigQuery or Aggregation Queries

            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const q = query(
                collection(db, "analytics_events"),
                where("timestamp", ">=", Timestamp.fromDate(startDate)),
                orderBy("timestamp", "desc"),
                limit(1000) // Cap for safety
            );

            const snapshot = await getDocs(q);
            const events = snapshot.docs.map(doc => doc.data());

            // Process Metrics
            const metrics = {
                notifications: { sent: 0, clicked: 0, byTone: {} },
                ai: { sessions: 0, recommendationsClicked: 0 },
                conversions: { notification: 0, ai: 0, organic: 0 },
                behavior: { pageViews: 0, productClicks: 0, cartAdditions: 0, checkoutAttempts: 0, purchases: 0 }
            };

            events.forEach(e => {
                // Notifications
                if (e.eventType === 'notification_sent') metrics.notifications.sent++;
                if (e.eventType === 'notification_click') {
                    metrics.notifications.clicked++;
                    if (e.tone) metrics.notifications.byTone[e.tone] = (metrics.notifications.byTone[e.tone] || 0) + 1;
                }

                // AI
                if (e.eventType === 'ai_session_start') metrics.ai.sessions++;
                if (e.eventType === 'ai_recommendation_click') metrics.ai.recommendationsClicked++;

                // Conversions (Purchase/Checkout)
                if (e.eventType === 'checkout_complete') {
                    metrics.behavior.purchases++;
                    if (e.source) metrics.conversions[e.source] = (metrics.conversions[e.source] || 0) + 1;
                }

                // Behavior Flow
                if (e.eventType === 'page_view') metrics.behavior.pageViews++;
                if (e.eventType === 'product_click') metrics.behavior.productClicks++;
                if (e.eventType === 'add_to_cart') metrics.behavior.cartAdditions++;
                if (e.eventType === 'checkout_attempt') metrics.behavior.checkoutAttempts++;
            });

            return { events, metrics };

        } catch (error) {
            console.warn("Error fetching stats:", error.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { logEvent, getEngagementStats, loading };
};
