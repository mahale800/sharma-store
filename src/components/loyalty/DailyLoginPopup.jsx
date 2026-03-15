import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLoyalty } from '../../context/LoyaltyContext';
import { useNavigate } from 'react-router-dom';
import { Coins, X, Check, Flame, Lock, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRewardForStreak, getNextMilestone, getCurrentTier } from '../../utils/loyaltyConstants';

const DailyLoginPopup = ({ isOpen, onClose }) => {
    const { currentUser } = useAuth();
    const { claimDailyReward, getEffectiveStreak, checkCanClaim } = useLoyalty();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [claimed, setClaimed] = useState(false);
    const [streak, setStreak] = useState(0);
    const [canClaim, setCanClaim] = useState(false);
    const [potentialReward, setPotentialReward] = useState(5);
    const [nextMilestone, setNextMilestone] = useState(null);
    const [currentTier, setCurrentTier] = useState(null);

    // Initialize Data
    useEffect(() => {
        if (isOpen && currentUser) {
            const effectiveStreak = getEffectiveStreak();
            const claimable = checkCanClaim();
            const currentStreakDisplay = claimable ? effectiveStreak : effectiveStreak; // If claimable, we are at X. Reward is for X+1.

            setStreak(effectiveStreak);
            setCanClaim(claimable);
            setClaimed(!claimable);

            // Calculate potentials
            const nextStreak = claimable ? effectiveStreak + 1 : effectiveStreak;
            setPotentialReward(getRewardForStreak(nextStreak));
            setCurrentTier(getCurrentTier(effectiveStreak));
            setNextMilestone(getNextMilestone(effectiveStreak));
        }
    }, [isOpen, currentUser, getEffectiveStreak, checkCanClaim]);

    const handleClaim = async () => {
        if (!currentUser || !canClaim || loading) return;
        setLoading(true);

        const result = await claimDailyReward();

        if (result.success) {
            setClaimed(true);
            setCanClaim(false);
            setStreak(result.newStreak);
            setPotentialReward(result.reward); // Keep showing what was won

            // Sync local storage manually if needed for "Don't show again today" logic
            localStorage.setItem('lastDailyPopup', new Date().toDateString());

            setTimeout(() => {
                onClose();
            }, 3000);
        } else {
            console.error(result.error);
        }
        setLoading(false);
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    if (!currentUser || !currentTier || !nextMilestone) return null;

    // ... (Keep existing UI rendering logic mostly same, just simplified) ...
    // Using simple components from previous file for brevity in this re-write, assuming they are inline or I'll copy them.

    // Helper Components inline

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                    onClick={handleBackdropClick}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-colors z-20"
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center relative">
                            {/* Streak Counter Badge */}
                            <div className="flex items-center justify-between mb-6">
                                <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 bg-orange-50 text-orange-600 border border-orange-100`}>
                                    <Flame size={12} className="fill-orange-500" />
                                    {streak} Day Streak
                                </div>
                                <div className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 bg-gray-50 text-gray-500 border border-gray-100">
                                    <Trophy size={12} className="text-gray-400" />
                                    {currentTier.name}
                                </div>
                            </div>

                            {/* Icon */}
                            <div className="mb-6 relative">
                                <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-white rounded-3xl shadow-inner flex items-center justify-center border border-white/50 mx-auto">
                                    <Coins size={48} className={`text-orange-500 ${claimed ? 'animate-bounce' : 'animate-pulse'}`} />
                                </div>
                                {claimed && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -bottom-2 right-1/2 translate-x-10 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white border-2 border-white shadow-lg"
                                    >
                                        <Check size={16} strokeWidth={4} />
                                    </motion.div>
                                )}
                            </div>

                            {/* Text */}
                            <h2 className="text-3xl font-black text-gray-900 mb-1">
                                {claimed ? "Reward Collected!" : "Daily Reward"}
                            </h2>
                            <p className="text-gray-500 font-medium mb-6">
                                {claimed
                                    ? "You've kept your streak alive. See you tomorrow!"
                                    : (
                                        <span>
                                            Claim today's reward of <span className="text-black font-black">{potentialReward} coins</span>.
                                        </span>
                                    )}
                            </p>

                            {/* Progress Bar */}
                            <ProgressBar currentTier={currentTier} nextMilestone={nextMilestone} streak={streak} />

                            {/* Action Button */}
                            <button
                                onClick={handleClaim}
                                disabled={claimed || loading}
                                className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl
                                    ${claimed
                                        ? 'bg-green-500 text-white shadow-green-500/20 cursor-default'
                                        : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-orange-500/30 hover:scale-[1.02] active:scale-95'
                                    }`}
                            >
                                {loading ? (
                                    <span className="animate-pulse">Checking...</span>
                                ) : claimed ? (
                                    <>Claimed <Check size={20} /></>
                                ) : (
                                    <>Claim {potentialReward} Coins</>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DailyLoginPopup;

const ProgressBar = ({ currentTier, nextMilestone, streak }) => {
    const prevMilestoneDays = currentTier.days === nextMilestone.days ? 0 : currentTier.days;
    const totalGap = nextMilestone.days - prevMilestoneDays;
    const currentProgress = streak - prevMilestoneDays;
    const progressPercent = Math.min(100, Math.max(5, (currentProgress / totalGap) * 100));

    return (
        <div className="mb-8 w-full">
            <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">{currentTier.name}</span>
                <div className="flex items-center gap-1.5 text-right">
                    <span className="text-xs text-gray-500 font-medium">Next:</span>
                    <span className={`text-sm font-black ${nextMilestone.color}`}>{nextMilestone.name}</span>
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded ml-1">{nextMilestone.days} days</span>
                </div>
            </div>
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden relative border border-gray-200/50">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: "circOut" }}
                    className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-600 shadow-lg shadow-orange-500/30`}
                />
            </div>
            <p className="mt-2 text-xs text-center font-medium text-gray-400">
                {nextMilestone.days - streak} days until <span className="text-gray-800 font-bold">+{nextMilestone.reward} Coins</span> bonus!
            </p>
        </div>
    );
};
