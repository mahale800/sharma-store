import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Search, ShoppingBag, Eye, Truck, CheckCircle, Clock, XCircle, AlertCircle, ArrowUpRight, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
        try {
            await updateDoc(doc(db, "orders", orderId), { status: newStatus });
        } catch (error) { console.error("Update failed", error); }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Delivered': return { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle };
            case 'Processing': return { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock };
            case 'Shipped': return { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: Truck };
            case 'Cancelled': return { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle };
            default: return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: AlertCircle };
        }
    };

    const filteredOrders = orders.filter(order => {
        const customerName = order.address?.fullName || 'Guest';
        const customerEmail = order.userEmail || '';
        const matchesSearch = (order.orderId || order.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
            customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

        return (filterStatus === 'All' || order.status === filterStatus) && matchesSearch;
    });

    if (loading) return <div className="flex h-96 items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="space-y-8">
            {/* ... (Header/Controls unchanged) ... */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Orders</h1>
                <p className="text-sm font-medium text-gray-500">Manage and track customer orders.</p>
            </div>

            {/* Controls */}
            <div className="frosted-paper p-2 rounded-2xl border border-white/60 shadow-sm flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/50 rounded-xl font-bold text-gray-900 outline-none focus:bg-white transition-colors"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 px-2 md:px-0 no-scrollbar">
                    {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wide whitespace-nowrap transition-all ${filterStatus === status ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white/50 text-gray-500 hover:bg-white'}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Glass Rows List */}
            <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <ShoppingBag size={48} className="mx-auto mb-4" />
                        <p className="font-bold">No orders found</p>
                    </div>
                ) : (
                    filteredOrders.map(order => {
                        const style = getStatusStyle(order.status);
                        const Icon = style.icon;

                        return (
                            <div
                                key={order.id}
                                onClick={() => navigate(`/admin/orders/${order.id}`)}
                                className="frosted-paper p-5 rounded-3xl border border-white/60 shadow-sm hover:shadow-xl hover:scale-[1.01] hover:border-orange-500/30 transition-all cursor-pointer group active:scale-[0.99]"
                            >
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">

                                    {/* Icon Box */}
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${style.bg} ${style.text} shadow-inner`}>
                                        <Icon size={24} strokeWidth={2.5} />
                                    </div>

                                    {/* Main Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-black text-gray-900 text-lg">#{order.orderId || order.id}</h3>
                                            <span className="text-xs text-gray-400 font-bold">{order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                            <span>{order.address?.fullName || order.userEmail || 'Guest'}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                            <span>{order.items?.length || 0} Items</span>
                                        </div>
                                    </div>

                                    {/* Status & Price */}
                                    <div className="flex items-center justify-between w-full md:w-auto gap-6 mt-4 md:mt-0 pl-16 md:pl-0">
                                        <div className="relative group/select">
                                            <select
                                                value={order.status}
                                                onClick={e => e.stopPropagation()}
                                                onChange={e => handleStatusUpdate(e, order.id)}
                                                className={`appearance-none pl-4 pr-10 py-2 rounded-xl text-xs font-black uppercase tracking-wide cursor-pointer outline-none transition-all hover:brightness-95 ${style.bg} ${style.text}`}
                                            >
                                                {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${style.text}`}>▼</div>
                                        </div>

                                        <div className="text-right min-w-[100px]">
                                            <p className="text-xl font-black text-gray-900">₹{order.total}</p>
                                            <p className={`text-[10px] font-bold ${order.isPaid ? 'text-green-600' : 'text-orange-500'}`}>{order.isPaid ? 'PAID ONLINE' : 'COD'}</p>
                                        </div>

                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-300 group-hover:bg-gray-900 group-hover:text-white transition-all shadow-sm">
                                            <ArrowUpRight size={20} />
                                        </div>
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

export default Orders;
