import React, { useEffect, useState } from 'react';
import { useEngagement } from '../../hooks/useEngagement';
import { generateEngagementInsights } from '../../services/aiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Loader2, Sparkles, Bell, MessageSquare, TrendingUp, AlertCircle, ShoppingBag, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

const EngagementAnalytics = () => {
    const { getEngagementStats, loading } = useEngagement();
    const [stats, setStats] = useState(null);
    const [aiInsights, setAiInsights] = useState([]);
    const [insightLoading, setInsightLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const data = await getEngagementStats(7); // Last 7 days
        if (data) {
            setStats(data.metrics);
            // Trigger AI Insights
            setInsightLoading(true);
            generateEngagementInsights(data.metrics).then(insights => {
                setAiInsights(insights);
                setInsightLoading(false);
            });
        }
    };

    if (loading || !stats) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" /></div>;

    // Charts Data Prep
    const notificationData = Object.entries(stats?.notifications?.byTone || {}).map(([name, value]) => ({ name, value }));
    const conversionData = [
        { name: 'Notification', value: stats?.conversions?.notification || 0, color: '#F97316' }, // Orange-500
        { name: 'AI Chat', value: stats?.conversions?.ai || 0, color: '#8B5CF6' }, // Violet-500
        { name: 'Organic', value: stats?.conversions?.organic || 0, color: '#10B981' } // Emerald-500
    ];

    const COLORS = ['#F97316', '#8B5CF6', '#10B981', '#F59E0B'];

    return (
        <div className="space-y-6">

            {/* 1. KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                    <div className="flex items-center gap-2 text-orange-600 mb-1">
                        <Bell size={18} /> <span className="text-xs font-bold uppercase">Notif. CTR</span>
                    </div>
                    <p className="text-2xl font-black text-gray-900">
                        {stats?.notifications?.sent > 0
                            ? ((stats.notifications.clicked / stats.notifications.sent) * 100).toFixed(1)
                            : 0}%
                    </p>
                    <p className="text-xs text-gray-500">{stats?.notifications?.clicked || 0} clicks / {stats?.notifications?.sent || 0} sent</p>
                </div>

                <div className="bg-violet-50 p-4 rounded-2xl border border-violet-100">
                    <div className="flex items-center gap-2 text-violet-600 mb-1">
                        <MessageSquare size={18} /> <span className="text-xs font-bold uppercase">AI Sessions</span>
                    </div>
                    <p className="text-2xl font-black text-gray-900">{stats?.ai?.sessions || 0}</p>
                    <p className="text-xs text-gray-500">{stats?.ai?.recommendationsClicked || 0} product clicks</p>
                </div>

                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                    <div className="flex items-center gap-2 text-emerald-600 mb-1">
                        <ShoppingBag size={18} /> <span className="text-xs font-bold uppercase">AI Sales</span>
                    </div>
                    <p className="text-2xl font-black text-gray-900">{stats?.conversions?.ai || 0}</p>
                    <p className="text-xs text-gray-500">Direct conversions</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                        <TrendingUp size={18} /> <span className="text-xs font-bold uppercase">Total Events</span>
                    </div>
                    <p className="text-2xl font-black text-gray-900">
                        {(stats?.notifications?.sent || 0) + (stats?.ai?.sessions || 0) + (stats?.conversions?.organic || 0)}
                    </p>
                </div>
            </div>

            {/* 2. Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Tone Performance */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm min-h-[300px]">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Sparkles size={20} className="text-yellow-500" /> Best Performing Tones
                    </h3>
                    {notificationData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={notificationData}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold' }} />
                                <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="value" fill="#F97316" radius={[6, 6, 0, 0]}>
                                    {notificationData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm font-bold">No data yet</div>
                    )}
                </div>

                {/* Conversion Source */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm min-h-[300px]">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <ShoppingBag size={20} className="text-green-500" /> Conversion Source
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={conversionData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {conversionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 3. AI Insights Panel */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <h3 className="font-bold text-lg mb-6 flex items-center gap-2 relative z-10">
                    <Bot className="text-orange-400" /> AI Growth Analyst
                </h3>

                {insightLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-white/50">
                        <Loader2 className="animate-spin" />
                        <span className="text-xs font-bold uppercase tracking-widest">Crunching Numbers...</span>
                    </div>
                ) : (
                    <div className="grid gap-4 relative z-10">
                        {aiInsights.length > 0 ? aiInsights.map((insight, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={idx}
                                className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    {insight.type?.includes('Action') ? <TrendingUp size={16} className="text-green-400" /> : <AlertCircle size={16} className="text-yellow-400" />}
                                    <h4 className="font-bold text-sm">{insight.title}</h4>
                                </div>
                                <p className="text-xs text-white/70 leading-relaxed pl-6">{insight.description}</p>
                            </motion.div>
                        )) : (
                            <p className="text-sm text-white/50">Not enough data to generate insights yet.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EngagementAnalytics;
