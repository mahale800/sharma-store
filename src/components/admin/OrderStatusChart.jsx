import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Card from '../common/Card';
import { BarChart3 } from 'lucide-react';

const STATUS_COLORS = {
    Pending: '#eab308',
    Confirmed: '#6366f1',
    Processing: '#3b82f6',
    Shipped: '#a855f7',
    Delivered: '#22c55e',
    Cancelled: '#ef4444',
};

const OrderStatusChart = ({ data = [], isLoading }) => {
    const total = data.reduce((sum, d) => sum + d.value, 0);

    return (
        <Card className="h-full min-h-[350px] flex flex-col">
            <div className="mb-4">
                <h3 className="font-black text-gray-900 flex items-center gap-2">
                    <BarChart3 size={20} className="text-orange-500" />
                    Order Status
                </h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Distribution Breakdown</p>
            </div>

            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border-4 border-gray-100 border-t-orange-500 animate-spin"></div>
                </div>
            ) : data.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-gray-400 font-medium text-sm">
                    No order data yet.
                </div>
            ) : (
                <>
                    <div className="flex-1 min-h-[180px]">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={3}
                                    dataKey="value"
                                    strokeWidth={0}
                                >
                                    {data.map((entry) => (
                                        <Cell
                                            key={entry.name}
                                            fill={STATUS_COLORS[entry.name] || '#9ca3af'}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value, name) => [`${value} orders`, name]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {data.map((entry) => (
                            <div key={entry.name} className="flex items-center gap-2 text-xs">
                                <div
                                    className="w-3 h-3 rounded-full shrink-0"
                                    style={{ backgroundColor: STATUS_COLORS[entry.name] || '#9ca3af' }}
                                />
                                <span className="text-gray-600 font-bold">{entry.name}</span>
                                <span className="text-gray-400 ml-auto font-black">
                                    {total > 0 ? Math.round((entry.value / total) * 100) : 0}%
                                </span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </Card>
    );
};

export default OrderStatusChart;
