import React from 'react';
import Card from '../common/Card';

// eslint-disable-next-line no-unused-vars
const StatsCard = ({ title, value, icon: Icon, color = "bg-orange-500" }) => {
    return (
        <Card className="p-6 transition-all group hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${color}`}>
                    <Icon size={24} />
                </div>
                {/* Optional: Add percentage trend here if available */}
            </div>
            <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{title}</p>
                <h3 className="text-3xl font-black text-gray-900 mt-1">{value}</h3>
            </div>
        </Card>
    );
};

export default StatsCard;
