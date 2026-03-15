import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const SalesChart = ({ data }) => {
    return (
        <div className="bg-white/70 backdrop-blur-lg p-6 rounded-3xl border border-white/50 shadow-sm h-[400px]">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Sales Overview</h3>

            {(!data || data.length === 0) ? (
                <div className="h-full flex items-center justify-center text-gray-400 font-medium">
                    No sales data available yet.
                </div>
            ) : (

                <ResponsiveContainer width="100%" height="90%" minWidth={0} minHeight={0}>
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            tickFormatter={(value) => `₹${value}`}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value) => [`₹${value}`, 'Revenue']}
                        />
                        <Area
                            type="monotone"
                            dataKey="sales"
                            stroke="#f97316"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorSales)"
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default SalesChart;
