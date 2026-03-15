export const BASE_DAILY_REWARD = 5;

export const TIER_MILESTONES = [
    { days: 1, name: 'Starter', reward: 5, color: 'text-gray-500', bg: 'bg-gray-100' },
    { days: 3, name: 'Consistent', reward: 10, color: 'text-blue-500', bg: 'bg-blue-100' },
    { days: 7, name: 'Dedicated', reward: 25, color: 'text-purple-500', bg: 'bg-purple-100' },
    { days: 14, name: 'Power User', reward: 50, color: 'text-orange-500', bg: 'bg-orange-100' },
    { days: 30, name: 'Elite', reward: 100, color: 'text-yellow-500', bg: 'bg-yellow-100' }
];

export const getRewardForStreak = (streak) => {
    // Logic: Base Reward + Milestone Bonus (if applicable)
    // Example: Day 7 -> 5 (Base) + 25 (Bonus) = 30 Coins Total

    let total = BASE_DAILY_REWARD;

    // Find exact milestone match
    const milestone = TIER_MILESTONES.find(m => m.days === streak);

    if (milestone) {
        total += milestone.reward;
    }

    return total;
};

export const getNextMilestone = (currentStreak) => {
    return TIER_MILESTONES.find(m => m.days > currentStreak) || TIER_MILESTONES[TIER_MILESTONES.length - 1];
};

export const getCurrentTier = (currentStreak) => {
    // Find the highest tier achieved so far
    const reversed = [...TIER_MILESTONES].reverse();
    return reversed.find(m => currentStreak >= m.days) || TIER_MILESTONES[0];
};
