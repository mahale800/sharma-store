import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { ArrowLeft, Package, User, MapPin, Phone, Calendar, CreditCard, ChevronDown } from 'lucide-react';

const AdminOrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const docRef = doc(db, 'orders', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setOrder({ id: docSnap.id, ...docSnap.data() });
                }
            } catch (error) {
                console.error("Error fetching order:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const handleStatusChange = async (newStatus) => {
        try {
            await updateDoc(doc(db, 'orders', id), { status: newStatus });
            setOrder(prev => ({ ...prev, status: newStatus }));
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

    if (!order) return <div className="text-center p-10">Order not found</div>;

    return (
        <div className="max-w-4xl mx-auto pb-10">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/admin/orders')}
                    className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Order #{order.id.slice(-6).toUpperCase()}</h1>
                    <p className="text-sm text-gray-500 font-medium">Placed on {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleString() : 'N/A'}</p>
                </div>
                <div className="ml-auto">
                    <div className="relative group">
                        <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="appearance-none bg-white border border-gray-200 pl-4 pr-10 py-3 rounded-xl font-bold text-gray-900 outline-none focus:border-primary shadow-sm"
                        >
                            {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left: Order Items */}
                <div className="md:col-span-2 space-y-6">
                    <div className="frosted-paper rounded-3xl p-6 border border-white/60 shadow-sm">
                        <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                            <Package className="text-primary" size={20} /> Items
                        </h2>
                        <div className="space-y-4">
                            {order.items?.map((item, index) => (
                                <div key={index} className="flex gap-4 p-4 bg-white/50 rounded-2xl border border-gray-100/50">
                                    <img src={item.image || 'https://placehold.co/100'} alt={item.name} className="w-16 h-16 object-cover rounded-lg bg-white" />
                                    <div>
                                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                                        <p className="text-sm text-gray-500">Qty: {item.quantity || 1}</p>
                                        <p className="text-sm font-bold text-primary">₹{item.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
                            <span className="font-medium text-gray-500">Total Amount</span>
                            <span className="text-2xl font-black text-gray-900">₹{order.total}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Customer Info */}
                <div className="space-y-6">
                    <div className="frosted-paper rounded-3xl p-6 border border-white/60 shadow-sm">
                        <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                            <User className="text-primary" size={20} /> Customer
                        </h2>
                        <div className="space-y-4 text-sm font-medium text-gray-600">
                            <div className="flex items-start gap-3">
                                <User size={16} className="mt-1 text-gray-400" />
                                <div>
                                    <p className="text-gray-900 font-bold">{order.customer?.name || order.address?.fullName || "Guest"}</p>
                                    <p>{order.customer?.email || order.userEmail || order.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone size={16} className="mt-1 text-gray-400" />
                                <p>{order.address?.phoneNumber || order.phoneNumber || "N/A"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="frosted-paper rounded-3xl p-6 border border-white/60 shadow-sm">
                        <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                            <MapPin className="text-primary" size={20} /> Shipping
                        </h2>
                        <p className="text-sm font-medium text-gray-600 leading-relaxed">
                            {order.address ? (
                                <>
                                    {order.address.addressLine1}, <br />
                                    {order.address.city}, {order.address.state} <br />
                                    {order.address.pincode}
                                </>
                            ) : "No address provided"}
                        </p>
                    </div>

                    <div className="frosted-paper rounded-3xl p-6 border border-white/60 shadow-sm">
                        <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                            <CreditCard className="text-primary" size={20} /> Payment
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                {order.isPaid ? 'PAID ONLINE' : 'COD'}
                            </span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetails;
