import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore';
import { Search, ShoppingBag, Eye, Truck, CheckCircle, Clock, XCircle, AlertCircle, ArrowUpRight, Filter, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/common/Card';
import { getNextStates, getStatusStyle, ORDER_STATUSES } from '../../utils/orderStateMachine';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const navigate = useNavigate();

    useEffect(() => {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleStatusUpdate = async (e, orderId) => {
        e.stopPropagation();
        const newStatus = e.target.value;
        const targetOrder = orders.find(o => o.id === orderId);
        
        try {
            await updateDoc(doc(db, "orders", orderId), {
                status: newStatus,
                updatedAt: new Date()
            });
            
            // Notify User
            if ((newStatus === 'Shipped' || newStatus === 'Delivered') && targetOrder?.userId) {
                await addDoc(collection(db, 'notifications'), {
                    userId: targetOrder.userId,
                    type: 'order',
                    title: 'Sharma Store',
                    body: `Your order #${targetOrder.orderId || orderId.slice(0, 8)} has been ${newStatus.toLowerCase()}!`,
                    read: false,
                    createdAt: new Date().toISOString(),
                    tone: 'Excited'
                });
            }
        } catch (error) { console.error("Update failed", error); }
    };

    const statusStyle = (status) => getStatusStyle(status);

    const filteredOrders = orders.filter(order => {
        const customerName = order.address?.fullName || 'Guest';
        const customerEmail = order.userEmail || '';
        const matchesSearch = (order.orderId || order.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
            customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

        return (filterStatus === 'All' || order.status === filterStatus) && matchesSearch;
    });

    if (loading) return (
        <div className="flex bg-white/50 h-[60vh] items-center justify-center rounded-3xl">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600"></div>
        </div>
    );

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Orders</h1>
                    <p className="text-sm font-medium text-gray-500">Manage and track customer orders.</p>
                </div>
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-100 shadow-sm overflow-x-auto max-w-full">
                    {['All', ...ORDER_STATUSES].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wide transition-all ${filterStatus === status ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search */}
            <Card className="p-2 border border-white/60 shadow-sm relative z-20">
                <div className="relative">
                    <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by Order ID, Customer Name, or Email..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/50 rounded-xl font-bold text-gray-900 outline-none focus:bg-white transition-colors"
                    />
                </div>
            </Card>

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-20 opacity-50 flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                            <ShoppingBag size={32} />
                        </div>
                        <p className="font-bold text-gray-500 text-lg">No orders found</p>
                        <p className="text-sm text-gray-400">Try adjusting your filters.</p>
                    </div>
                ) : (
                    filteredOrders.map(order => {
                        const style = statusStyle(order.status);

                        return (
                            <Card
                                key={order.id}
                                onClick={() => navigate(`/admin/orders/${order.id}`)}
                                hoverable
                                className="group p-0 overflow-hidden cursor-pointer border border-white/60 hover:border-orange-200 transition-all active:scale-[0.99]"
                            >
                                <div className="p-5 flex flex-col md:flex-row items-start md:items-center gap-6">

                                    {/* Icon Box */}
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${style.bg} ${style.text} shadow-inner shrink-0`}>
                                        <ShoppingBag size={28} strokeWidth={2.5} />
                                    </div>

                                    {/* Order Info */}
                                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-black text-gray-900 text-lg">#{order.orderId || order.id.slice(0, 8)}</h3>
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${style.bg} ${style.text} border ${style.border}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                                <span className="truncate max-w-[150px]">{order.address?.fullName || order.userEmail || 'Guest User'}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                <span>{order.createdAt ? (order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : new Date(order.createdAt).toLocaleDateString()) : 'N/A'}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-8">
                                            <div className="text-right">
                                                <p className="text-xl font-black text-gray-900">₹{order.total}</p>
                                                <p className={`text-[10px] font-bold uppercase ${order.isPaid ? 'text-green-600' : 'text-orange-500'}`}>
                                                    {order.isPaid ? 'Paid Online' : 'COD'}
                                                </p>
                                            </div>

                                            {/* Quick Actions */}
                                            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                                <div className="relative group/select">
                                                    <select
                                                        value={order.status}
                                                        onChange={e => handleStatusUpdate(e, order.id)}
                                                        className={`appearance-none pl-4 pr-10 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide cursor-pointer outline-none transition-all hover:brightness-95 bg-gray-50 text-gray-600 border border-gray-100 hover:bg-white hover:border-gray-200 hover:shadow-sm`}
                                                    >
                                                        {getNextStates(order.status).length > 0 ? (
                                                            <>
                                                                <option value={order.status}>{order.status}</option>
                                                                {getNextStates(order.status).map(s => <option key={s} value={s}>{s}</option>)}
                                                            </>
                                                        ) : (
                                                            <option value={order.status}>{order.status} (Final)</option>
                                                        )}
                                                    </select>
                                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                </div>
                                                <Button size="icon" variant="ghost" onClick={() => navigate(`/admin/orders/${order.id}`)} className="bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900">
                                                    <ArrowUpRight size={18} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Orders;
