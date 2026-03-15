import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { AlertTriangle, X } from 'lucide-react';

const StreakWarningBanner = ({ onClaimClick }) => {
    const { currentUser } = useAuth();
    const [isVisible, setIsVisible] = useState(false);
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        const checkStatus = async () => {
            if (!currentUser) return;

            // Check Time (After 8 PM)
            const hour = new Date().getHours();
            if (hour < 20) return; // Only show after 8 PM

            try {
                const userRef = doc(db, 'users', currentUser.uid);
                const docSnap = await getDoc(userRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const lastClaim = data.lastClaimDate;
                    const currentStreak = data.currentStreak || 0;
                    const today = new Date().toISOString().split('T')[0];

                    // Logic: Has Active Streak AND Has NOT claimed today
                    if (currentStreak > 0 && lastClaim !== today) {
                        setStreak(currentStreak);
                        setIsVisible(true);
                    }
                }
            } catch (error) {
                if (error.code === 'permission-denied') {
                    console.warn("Streak check skipped (rules not deployed).");
                } else {
                    console.error("Warning check failed", error);
                }
            }
        };

        checkStatus();
    }, [currentUser]);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-96 z-[90] animate-in slide-in-from-bottom-5 fade-in duration-500">
            <div className="bg-red-50 border border-red-200 shadow-xl shadow-red-500/10 rounded-2xl p-4 flex items-start gap-3 relative">
                {/* Icon */}
                <div className="bg-red-100 p-2 rounded-full text-red-600">
                    <AlertTriangle size={20} className="animate-pulse" />
                </div>

                <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-sm mb-1">Streak at Risk!</h4>
                    <p className="text-xs text-gray-600 mb-3">
                        You have a <span className="font-bold text-red-600">{streak} day streak</span>. Claim your reward before midnight to keep it!
                    </p>
                    <button
                        onClick={() => {
                            onClaimClick();
                            setIsVisible(false);
                        }}
                        className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                    >
                        Claim Reward Now
                    </button>
                </div>

                <button
                    onClick={() => setIsVisible(false)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default StreakWarningBanner;
