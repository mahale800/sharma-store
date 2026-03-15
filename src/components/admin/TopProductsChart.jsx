import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Card from '../common/Card';
import { TrendingUp } from 'lucide-react';

const TopProductsChart = ({ products, isLoading }) => {
    // Take top 5 products by revenue
    const data = (products || [])
        .slice(0, 5)
        .map(p => ({
            name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
            fullName: p.name,
            revenue: p.revenue,
            units: p.unitsSold
        }));

    const colors = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5'];

    if (isLoading) {
        return (
            <Card className="h-full min-h-[300px] flex flex-col">
                 <div className="mb-6">
                     <h3 className="font-black text-gray-900 flex items-center gap-2">
                         <TrendingUp size={20} className="text-gray-300" />
                         <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                     </h3>
                     <div className="h-3 bg-gray-200 rounded w-1/3 mt-2 animate-pulse"></div>
                 </div>
                 <div className="flex-1 w-full min-h-[250px] flex flex-col gap-4 justify-center">
                     {[1, 2, 3, 4, 5].map((i) => (
                         <div key={i} className="flex items-center gap-4">
                             <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                             <div className={`h-6 bg-orange-100 rounded animate-pulse`} style={{ width: `${100 - (i * 15)}%` }}></div>
                         </div>
                     ))}
                 </div>
            </Card>
        );
    }

    if (data.length === 0) return null;

    return (
        <Card className="h-full min-h-[300px] flex flex-col">
            <div className="mb-6">
                <h3 className="font-black text-gray-900 flex items-center gap-2">
                    <TrendingUp size={20} className="text-orange-500" />
                    Top Revenue Generators
                </h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Best Selling Products</p>
            </div>

            <div className="flex-1 w-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }}
                            width={100}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={24}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default TopProductsChart;
