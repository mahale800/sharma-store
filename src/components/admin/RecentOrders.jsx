import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import Card from '../common/Card';
import { getStatusStyle } from '../../utils/orderStateMachine';

const RecentOrders = ({ orders = [], isLoading }) => {
    return (
        <Card className="border-white/60">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h3 className="font-black text-gray-900">Recent Orders</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Latest Activity</p>
                </div>
                <Link to="/admin/orders" className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-900">
                    <ArrowRight size={18} />
                </Link>
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="py-8 text-center text-gray-400 font-medium text-sm">No orders yet.</div>
            ) : (
                <div className="space-y-2">
                    {orders.map(order => {
                        const style = getStatusStyle(order.status);
                        const date = order.createdAt?.toDate
                            ? order.createdAt.toDate()
                            : new Date(order.createdAt);
                        const dateStr = !isNaN(date.getTime())
                            ? date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                            : 'N/A';

                        return (
                            <Link
                                key={order.id}
                                to={`/admin/orders/${order.id}`}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm text-gray-900">#{order.orderId}</span>
                                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${style.bg} ${style.text}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 truncate">{order.customer}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="font-black text-sm text-gray-900">₹{order.total}</p>
                                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                        <Clock size={10} />
                                        {dateStr}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </Card>
    );
};

export default RecentOrders;
