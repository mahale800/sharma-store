import React from 'react';
import StatsCard from './StatsCard';
import { DollarSign, ShoppingBag, Package, Users } from 'lucide-react';

const StatsCards = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
                title="Total Revenue"
                value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`}
                icon={DollarSign}
                color="bg-green-500 shadow-green-500/30"
            />
            <StatsCard
                title="Total Orders"
                value={stats?.totalOrders || 0}
                icon={ShoppingBag}
                color="bg-blue-500 shadow-blue-500/30"
            />
            <StatsCard
                title="Pending Orders"
                value={stats?.pendingOrders || 0}
                icon={Package}
                color="bg-orange-500 shadow-orange-500/30"
            />
            <StatsCard
                title="Total Customers"
                value={stats?.totalCustomers || 0}
                icon={Users}
                color="bg-purple-500 shadow-purple-500/30"
            />
        </div>
    );
};

export default StatsCards;
