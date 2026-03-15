import React from 'react';
import { ArrowUpRight, Package, User, Clock, CheckCircle, Truck, XCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RecentOrders = ({ orders }) => {
    const navigate = useNavigate();

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle };
            case 'processing': return { color: 'text-orange-600', bg: 'bg-orange-100', icon: Clock };
            case 'shipped': return { color: 'text-blue-600', bg: 'bg-blue-100', icon: Truck };
            case 'cancelled': return { color: 'text-red-600', bg: 'bg-red-100', icon: XCircle };
            default: return { color: 'text-gray-600', bg: 'bg-gray-100', icon: AlertCircle };
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-black text-gray-900">Recent Orders</h3>
                <button
                    onClick={() => navigate('/admin/orders')}
                    className="flex items-center gap-1 text-sm font-bold text-primary hover:text-orange-700 transition-colors"
                >
                    View All <ArrowUpRight size={16} />
                </button>
            </div>

            <div className="space-y-3">
                {(!orders || orders.length === 0) ? (
                    <div className="frosted-paper p-8 rounded-3xl text-center text-gray-500 font-medium">
                        No orders yet.
                    </div>
                ) : (
                    orders.map((order) => {
                        const statusStyle = getStatusStyle(order.status);
                        const StatusIcon = statusStyle.icon;

                        return (
                            <div
                                key={order.id}
                                onClick={() => navigate(`/admin/orders/${order.id}`)}
                                className="frosted-paper group p-4 rounded-3xl border border-white/60 shadow-sm hover:shadow-lg hover:scale-[1.01] transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                                {/* Left: ID & User */}
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl ${statusStyle.bg} ${statusStyle.color} flex items-center justify-center shadow-sm`}>
                                        <Package size={20} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-gray-900">#{order.id.slice(-6).toUpperCase()}</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${statusStyle.bg} ${statusStyle.color}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-gray-500 font-medium mt-0.5">
                                            <User size={12} /> {order.customerName || order.email || 'Guest'}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Price & Date (Hidden on mobile maybe? No, keep it) */}
                                <div className="flex items-center justify-between md:justify-end gap-6 pl-16 md:pl-0">
                                    <div className="text-right">
                                        <p className="font-black text-gray-900 text-lg">
                                            {typeof order.total === 'number' ? `₹${order.total.toLocaleString()}` : order.total}
                                        </p>
                                        <p className="text-xs text-gray-400 font-bold">
                                            {order.items?.length || 0} Items
                                        </p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-primary group-hover:text-white transition-colors">
                                        <ArrowUpRight size={18} />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default RecentOrders;
