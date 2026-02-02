import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Package, Clock, ShoppingBag, ArrowRight, Home, Truck, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const MyOrders = () => {
    const { currentUser, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // If Auth is still loading, wait.
        if (authLoading) return;

        // If Auth is done but no user, stop loading orders
        if (!currentUser) {
            setLoading(false);
            return;
        }

        const fetchOrders = async () => {
            setLoading(true); // Start loading explicitly when fetch starts
            try {
                const q = query(
                    collection(db, "orders"),
                    where("userId", "==", currentUser.uid)
                );

                const querySnapshot = await getDocs(q);
                const ordersData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Client-side sorting (Newest first)
                ordersData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                setOrders(ordersData);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [currentUser, authLoading]);

    // Spacing Protocol: pt-32 for Navbar clearance
    const pageClasses = "min-h-screen pt-32 pb-20 px-4 md:px-8 bg-slate-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] relative z-0";

    // 1. Show Global Loader if Auth is initializing
    if (authLoading) {
        return (
            <div className={pageClasses}>
                <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600"></div>
                </div>
            </div>
        );
    }

    // 2. Show Login State only if Auth is DONE and User is NULL
    if (!currentUser) {
        return (
            <div className={pageClasses}>
                <div className="max-w-md mx-auto min-h-[50vh] flex flex-col items-center justify-center text-center p-8 bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl">
                    <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                        <ShoppingBag size={40} className="text-orange-400" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Login Required</h2>
                    <p className="text-gray-500 font-medium mb-8">Please sign in to view your order history.</p>
                    <div className="flex flex-col gap-3 w-full max-w-xs">
                        <Link to="/login" className="px-8 py-3 bg-orange-600 text-white font-bold rounded-xl shadow-lg hover:bg-orange-700 transition-all flex items-center justify-center gap-2">
                            Login Now <ArrowRight size={18} />
                        </Link>
                        <Link to="/track-order" className="px-8 py-3 bg-white border border-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                            Track Guest Order
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className={pageClasses}>
                <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600"></div>
                    <p className="text-gray-500 font-bold animate-pulse">Loading orders...</p>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className={pageClasses}>
                <div className="max-w-lg mx-auto min-h-[50vh] flex flex-col items-center justify-center text-center p-8">
                    <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-8 rotate-3 hover:rotate-0 transition-transform duration-500">
                        <Package size={48} className="text-orange-500" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-4">No Orders Yet</h2>
                    <p className="text-gray-500 font-medium text-lg mb-10 max-w-sm">
                        It looks like you haven't bought anything yet. Explore our collection and find something you love!
                    </p>
                    <Link to="/" className="px-10 py-4 bg-orange-600 text-white font-bold text-lg rounded-full shadow-xl shadow-orange-500/20 hover:bg-orange-700 hover:scale-105 transition-all flex items-center gap-2">
                        Start Shopping <ArrowRight size={20} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={pageClasses}>
            <div className="max-w-4xl mx-auto w-full">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                    <div>
                        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-orange-600 font-bold mb-4 transition-colors">
                            <Home size={16} /> Back to Home
                        </button>
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                            My Orders <span className="text-gray-300 text-2xl font-bold ml-2">({orders.length})</span>
                        </h1>
                    </div>

                    {/* Search/Filter Placeholder - Visual only for now */}
                    <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2 text-gray-400 w-full md:w-auto">
                        <Search size={18} className="ml-2" />
                        <input type="text" placeholder="Search orders..." className="bg-transparent outline-none text-sm font-bold text-gray-600 placeholder:text-gray-300 w-full md:w-48" />
                    </div>
                </div>

                <div className="space-y-8">
                    {orders?.map((order) => (
                        <div key={order.id} className="group bg-white/80 backdrop-blur-md rounded-3xl border border-white/60 shadow-lg shadow-gray-200/50 hover:shadow-orange-500/10 transition-all duration-300 overflow-hidden">

                            {/* Glass Header */}
                            <div className="px-6 py-5 bg-gradient-to-r from-gray-50/50 to-white border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-orange-100/50 flex items-center justify-center text-orange-600 font-black">
                                        #{(order.orderId || order.id).slice(-4)}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order ID</p>
                                        <p className="font-bold text-gray-900 select-all">#{order.orderId || order.id}</p>
                                    </div>
                                </div>
                                <div className={`shrink-0 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest border whitespace-nowrap ${order.status === 'Delivered' ? 'bg-green-50 text-green-600 border-green-100' :
                                    order.status === 'Cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
                                        'bg-orange-50 text-orange-600 border-orange-100'
                                    }`}>
                                    {order.status || 'Processing'}
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-6 md:p-8">
                                {/* Items List */}
                                <div className="space-y-4 mb-8">
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-2xl transition-colors">
                                            <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                                                <img src={item.image || item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                                                <p className="text-sm font-bold text-gray-400">Qty: {item.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-gray-900">₹{item.price * item.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Meta & Actions */}
                                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-dashed border-gray-200">
                                    <div className="flex items-center gap-6 w-full md:w-auto">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase">Ordered On</p>
                                            <div className="flex items-center gap-2 font-bold text-gray-700">
                                                <Clock size={16} className="text-orange-500" />
                                                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase">Total Amount</p>
                                            <p className="text-xl font-black text-gray-900">₹{order.total}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <Link
                                            to={`/order/${order.id}`}
                                            className="flex-1 md:flex-none px-6 py-3 bg-white border-2 border-gray-100 text-gray-700 hover:border-gray-300 hover:bg-gray-50 font-bold rounded-xl transition-all text-center"
                                        >
                                            View Details
                                        </Link>
                                        <Link
                                            to={`/track-order?orderId=${order.orderId || order.id}&email=${order.userEmail}`}
                                            state={{ orderId: order.orderId || order.id, email: order.userEmail }}
                                            className="flex-1 md:flex-none px-6 py-3 bg-gray-900 text-white hover:bg-orange-600 font-bold rounded-xl shadow-lg hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2 group"
                                        >
                                            Track Order <Truck size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>

                {/* Footer Safe Space */}
                <div className="h-10"></div>
            </div>
        </div >
    );
};

export default MyOrders;
