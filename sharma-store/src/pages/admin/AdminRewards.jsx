import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase';
import { collection, getDocs, query, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { Trophy, RefreshCw, Flame, AlertCircle } from 'lucide-react';
import { getCurrentTier } from '../../utils/loyaltyConstants';

const AdminRewards = () => {
    const [stats, setStats] = useState({
        totalStreakUsers: 0,
        avgStreak: 0,
        highestStreak: 0,
        todayClaims: 0
    });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // NOTE: In production with thousands of users, avoid fetching all.
            // This reads up to 100 users sorted by streak for the leaderboard/management.
            // For aggregations, we'd ideally use a Cloud Function scheduled job.
            // Here we do client-side aggregation for the demo/MVP scale.

            const usersRef = collection(db, 'users');
            // Query: Users with at least 1 streak
            const q = query(usersRef, orderBy('currentStreak', 'desc'), limit(50));
            const snapshot = await getDocs(q);

            let totalStreak = 0;
            let totalUsers = 0;
            let maxStreak = 0;
            let claimsToday = 0;
            const today = new Date().toISOString().split('T')[0];

            const userData = snapshot.docs.map(doc => {
                const data = doc.data();
                const streak = data.currentStreak || 0;

                if (streak > 0) {
                    totalStreak += streak;
                    totalUsers++;
                    if (streak > maxStreak) maxStreak = streak;
                }
                if (data.lastClaimDate === today) claimsToday++;

                return {
                    id: doc.id,
                    ...data,
                    currentStreak: streak, // Ensure number
                    tier: getCurrentTier(streak).name
                };
            });

            setStats({
                totalStreakUsers: totalUsers,
                avgStreak: totalUsers > 0 ? (totalStreak / totalUsers).toFixed(1) : 0,
                highestStreak: maxStreak,
                todayClaims: claimsToday
            });
            setUsers(userData);
        } catch (error) {
            console.error("Error fetching rewards data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleResetStreak = async (userId, currentStreak) => {
        if (!window.confirm(`Are you sure you want to reset the streak for this user? (Current: ${currentStreak})`)) return;

        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                currentStreak: 0,
                // We keep highestStreak for history
            });
            alert("Streak reset successfully.");
            fetchData(); // Refresh
        } catch (error) {
            console.error("Error resetting streak:", error);
            alert("Failed to reset streak.");
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Rewards Data...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <Trophy className="text-orange-500" /> Rewards & Streaks Management
            </h1>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* 1. Stats Overview (Occupies 2 columns) */}
                <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Active Streaks</p>
                        <h3 className="text-3xl font-black text-gray-900">{stats.totalStreakUsers}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Avg. Streak</p>
                        <h3 className="text-3xl font-black text-blue-600">{stats.avgStreak}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Top Streak</p>
                        <h3 className="text-3xl font-black text-orange-500">{stats.highestStreak}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Claims Today</p>
                        <h3 className="text-3xl font-black text-green-500">{stats.todayClaims}</h3>
                    </div>
                </div>

                {/* 2. Tier Distribution (Chart) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Flame size={18} className="text-orange-500" /> Tier Distribution
                    </h3>
                    <div className="space-y-3">
                        {['Starter', 'Consistent', 'Dedicated', 'Power User', 'Elite'].map(tier => {
                            // Calculate simple percentage for visual bars based on total users (avoid div by zero)
                            const count = users.filter(u => u.tier === tier).length;
                            const total = users.length || 1;
                            const percent = (count / total) * 100;

                            return (
                                <div key={tier} className="text-xs">
                                    <div className="flex justify-between mb-1">
                                        <span className="font-medium text-gray-600">{tier}</span>
                                        <span className="font-bold text-gray-900">{count}</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-orange-500 rounded-full"
                                            style={{ width: `${percent}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* System Controls */}
            <div className="mb-8">
                <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                            <AlertCircle size={20} className="text-yellow-400" /> System Control
                        </h3>
                        <p className="text-slate-400 text-sm">Manage the global rewards engine state.</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => {
                                const headers = ["User ID", "Name", "Email", "Current Streak", "Highest Streak", "Tier", "Last Claim"];
                                const csvContent = [
                                    headers.join(","),
                                    ...users.map(u => [u.id, `"${u.fullName || ''}"`, u.email, u.currentStreak, u.highestStreak, u.tier, u.lastClaimDate].join(","))
                                ].join("\n");

                                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                const link = document.createElement("a");
                                link.href = URL.createObjectURL(blob);
                                link.download = `rewards_analytics_${new Date().toISOString().split('T')[0]}.csv`;
                                link.click();
                            }}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-colors"
                        >
                            Export Analytics
                        </button>
                        <button
                            onClick={() => alert("Global rewards disable is not configured in this demo environment.")}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-red-500/30"
                        >
                            Disable Rewards
                        </button>
                    </div>
                </div>
            </div>

            {/* Leaderboard / User Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800">Top Streak Users</h2>
                    <button onClick={fetchData} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <RefreshCw size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 text-sm font-bold text-gray-500 uppercase">User</th>
                                <th className="p-4 text-sm font-bold text-gray-500 uppercase">Current Tier</th>
                                <th className="p-4 text-sm font-bold text-gray-500 uppercase">Current Streak</th>
                                <th className="p-4 text-sm font-bold text-gray-500 uppercase">Highest</th>
                                <th className="p-4 text-sm font-bold text-gray-500 uppercase">Last Claim</th>
                                <th className="p-4 text-sm font-bold text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-gray-900">{user.fullName || "Unknown"}</div>
                                        <div className="text-xs text-gray-400">{user.email}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                            {user.tier}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1 font-black text-orange-600">
                                            <Flame size={16} className="fill-orange-500" />
                                            {user.currentStreak}
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-gray-600">
                                        {user.highestStreak || user.currentStreak || 0}
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">
                                        {user.lastClaimDate || "Never"}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleResetStreak(user.id, user.currentStreak)}
                                            className="text-red-500 hover:text-red-700 font-medium text-xs border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors"
                                            title="Reset Streak to 0"
                                        >
                                            Reset Streak
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-400 font-medium">
                                        No active streaks found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminRewards;
