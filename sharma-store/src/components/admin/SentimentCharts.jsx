import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { usePerformance } from '../../hooks/usePerformance';

const COLORS = {
    Positive: '#22c55e', // green-500
    Neutral: '#f59e0b', // amber-500
    Negative: '#ef4444' // red-500
};

const SentimentCharts = ({ feedbackList = [] }) => {

    // 1. Process Data for Pie Chart (Overall Sentiment)
    const pieData = useMemo(() => {
        const counts = { Positive: 0, Neutral: 0, Negative: 0 };
        feedbackList.forEach(f => {
            if (f.sentiment && counts[f.sentiment] !== undefined) {
                counts[f.sentiment]++;
            }
        });
        return Object.keys(counts).map(key => ({ name: key, value: counts[key] })).filter(d => d.value > 0);
    }, [feedbackList]);

    // 2. Process Data for Bar Chart (Sentiment by Page)
    const barData = useMemo(() => {
        const pageMap = {};

        feedbackList.forEach(f => {
            const page = f.page || 'Unknown';
            if (!pageMap[page]) pageMap[page] = { page, Positive: 0, Neutral: 0, Negative: 0 };
            if (f.sentiment) pageMap[page][f.sentiment]++;
        });

        return Object.values(pageMap).sort((a, b) => (b.Positive + b.Negative + b.Neutral) - (a.Positive + a.Negative + a.Neutral)).slice(0, 5); // Top 5 pages
    }, [feedbackList]);

    const { shouldAnimate } = usePerformance();

    if (pieData.length === 0) return null;

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 ${shouldAnimate ? 'animate-in fade-in duration-500' : ''}`}>

            {/* Pie Chart: Overall Sentiment */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4">Overall Sentiment</h3>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bar Chart: Sentiment by Page */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4">Sentiment by Page</h3>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={barData}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="page" width={100} tick={{ fontSize: 10 }} interval={0} />
                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            <Legend />
                            <Bar dataKey="Positive" stackId="a" fill={COLORS.Positive} radius={[0, 4, 4, 0]} />
                            <Bar dataKey="Neutral" stackId="a" fill={COLORS.Neutral} />
                            <Bar dataKey="Negative" stackId="a" fill={COLORS.Negative} radius={[4, 0, 0, 4]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default SentimentCharts;
