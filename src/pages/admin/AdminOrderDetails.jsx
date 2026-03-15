import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { ArrowLeft, Package, User, MapPin, Phone, CreditCard, ChevronDown, AlertTriangle, CheckCircle, Truck, Clock, XCircle } from 'lucide-react';
import Button from '../../components/Button';
import Card from '../../components/common/Card';

const AdminOrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

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
        setUpdating(true);
        try {
            await updateDoc(doc(db, 'orders', id), { status: newStatus });
            setOrder(prev => ({ ...prev, status: newStatus }));
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status");
        } finally {
            setUpdating(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
            case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
            case 'Shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Processing': return 'bg-orange-100 text-orange-700 border-orange-200';
            default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        }
    };

    if (loading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600"></div>
        </div>
    );

    if (!order) return <div className="text-center p-10 font-bold text-gray-500">Order not found</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="white"
                        size="icon"
                        onClick={() => navigate('/admin/orders')}
                        className="shadow-sm border-gray-200 text-gray-500 hover:text-gray-900"
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Order #{order.orderId || order.id.slice(0, 8)}</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide border ${getStatusColor(order.status)}`}>
                                {order.status}
                            </span>
                        </div>
                        <p className="text-sm font-bold text-gray-400 mt-1">
                            Placed on {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleString() : 'N/A'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
                    {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                        <button
                            key={status}
                            onClick={() => handleStatusChange(status)}
                            disabled={updating}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition-all ${order.status === status
                                ? 'bg-gray-900 text-white shadow-md scale-105'
                                : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left: Order Items */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="p-0 overflow-hidden border-orange-100/50">
                        <div className="px-6 py-4 border-b border-gray-100 bg-orange-50/30 flex items-center gap-2">
                            <Package className="text-orange-500" size={20} />
                            <h2 className="font-black text-gray-900">Order Items</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            {order.items?.map((item, index) => (
                                <div key={index} className="flex gap-4 group">
                                    <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                                        <img src={item.image || item.imageUrl || 'https://placehold.co/100'} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 text-lg truncate">{item.name}</h3>
                                        <p className="text-sm font-medium text-gray-500">Category: {item.category}</p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">Qty: {item.quantity || 1}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-gray-900 text-lg">₹{item.price * (item.quantity || 1)}</p>
                                        <p className="text-xs text-gray-400 font-medium">₹{item.price} / unit</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-gray-50 p-6 flex justify-between items-center border-t border-gray-100">
                            <span className="font-bold text-gray-500 uppercase tracking-widest text-xs">Total Order Value</span>
                            <span className="text-3xl font-black text-gray-900 tracking-tight">₹{order.total}</span>
                        </div>
                    </Card>
                </div>

                {/* Right: Customer Info */}
                <div className="space-y-6">
                    <Card className="p-6 space-y-6">
                        <div>
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <User size={16} /> Customer Details
                            </h2>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg">
                                    {(order.customer?.name || order.address?.fullName || "G")[0]}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{order.customer?.name || order.address?.fullName || "Guest User"}</p>
                                    <p className="text-xs font-bold text-gray-500">{order.customer?.email || order.userEmail || order.email}</p>
                                </div>
                            </div>
                            {order.address?.phoneNumber && (
                                <div className="flex items-center gap-3 text-sm font-bold text-gray-600 bg-gray-50 p-3 rounded-xl">
                                    <Phone size={16} /> {order.address.phoneNumber}
                                </div>
                            )}
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <MapPin size={16} /> Shipping Address
                            </h2>
                            <p className="text-sm font-medium text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                                {order.address ? (
                                    <>
                                        {order.address.addressLine1}, <br />
                                        {order.address.city}, {order.address.state} <br />
                                        {order.address.pincode}
                                    </>
                                ) : "No address provided"}
                            </p>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <CreditCard size={16} /> Payment Info
                            </h2>
                            <div className={`p-4 rounded-xl border flex items-center justify-between ${order.isPaid ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'}`}>
                                <span className={`text-xs font-black uppercase ${order.isPaid ? 'text-green-700' : 'text-orange-700'}`}>
                                    {order.isPaid ? 'Paid Online' : 'Cash on Delivery'}
                                </span>
                                {order.isPaid ? <CheckCircle size={18} className="text-green-600" /> : <Clock size={18} className="text-orange-600" />}
                            </div>
                        </div>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="p-6">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Actions</h2>
                        <Button
                            onClick={() => window.print()}
                            variant="secondary"
                            className="w-full mb-3"
                        >
                            Print Invoice
                        </Button>
                        {order.status !== 'Cancelled' && (
                            <Button
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to cancel this order?')) {
                                        handleStatusChange('Cancelled');
                                    }
                                }}
                                className="w-full bg-red-50 text-red-600 hover:bg-red-100 border-red-100"
                            >
                                Cancel Order
                            </Button>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetails;
