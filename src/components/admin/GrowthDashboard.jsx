import React, { useEffect, useState } from 'react';
import { useEngagement } from '../../hooks/useEngagement';
import { generateEngagementInsights } from '../../services/aiService'; // Reusing or creating new one?
// We might need a specific growth insight generator.
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, DollarSign, Activity, Zap, Award, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const GrowthDashboard = () => {
    const { getEngagementStats, loading } = useEngagement();
    const [metrics, setMetrics] = useState(null);

    const processGrowthMetrics = (data) => {
        // Safe access to deep properties
        const sessions = data?.metrics?.ai?.sessions || 0;

        return {
            mau: 1240 + sessions,
            revenue: { current: 452000, grow: 12 },
            retention: 68,
            aiImpact: 24,
            cohorts: [
                { week: 'W1', retention: [100, 60, 45, 40] },
                { week: 'W2', retention: [100, 65, 50] },
                { week: 'W3', retention: [100, 70] },
                { week: 'W4', retention: [100] },
            ]
        };
    };

    useEffect(() => {
        // In a real app, this would fetch specific Growth API endpoints.
        // For now, we derive from engagement stats + mock some investor data to illustrate the UI.
        const fetchData = async () => {
            const data = await getEngagementStats(30); // 30 Days for growth
            if (data) {
                setMetrics(processGrowthMetrics(data));
            }
        };
        fetchData();
    }, []);

    if (!metrics) return <div className="p-12 text-center text-gray-400">Loading Growth Engine...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* 1. North Star Metrics (Investor View) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <MetricCard
                    title="Monthly Active Users"
                    value={metrics.mau.toLocaleString()}
                    trend="+5.4%"
                    icon={Users}
                />
                <MetricCard
                    title="Revenue Run Rate"
                    value={`₹${(metrics.revenue.current / 1000).toFixed(1)}k`}
                    trend="+12%"
                    isMoney
                    icon={DollarSign}
                />
                <MetricCard
                    title="D30 Retention"
                    value={`${metrics.retention}%`}
                    trend="+2.1%"
                    icon={Activity}
                />
                <MetricCard
                    title="AI Lift"
                    value={`${metrics.aiImpact}%`}
                    sub="orders touched by AI"
                    icon={Zap}
                    color="text-violet-600"
                />
            </div>

            {/* 2. Cohort Retention Heatmap */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Cohort Retention Analysis</h3>
                        <p className="text-sm text-gray-500">User retention by signup week</p>
                    </div>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Strong &gt; 60%</span>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">Avg 40-60%</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="text-gray-400 border-b border-gray-100">
                                <th className="pb-4 font-medium">Cohort</th>
                                <th className="pb-4 font-medium">Users</th>
                                <th className="pb-4 font-medium">Week 0</th>
                                <th className="pb-4 font-medium">Week 1</th>
                                <th className="pb-4 font-medium">Week 2</th>
                                <th className="pb-4 font-medium">Week 3</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {metrics.cohorts.map((cohort, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 font-bold text-gray-900">{cohort.week}</td>
                                    <td className="py-4 text-gray-500">142</td>
                                    {cohort.retention.map((val, i) => (
                                        <td key={i} className="py-4">
                                            <div
                                                className={`w-12 h-8 flex items-center justify-center rounded-lg text-xs font-bold ${getHeatmapColor(val)}`}
                                            >
                                                {val}%
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 3. Growth Charts & AI Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-orange-500" /> Revenue Growth
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[
                                { name: 'W1', value: 4000 },
                                { name: 'W2', value: 3000 },
                                { name: 'W3', value: 5000 },
                                { name: 'W4', value: 4500 },
                                { name: 'W5', value: 6000 },
                                { name: 'W6', value: 7500 },
                            ]}>
                                <defs>
                                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F97316" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Area type="monotone" dataKey="value" stroke="#F97316" fillOpacity={1} fill="url(#colorVal)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-900 p-8 rounded-3xl text-white relative overflow-hidden flex flex-col justify-between">
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Zap className="text-yellow-400 fill-yellow-400" /> Executive AI Summary
                        </h3>
                        <p className="text-slate-300 text-sm leading-relaxed mb-6">
                            "Sharma Store is showing <strong className="text-white">strong product-market fit</strong> with a 68% retention rate.
                            AI-driven nudges account for <strong className="text-white">24% of revenue lift</strong>.
                            <br /><br />
                            Warning: Week 2 retention dip suggests onboarding friction.
                            <br /><br />
                            Recommendation: Scale 'Friendly' tone experiments."
                        </p>
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            Live Assessment
                        </div>
                    </div>

                    {/* Decor */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl"></div>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, trend, isMoney, icon: Icon, sub, color = "text-gray-900" }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 bg-gray-50 rounded-xl ${color}`}>
                <Icon size={20} />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${trend.includes('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {trend.includes('+') ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {trend}
                </div>
            )}
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
            <h4 className="text-3xl font-black text-gray-900 tracking-tight">{value}</h4>
            {sub && <p className="text-xs text-gray-400 mt-2 font-medium">{sub}</p>}
        </div>
    </div>
);

const getHeatmapColor = (val) => {
    if (val >= 80) return 'bg-green-100 text-green-800';
    if (val >= 60) return 'bg-emerald-50 text-emerald-800';
    if (val >= 40) return 'bg-yellow-50 text-yellow-800';
    return 'bg-red-50 text-red-800';
};

export default GrowthDashboard;
