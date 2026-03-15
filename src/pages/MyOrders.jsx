import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Package, Clock, ShoppingBag, ArrowRight, Home, Truck, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/common/Card';
import { getStatusStyle } from '../utils/orderStateMachine';

const MyOrders = ({ isComponent }) => {
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
                ordersData.sort((a, b) => {
                    const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                    const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                    return dateB - dateA;
                });

                setOrders(ordersData);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [currentUser, authLoading]);

    // Spacing Protocol: Handled globally by PublicLayout
    const pageClasses = isComponent 
        ? "w-full min-h-[50vh] relative z-0" 
        : "w-full pb-8 px-4 md:px-8 bg-slate-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] relative z-0";

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
                <Card className="max-w-md mx-auto min-h-[50vh] flex flex-col items-center justify-center text-center p-8 shadow-xl">
                    <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                        <ShoppingBag size={40} className="text-orange-400" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Login Required</h2>
                    <p className="text-gray-500 font-medium mb-8">Please sign in to view your order history.</p>
                    <div className="flex flex-col gap-3 w-full max-w-xs">
                        <Link to="/login">
                            <Button variant="primary" className="w-full gap-2">
                                Login Now <ArrowRight size={18} />
                            </Button>
                        </Link>
                        <Link to="/track-order">
                            <Button variant="secondary" className="w-full gap-2">
                                Track Guest Order
                            </Button>
                        </Link>
                    </div>
                </Card>
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
                    <Link to="/">
                        <Button variant="primary" size="lg" className="rounded-full shadow-xl gap-2 hover:scale-105">
                            Start Shopping <ArrowRight size={20} />
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={pageClasses}>
            <div className="max-w-4xl mx-auto w-full">

                {/* Header Section */}
                {!isComponent && (
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                        <div>
                            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mb-4 text-gray-500 pl-0 hover:bg-transparent hover:text-orange-600 gap-2">
                                <Home size={16} /> Back to Home
                            </Button>
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
                )}

                <div className="space-y-8">
                    {orders?.map((order) => (
                        <Card key={order.id} className="group p-0 overflow-hidden shadow-lg shadow-gray-200/50 hover:shadow-orange-500/10 rounded-3xl border-gray-100">

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
                                <div className={`shrink-0 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest border whitespace-nowrap ${getStatusStyle(order.status).bg} ${getStatusStyle(order.status).text} ${getStatusStyle(order.status).border}`}>
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
                                                {(() => {
                                                    const date = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
                                                    return date.toLocaleDateString("en-IN", {
                                                        day: 'numeric', month: 'short', year: 'numeric'
                                                    });
                                                })()}
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
                                            className="flex-1 md:flex-none"
                                        >
                                            <Button variant="secondary" className="w-full">
                                                View Details
                                            </Button>
                                        </Link>
                                        <Link
                                            to={`/track-order?orderId=${order.orderId || order.id}&email=${order.userEmail}`}
                                            state={{ orderId: order.orderId || order.id, email: order.userEmail }}
                                            className="flex-1 md:flex-none"
                                        >
                                            <Button variant="primary" className="w-full gap-2 shadow-lg shadow-orange-500/30">
                                                Track Order <Truck size={18} />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                        </Card>
                    ))}
                </div>

                {/* Footer Safe Space */}
                <div className="h-10"></div>
            </div>
        </div >
    );
};

export default MyOrders;
