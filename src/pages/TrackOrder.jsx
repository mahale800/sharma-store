import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Search, AlertCircle, Check, Home } from 'lucide-react';
import { Link, useLocation, useSearchParams, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ORDER_STEPS, getStepIndex, getStatusStyle } from '../utils/orderStateMachine';
import { createMapsUrl, createWhatsAppUrl } from '../data/shopProfile';
import { useStoreSettings } from '../context/StoreSettingsContext';

const TrackOrder = () => {
    const { orderId: paramOrderId } = useParams();
    const { currentUser } = useAuth();
    const { storeProfile } = useStoreSettings();
    const [searchParams, setSearchParams] = useState({ orderId: '', email: '' });
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const location = useLocation();
    const [urlParams, setUrlParams] = useSearchParams();

    // Auto-fill and Search from URL or State
    useEffect(() => {
        const queryOrderId = urlParams.get('orderId');
        const queryEmail = urlParams.get('email');
        const stateOrderId = location.state?.orderId;
        const stateEmail = location.state?.email;

        // Priority: Route Param > Query Param > State
        const effectiveOrderId = paramOrderId || queryOrderId || stateOrderId;
        // Priority: Param > State > CurrentUser
        const effectiveEmail = queryEmail || stateEmail || currentUser?.email;

        if (effectiveOrderId) {
            // Update inputs even if we auto-fetch
            setSearchParams({
                orderId: effectiveOrderId,
                email: effectiveEmail || ''
            });

            // Auto-fetch if:
            // 1. We have both ID and Email
            // 2. We have ID and User is Logged In (we can check userId match)
            if (effectiveEmail || currentUser) {
                fetchOrder(effectiveOrderId, effectiveEmail);
            }
        }
    }, [location.state, urlParams, currentUser, paramOrderId, fetchOrder]);

    // Independent Fetcher to allow useEffect to call it
    const fetchOrder = React.useCallback(async (oid, uemail) => {
        setLoading(true);
        setError(null);
        try {
            // 1. Try finding by matching 'orderId' field
            const q = query(
                collection(db, "orders"),
                where("orderId", "==", oid)
            );
            const querySnapshot = await getDocs(q);

            let docSnap = null;
            if (!querySnapshot.empty) {
                docSnap = querySnapshot.docs[0];
            } else {
                // 2. Fallback: Doc ID
                const docRef = doc(db, "orders", oid);
                const ds = await getDoc(docRef);
                if (ds.exists()) docSnap = ds;
            }

            if (docSnap && docSnap.exists()) {
                const data = docSnap.data();

                // AUTH CHECK:
                // 1. If Logged In & User ID matches -> Allow
                // 2. Else -> Require Email Match
                const isOwner = currentUser && data.userId === currentUser.uid;
                const orderEmail = (data.userEmail || data.shippingAddress?.email || data.email || '').toLowerCase();
                const searchEmail = (uemail || '').toLowerCase();

                if (isOwner || (searchEmail && orderEmail === searchEmail)) {
                    setOrder({ id: docSnap.id, ...data });
                } else {
                    setError("Order found, but you are not authorized to view it. Verification failed.");
                }
            } else {
                setError("Order not found.");
            }
        } catch {
            setError("Failed to track order.");
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    // Trigger Fetch if params are present on mount
    useEffect(() => {
        const oid = urlParams.get('orderId') || location.state?.orderId;
        const email = urlParams.get('email') || location.state?.email;

        if (oid && (email || currentUser)) {
            // Re-run logic will be handled by the main useEffect above due to deps
            // checking currentUser there is safer.
        }
    }, [urlParams, location.state, currentUser]); // Run once on mount (reload/nav)

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        setError(null);
        setOrder(null);
        setLoading(true);

        const orderIdToSearch = searchParams.orderId;
        const emailToSearch = searchParams.email;

        // Update URL to make it shareable/persistent if triggered manually
        setUrlParams({ orderId: orderIdToSearch, email: emailToSearch });

        try {
            // Trim and clean input
            const orderId = orderIdToSearch.trim();
            const email = emailToSearch.trim().toLowerCase();

            if (!orderId) {
                throw new Error("Please enter an Order ID.");
            }
            if (!email && !currentUser) {
                throw new Error("Please enter Email Address.");
            }

            // 1. Try finding by matching 'orderId' field (New readable ID)
            const q = query(
                collection(db, "orders"),
                where("orderId", "==", orderId)
            );
            const querySnapshot = await getDocs(q);

            let docSnap = null;
            if (!querySnapshot.empty) {
                docSnap = querySnapshot.docs[0];
            } else {
                // 2. Fallback: Try finding by Document ID (Old style)
                const docRef = doc(db, "orders", orderId);
                const ds = await getDoc(docRef);
                if (ds.exists()) {
                    docSnap = ds;
                }
            }

            if (docSnap && docSnap.exists()) {
                const data = docSnap.data();

                const isOwner = currentUser && data.userId === currentUser.uid;
                const orderEmail = (data.userEmail || data.shippingAddress?.email || data.email || '').toLowerCase();

                if (isOwner || (email && orderEmail === email)) {
                    setOrder({ id: docSnap.id, ...data });
                } else {
                    setError("Order found, but you are not authorized to view it.");
                }
            } else {
                setError("Order not found. Please check the ID.");
            }
        } catch (err) {
            setError(err.message || "Failed to track order.");
        } finally {
            setLoading(false);
        }
    };

    const steps = ORDER_STEPS;

    return (
        <div className="w-full pb-8 bg-slate-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
            <div className="max-w-3xl mx-auto">

                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Track Your Order</h1>
                    <p className="text-gray-500 font-medium">Enter your Order ID and Email to see real-time updates.</p>
                </div>

                <div className="mb-8 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Store Support</p>
                    <p className="text-sm font-bold text-gray-900">{storeProfile.fullAddress}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm font-bold">
                        <a href={`tel:+91${storeProfile.primaryPhone}`} className="text-orange-600 hover:text-orange-700">+91 {storeProfile.primaryPhone}</a>
                        <a href={`tel:+91${storeProfile.secondaryPhone}`} className="text-orange-600 hover:text-orange-700">+91 {storeProfile.secondaryPhone}</a>
                        <a href={createWhatsAppUrl(storeProfile, 'Hi Sharma Stores, I need help tracking my order.')} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700">WhatsApp Support</a>
                        <a href={createMapsUrl(storeProfile)} target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:text-slate-900">Get Directions</a>
                    </div>
                </div>

                {/* Search Form */}
                <div className="frosted-paper p-8 rounded-3xl border border-white/60 shadow-xl shadow-orange-500/5 mb-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                    <form onSubmit={handleSearch} className="relative z-10 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Order ID</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 7A2B9C..."
                                    value={searchParams.orderId}
                                    onChange={e => setSearchParams({ ...searchParams, orderId: e.target.value })}
                                    className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:font-normal"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="used during checkout"
                                    value={searchParams.email}
                                    onChange={e => setSearchParams({ ...searchParams, email: e.target.value })}
                                    className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:font-normal"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search size={20} />}
                            Track Order
                        </button>
                    </form>
                </div>

                {/* Error State */}
                {error && (
                    <div className="animate-fade-in-up bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 border border-red-100 mb-8 font-bold">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                {/* Order Result */}
                {order && (
                    <div className="animate-fade-in-up space-y-6">
                        {/* Status Card */}
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900">Order Status</h2>
                                    <p className="text-sm text-gray-500 font-bold mt-1">Last updated: {new Date().toLocaleTimeString()}</p>
                                </div>
                                <div className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wide ${getStatusStyle(order.status).bg} ${getStatusStyle(order.status).text}`}>
                                    {order.status || 'Processing'}
                                </div>
                            </div>

                            {/* Stepper */}
                            <div className="relative mb-8">
                                <div className="absolute top-3 left-0 w-full h-1 bg-gray-100 rounded-full"></div>
                                <div
                                    className="absolute top-3 left-0 h-1 bg-green-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${Math.min((getStepIndex(order.status) / (steps.length - 1)) * 100, 100)}%` }}
                                ></div>
                                <div className="relative z-10 flex justify-between">
                                    {steps.map((step, index) => {
                                        const isCompleted = index <= getStepIndex(order.status);
                                        return (
                                            <div key={index} className="flex flex-col items-center">
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-white ${isCompleted ? 'border-green-500 text-green-500' : 'border-gray-200 text-gray-300'}`}>
                                                    {isCompleted && <Check size={14} strokeWidth={4} />}
                                                </div>
                                                <p className={`text-[10px] md:text-xs font-bold mt-3 uppercase tracking-wider ${isCompleted ? 'text-green-600' : 'text-gray-400'}`}>{step.label}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Order Details */}
                            <div className="border-t border-gray-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Items</h3>
                                    <div className="space-y-3">
                                        {order.items?.map((item, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                    <img src={item.image || item.imageUrl} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                                                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="md:text-right">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Recipient</h3>
                                    <p className="font-bold text-gray-900">{order.address?.fullName}</p>
                                    <p className="text-xs text-gray-500">{order.address?.city}, {order.address?.pincode}</p>
                                    <div className="mt-4">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Total Paid</p>
                                        <p className="text-xl font-black text-gray-900">₹{order.total}</p>
                                        <Link to={`/order/${order.id}`} className="text-xs text-orange-600 font-bold hover:underline mt-1 block">
                                            View Full Receipt
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <Link to="/" className="text-gray-400 hover:text-orange-600 font-bold flex items-center gap-2 transition-colors">
                                <Home size={18} /> Return Home
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackOrder;
