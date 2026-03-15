import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../common/Card';
import { Filter } from 'lucide-react';

const ConversionFunnel = ({ stats }) => {
    // Mock Funnel Data based on Order Statuses
    // In a real app, this would be: View Content -> Add to Cart -> Initiate Checkout -> Purchase
    // Here we visualize: Placed -> Processing -> Delivered

    // We don't have historical "Placed" count easily without querying all, so we'll approximate 
    // or just show the distribution of current order statuses as a "Health Funnel".

    const data = [
        { name: 'Total Orders', value: stats?.totalOrders || 0, fill: '#c2410c' }, // Orange-800
        { name: 'Processing', value: (stats?.totalOrders || 0) - (stats?.pendingOrders || 0), fill: '#ea580c' }, // Orange-600
        { name: 'Delivered', value: stats?.deliveredOrders || 0, fill: '#f97316' }, // Orange-500
    ];

    return (
        <Card className="h-full min-h-[300px] flex flex-col">
            <div className="mb-6">
                <h3 className="font-black text-gray-900 flex items-center gap-2">
                    <Filter size={20} className="text-orange-500" />
                    Order Fulfillment Funnel
                </h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Efficiency Metrics</p>
            </div>

            <div className="flex-1 w-full min-h-[200px] flex flex-col justify-center space-y-4">
                {data.map((item, index) => {
                    // Caclulate strict percentage based on previous step to look like a funnel
                    // But here, let's just use percentage of Total
                    const max = data[0].value || 1;
                    const percent = Math.round((item.value / max) * 100);

                    return (
                        <div key={item.name} className="relative">
                            <div className="flex justify-between text-sm font-bold text-gray-700 mb-1 z-10 relative">
                                <span>{item.name}</span>
                                <span>{item.value} ({percent}%)</span>
                            </div>
                            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{
                                        width: `${percent}%`,
                                        backgroundColor: item.fill
                                    }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                    <strong>Insight:</strong> {(data[2].value / (data[0].value || 1) * 100).toFixed(1)}% of all orders have been successfully delivered.
                </p>
            </div>
        </Card>
    );
};

export default ConversionFunnel;
