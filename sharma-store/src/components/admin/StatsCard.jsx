import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color = "bg-orange-500" }) => {
    return (
        <div className="bg-white/70 backdrop-blur-lg border border-white/50 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all group">
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
        </div>
    );
};

export default StatsCard;
