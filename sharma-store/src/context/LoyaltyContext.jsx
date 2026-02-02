import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase/firebase';
import { doc, onSnapshot, updateDoc, increment, arrayUnion, setDoc } from 'firebase/firestore';
import { getRewardForStreak, getCurrentTier } from '../utils/loyaltyConstants';

const LoyaltyContext = createContext();

export const useLoyalty = () => useContext(LoyaltyContext);

export const LoyaltyProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [coins, setCoins] = useState(0);
    const [tier, setTier] = useState('Silver'); // Silver, Gold, Platinum
    const [history, setHistory] = useState([]);
    const [streak, setStreak] = useState(0);
    const [lastClaimDate, setLastClaimDate] = useState(null);
    const [loading, setLoading] = useState(true);

    // Real-time listener for user loyalty data
    useEffect(() => {
        if (!currentUser) {
            setCoins(0);
            setTier('Silver');
            setHistory([]);
            setStreak(0);
            setLastClaimDate(null);
            setLoading(false);
            return;
        }

        const userRef = doc(db, 'users', currentUser.uid);

        const unsubscribe = onSnapshot(userRef, async (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setCoins(data.coins || 0);
                setHistory(data.loyaltyHistory || []);
                setStreak(data.currentStreak || 0);
                setLastClaimDate(data.lastClaimDate || null);

                // Tier logic based on simple thresholds
                const currentCoins = data.coins || 0;
                if (currentCoins >= 5000) setTier('Platinum');
                else if (currentCoins >= 1000) setTier('Gold');
                else setTier('Silver');
            } else {
                // Initialize if missing
                await setDoc(userRef, { coins: 0, loyaltyHistory: [] }, { merge: true });
            }
            setLoading(false);
        }, (error) => {
            console.error("Loyalty context error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const addCoins = async (amount, reason) => {
        if (!currentUser) return;

        try {
            const userRef = doc(db, 'users', currentUser.uid);
            const newTx = {
                id: Date.now(),
                title: reason,
                amount: Math.abs(amount),
                type: 'credit',
                date: new Date().toISOString()
            };

            await updateDoc(userRef, {
                coins: increment(amount),
                loyaltyHistory: arrayUnion(newTx)
            });
        } catch (error) {
            console.error("Error adding coins:", error);
        }
    };

    const redeemCoins = async (amount, reason) => {
        if (!currentUser || coins < amount) return false;

        try {
            const userRef = doc(db, 'users', currentUser.uid);
            const newTx = {
                id: Date.now(),
                title: reason,
                amount: Math.abs(amount),
                type: 'debit',
                date: new Date().toISOString()
            };

            await updateDoc(userRef, {
                coins: increment(-amount),
                loyaltyHistory: arrayUnion(newTx)
            });
            return true;
        } catch (error) {
            console.error("Error redeeming coins:", error);
            return false;
        }
    };

    // --- Streak Logic ---

    const getEffectiveStreak = () => {
        if (!lastClaimDate) return 0;

        const today = new Date().toISOString().split('T')[0];
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = yesterdayDate.toISOString().split('T')[0];

        if (lastClaimDate === today) return streak; // Already claimed today
        if (lastClaimDate === yesterday) return streak; // Streak intact
        return 0; // Streak broken
    };

    const checkCanClaim = () => {
        if (!currentUser) return false;
        const today = new Date().toISOString().split('T')[0];
        return lastClaimDate !== today;
    };

    const claimDailyReward = async () => {
        if (!currentUser) return false;

        // Double check eligibility
        if (!checkCanClaim()) return false;

        try {
            const today = new Date().toISOString().split('T')[0];
            const effectiveStreak = getEffectiveStreak();

            // If we are claiming, logic is:
            // If lastClaim was yesterday (effectiveStreak > 0), new Streak = current + 1
            // If lastClaim was older (effectiveStreak == 0), new Streak = 1
            // Note: getEffectiveStreak returns 'streak' if yesterday was claimed.
            // If today is NOT claimed, and yesterday WAS, effectiveStreak is 'streak'. So new is streak + 1.
            // If yesterday was NOT claimed, effectiveStreak is 0. So new is 1.

            const newStreak = effectiveStreak + 1;
            const rewardAmount = getRewardForStreak(newStreak);
            const tierReached = getCurrentTier(newStreak);

            const userRef = doc(db, 'users', currentUser.uid);

            await updateDoc(userRef, {
                currentStreak: newStreak,
                lastClaimDate: today,
                totalRewardsClaimed: increment(1),
                highestStreak: increment(newStreak > (userRef.highestStreak || 0) ? 1 : 0), // Note: Firestore can't read-mod-write atomic easily like this for max, but sufficient for now
                tierReached: tierReached.name
            });

            await addCoins(rewardAmount, `Daily Streak Day ${newStreak} (${tierReached.name})`);

            return { success: true, reward: rewardAmount, newStreak };

        } catch (error) {
            console.error("Claim Error:", error);
            return { success: false, error };
        }
    };


    const getTierBenefits = () => {
        switch (tier) {
            case 'Platinum': return { discount: 20, freeDelivery: true, exclusiveAccess: true };
            case 'Gold': return { discount: 15, freeDelivery: true, exclusiveAccess: false };
            default: return { discount: 5, freeDelivery: false, exclusiveAccess: false };
        }
    };

    const value = {
        coins,
        tier,
        history,
        streak,
        lastClaimDate,
        getEffectiveStreak,
        checkCanClaim,
        addCoins,
        redeemCoins,
        claimDailyReward,
        getTierBenefits,
        loading
    };

    return (
        <LoyaltyContext.Provider value={value}>
            {children}
        </LoyaltyContext.Provider>
    );
};
