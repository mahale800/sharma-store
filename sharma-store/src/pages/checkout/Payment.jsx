import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ShieldCheck, Loader2, Edit2, MapPin, Banknote, QrCode, Lock } from 'lucide-react';
import { sendOrderNotification } from '../../services/whatsappService';
import { generateOrderId } from '../../utils/orderUtils';

const Payment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useAuth();

    // Strict Auth Gate: Reduce flicker
    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        }
    }, [currentUser, navigate]);
    const { cartItems, cartTotal, clearCart } = useCart();

    // State
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [shippingAddress, setShippingAddress] = useState(null);

    // Get Data
    const directBuyProduct = location.state?.directBuyProduct;
    const orderItems = directBuyProduct ? [{ ...directBuyProduct, quantity: 1 }] : cartItems;
    const totalAmount = directBuyProduct ? directBuyProduct.price : cartTotal;

    useEffect(() => {
        // Redirect if no data
        if (!directBuyProduct && cartItems.length === 0) {
            navigate('/cart');
            return;
        }

        // Load Address
        const savedAddr = localStorage.getItem('sharma-shipping-address');
        if (!savedAddr) {
            navigate('/checkout/address');
        } else {
            setShippingAddress(JSON.parse(savedAddr));
        }
    }, [navigate, directBuyProduct, cartItems]);

    const handlePlaceOrder = async () => {
        setLoading(true);

        try {
            // Fake Payment Delay
            if (paymentMethod === 'online') {
                await new Promise(r => setTimeout(r, 2000));
            }

            // Generate a random transaction ID for realism
            // Generate a random transaction ID for realism
            const transactionId = paymentMethod === 'online'
                ? 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase()
                : null;

            // Generate Readable Order ID (imported from utils)
            const readableOrderId = generateOrderId();

            const orderData = {
                orderId: readableOrderId,
                userId: currentUser.uid, // Strict: No guest
                userEmail: currentUser.email || shippingAddress.email, // Fallback to form email if auth email missing (rare)
                address: shippingAddress,
                items: orderItems,
                total: totalAmount,
                status: 'Pending',
                paymentMethod: paymentMethod === 'online' ? 'Online (UPI/QR)' : 'Cash on Delivery',
                isPaid: paymentMethod === 'online',
                transactionId: transactionId,
                source: directBuyProduct ? 'Direct Buy' : 'Cart Checkout',
                createdAt: new Date()
            };

            const docRef = await addDoc(collection(db, "orders"), orderData);

            // Trigger WhatsApp Notification (Non-blocking)
            sendOrderNotification({ ...orderData, id: docRef.id });

            if (!directBuyProduct) clearCart();

            navigate('/order-success', {
                state: {
                    orderId: readableOrderId, // Pass readable ID
                    docId: docRef.id,         // Pass internal Doc ID
                    items: orderItems,
                    total: totalAmount,
                    customerName: shippingAddress.fullName
                }
            });

        } catch (error) {
            console.error("Order failed", error);
            alert("Order processing failed. Please try again.");
            setLoading(false);
        }
    };

    if (!shippingAddress) return null;

    return (
        <div className="space-y-6">

            {/* 1. Review Address */}
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-start justify-between">
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                        <MapPin size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Delivering to</h3>
                        <p className="text-sm font-medium text-gray-500 line-clamp-1">
                            {shippingAddress.addressLine1}, {shippingAddress.city}
                        </p>
                        <p className="text-xs font-bold text-gray-400 mt-1">{shippingAddress.fullName} • {shippingAddress.phoneNumber}</p>
                    </div>
                </div>
                <Link to="/checkout/address" className="p-2 text-primary hover:bg-orange-50 rounded-xl transition-colors">
                    <Edit2 size={18} />
                </Link>
            </div>

            {/* 2. Order Summary */}
            <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                <div className="space-y-3 mb-4">
                    {orderItems.map((item, i) => (
                        <div key={i} className="flex gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 overflow-hidden flex-shrink-0">
                                <img src={item.image || item.imageUrl || 'https://placehold.co/100'} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-bold text-gray-900">₹{item.price * item.quantity}</p>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 border-dashed">
                    <span className="font-bold text-gray-600">Total Amount</span>
                    <span className="text-2xl font-black text-gray-900">₹{totalAmount}</span>
                </div>
            </div>

            {/* 3. Payment Method */}
            <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-2">Payment Method</h3>

                <label className={`flex items-center gap-4 p-4 border rounded-2xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-green-500 bg-green-50/50 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <input type="radio" name="pay" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-5 h-5 accent-green-600" />
                    <div className="flex-1">
                        <div className="font-bold text-gray-900 flex items-center gap-2"><Banknote size={18} /> Cash on Delivery</div>
                    </div>
                </label>

                <label className={`flex items-center gap-4 p-4 border rounded-2xl cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <input type="radio" name="pay" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="w-5 h-5 accent-blue-600" />
                    <div className="flex-1">
                        <div className="font-bold text-gray-900 flex items-center gap-2"><QrCode size={18} /> Online / UPI</div>
                    </div>
                </label>
            </div>

            {/* 4. Pay Button */}
            <button
                onClick={handlePlaceOrder}
                disabled={loading || !navigator.onLine}
                className={`w-full py-4 text-white font-bold text-lg rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 
                    ${loading || !navigator.onLine ? 'opacity-80 scale-[0.98] cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'} 
                    ${paymentMethod === 'online' ? 'bg-blue-600 shadow-blue-200' : 'bg-gray-900 shadow-gray-200'}
                    ${!navigator.onLine ? 'grayscale' : ''}`}
            >
                {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={20} />}
                {loading ? 'Processing...' : !navigator.onLine ? 'Offline - Cannot Order' : `Pay ₹${totalAmount}`}
            </button>

            <div className="flex justify-center items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <Lock size={10} /> 100% Secure Checkout
            </div>

        </div>
    );
};

export default Payment;
