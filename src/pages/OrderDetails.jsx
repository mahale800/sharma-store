import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { ArrowLeft, Printer, MapPin, CreditCard } from 'lucide-react';
import Logo from '../components/common/Logo';
import { useAuth } from '../context/AuthContext';
import Invoice from '../components/Invoice';

const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            setLoading(true);
            try {
                // 1. Try fetching by ID (Document ID) strategy 
                const docRef = doc(db, "orders", orderId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setOrder({ id: docSnap.id, ...docSnap.data() });
                } else {
                    // 2. Fallback: Query by 'orderId' field (Readable ID)
                    const q = query(
                        collection(db, "orders"),
                        where("orderId", "==", orderId)
                    );
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const orderDoc = querySnapshot.docs[0];
                        setOrder({ id: orderDoc.id, ...orderDoc.data() });
                    } else {
                        setOrder(null);
                    }
                }
            } catch (error) {
                console.error("Error fetching order:", error);
                setOrder(null);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    if (loading) return <div className="min-h-screen pt-32 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div></div>;

    if (!order) return (
        <div className="min-h-screen pt-32 text-center px-4">
            <h2 className="text-2xl font-bold text-gray-900">Order Not Found</h2>
            <Link to="/my-orders" className="text-orange-600 font-bold hover:underline mt-4 block">Back to Orders</Link>
        </div>
    );

    // Print Handler
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 px-4 md:px-8 print:bg-white print:pt-0 print:pb-0 print:p-0">
            <div className="max-w-4xl mx-auto">

                {/* Header Actions (Hidden on Print) */}
                <div className="flex items-center justify-between mb-8 print:hidden">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold transition-colors">
                        <ArrowLeft size={20} /> Back
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-95"
                    >
                        <Printer size={18} /> Print Invoice
                    </button>
                </div>

                {/* Screen View (Hidden on Print) */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden print:hidden border border-gray-100">

                    {/* Invoice Header */}
                    <div className="p-8 md:p-10 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-8 bg-gray-50/50">
                        <div>
                            <div className="mb-4">
                                <Logo variant="full" />
                            </div>
                            <p className="text-sm text-gray-500 font-medium">123, Stationery Lane, Art District</p>
                            <p className="text-sm text-gray-500 font-medium">New Delhi, India - 110001</p>
                            <p className="text-sm text-gray-500 font-medium">support@sharmastore.com</p>
                        </div>
                        <div className="text-left md:text-right">
                            <h1 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">Invoice</h1>
                            <p className="font-bold text-gray-500">#{order.orderId || order.id}</p>
                            <div className="mt-4 space-y-1">
                                <p className="text-sm font-bold text-gray-900">Date: <span className="font-medium text-gray-600">{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString()}</span></p>
                                <p className="text-sm font-bold text-gray-900">Status: <span className={`uppercase text-xs px-2 py-0.5 rounded-md ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{order.status}</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Customer & Shipping Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 md:p-10">
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wide flex items-center gap-2">
                                <MapPin size={14} /> Billed To
                            </h3>
                            <div>
                                <p className="font-bold text-gray-900 text-lg">{currentUser?.displayName || order.address?.fullName || 'Guest Customer'}</p>
                                <p className="text-gray-600 text-sm mt-1">{order.address?.streetAddress}</p>
                                <p className="text-gray-600 text-sm">{order.address?.city}, {order.address?.state} - {order.address?.pincode}</p>
                            </div>
                        </div>
                        <div className="space-y-4 md:text-right">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wide flex items-center gap-2 md:justify-end">
                                <CreditCard size={14} /> Payment Method
                            </h3>
                            <div>
                                <p className="font-bold text-gray-900 capitalize">{order.paymentMethod || 'Online Payment'}</p>
                                <p className="text-gray-500 text-xs mt-1">Transaction ID: {order.transactionId || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="px-8 md:px-10 pb-10">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-gray-100">
                                    <th className="py-4 text-xs font-black text-gray-400 uppercase tracking-wide w-1/2">Item Description</th>
                                    <th className="py-4 text-xs font-black text-gray-400 uppercase tracking-wide text-center">Qty</th>
                                    <th className="py-4 text-xs font-black text-gray-400 uppercase tracking-wide text-right">Price</th>
                                    <th className="py-4 text-xs font-black text-gray-400 uppercase tracking-wide text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {order.items?.map((item, idx) => (
                                    <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 pr-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                    <img src={item.image || item.imageUrl} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{item.name}</p>
                                                    <p className="text-xs text-gray-500">{item.variant || 'Standard'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 text-center font-bold text-gray-600">{item.quantity}</td>
                                        <td className="py-4 text-right font-medium text-gray-600">₹{item.price}</td>
                                        <td className="py-4 text-right font-bold text-gray-900">₹{item.price * item.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals Section */}
                    <div className="bg-gray-50 p-8 md:p-10 border-t border-gray-100">
                        <div className="flex flex-col md:flex-row justify-end">
                            <div className="w-full md:w-1/3 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Subtotal</span>
                                    <span className="font-bold text-gray-900">₹{order.total}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Shipping</span>
                                    <span className="font-bold text-green-600">Free</span>
                                </div>
                                <div className="h-px bg-gray-200 my-2"></div>
                                <div className="flex justify-between text-lg">
                                    <span className="font-black text-gray-900">Total</span>
                                    <span className="font-black text-gray-900">₹{order.total}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Print View (Dedicated Invoice Component) */}
                <div className="hidden print:block print:w-full print:fixed print:top-0 print:left-0 print:m-0 print:p-0 print:bg-white print:z-[9999]">
                    <Invoice order={order} user={currentUser} />
                </div>

                <div className="mt-8 text-center print:hidden">
                    <p className="text-gray-400 text-sm">Need help with this order? <a href="#" className="underline hover:text-orange-600">Contact Support</a></p>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
