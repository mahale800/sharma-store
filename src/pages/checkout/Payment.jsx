import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { db } from '../../firebase/firebase';
import { collection, doc, updateDoc, increment, arrayUnion, runTransaction } from 'firebase/firestore';
import { ShieldCheck, Loader2, Edit2, MapPin, Banknote, QrCode, Lock, CreditCard, ChevronRight, Wallet, CheckCircle } from 'lucide-react';
import Button from '../../components/Button';
import { sendOrderNotification } from '../../services/whatsappService';
import { generateOrderId } from '../../utils/orderUtils';
import { motion, AnimatePresence } from 'framer-motion';

const Payment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useAuth();
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { addNotification } = useNotifications();

    // Data Setup
    const orderItems = cartItems;
    const totalAmount = getCartTotal();

    // State
    const [loading, setLoading] = useState(false);
    const [processingStep, setProcessingStep] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [shippingAddress, setShippingAddress] = useState(() => {
        const saved = localStorage.getItem('sharma-shipping-address');
        return saved ? JSON.parse(saved) : null;
    });
    const [error, setError] = useState('');

    // Form States
    const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvv: '' });
    const [upiId, setUpiId] = useState('');
    const [walletProvider, setWalletProvider] = useState('paytm');

    // Auth & Data Check with enhanced guards
    useEffect(() => {
        if (!currentUser) {
            navigate('/login', { state: { from: '/checkout' } });
            return;
        }

        if (!cartItems || cartItems.length === 0) {
            navigate('/cart', { replace: true });
            return;
        }

        const savedAddr = localStorage.getItem('sharma-shipping-address');
        if (!savedAddr) {
            navigate('/checkout/address', { replace: true });
            return;
        }

        // Validate total amount
        if (totalAmount <= 0) {
            navigate('/cart', { replace: true });
            return;
        }
    }, [currentUser, navigate, cartItems, totalAmount]);

    // Helpers
    const formatCardNumber = (val) => {
        return val.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
    };

    const handleCardChange = (e) => {
        const { name, value } = e.target;
        if (name === 'number') setCardData(prev => ({ ...prev, [name]: formatCardNumber(value) }));
        else if (name === 'expiry') {
            let v = value.replace(/\D/g, '');
            if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2, 4);
            setCardData(prev => ({ ...prev, [name]: v.slice(0, 5) }));
        }
        else if (name === 'cvv') setCardData(prev => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 3) }));
        else setCardData(prev => ({ ...prev, [name]: value }));
    };

    const processOrder = async () => {
        try {
            setLoading(true);
            setProcessingStep('verifying');

            // Generate IDs
            const readableOrderId = generateOrderId();
            const transactionId = paymentMethod !== 'cod'
                ? 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase()
                : null;

            const orderData = {
                orderId: readableOrderId,
                userId: currentUser.uid,
                userEmail: currentUser.email || shippingAddress.email,
                address: shippingAddress,
                items: orderItems,
                total: parseFloat(totalAmount.toFixed(2)),
                status: 'Pending',
                paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod.toUpperCase(),
                isPaid: paymentMethod !== 'cod',
                transactionId: transactionId,
                source: 'Cart Checkout',
                createdAt: new Date(),
                customerName: shippingAddress.fullName,
                phone: shippingAddress.phoneNumber
            };

            // INVENTORY LOCKING: Use transaction to prevent overselling
            setProcessingStep('approving');
            
            const docRef = await runTransaction(db, async (transaction) => {
                // Check and update stock for each item
                for (const item of orderItems) {
                    const productRef = doc(db, 'products', item.id);
                    const productDoc = await transaction.get(productRef);
                    
                    if (!productDoc.exists()) {
                        throw new Error(`Product ${item.name} not found`);
                    }
                    
                    const productData = productDoc.data();
                    const currentStock = productData.stock || 0;
                    const requestedQty = item.quantity || 1;
                    
                    if (currentStock < requestedQty) {
                        throw new Error(`Insufficient stock for ${item.name}. Only ${currentStock} available.`);
                    }
                    
                    // Decrement stock atomically
                    transaction.update(productRef, {
                        stock: increment(-requestedQty)
                    });
                }
                
                // Create order document
                const newOrderRef = doc(collection(db, 'orders'));
                transaction.set(newOrderRef, orderData);
                
                return newOrderRef;
            });

            // Award Coins (10% reward)
            const coinsEarned = Math.floor(totalAmount / 10);
            if (coinsEarned > 0 && currentUser) {
                const userRef = doc(db, 'users', currentUser.uid);
                const newTx = {
                    id: Date.now(),
                    title: `Reward for Order #${readableOrderId}`,
                    amount: coinsEarned,
                    type: 'credit',
                    date: new Date().toISOString()
                };
                await updateDoc(userRef, {
                    coins: increment(coinsEarned),
                    loyaltyHistory: arrayUnion(newTx)
                }).catch(e => console.error("Coin award failed", e));
            }

            // Send WhatsApp notification
            sendOrderNotification({ ...orderData, id: docRef.id }).catch(e => {
                console.error("WhatsApp notification failed", e);
            });

            // Trigger In-App Notifications
            addNotification('order', `Order Confirmed: ${readableOrderId}. We're getting your items ready!`);
            
            if (coinsEarned > 0) {
                setTimeout(() => {
                    addNotification('loyalty', `You earned ${coinsEarned} coins from your recent purchase!`);
                }, 3000); // Slight delay for loyalty notification
            }

            // Clear cart and redirect
            clearCart();
            localStorage.removeItem('sharma-shipping-address');

            navigate('/order-success', {
                state: {
                    orderId: readableOrderId,
                    docId: docRef.id,
                    items: orderItems,
                    total: totalAmount,
                    customerName: shippingAddress.fullName
                },
                replace: true
            });
        } catch (error) {
            console.error("Order processing failed:", error);
            setError(error.message || "Order processing failed. Please try again.");
            setLoading(false);
            setProcessingStep(null);
            
            // Show error for 5 seconds then clear
            setTimeout(() => setError(''), 5000);
        }
    };

    const handlePay = async () => {
        setError('');

        // Inline validation (no browser alerts)
        if (paymentMethod === 'card' && (cardData.number.length < 19 || !cardData.cvv || !cardData.expiry)) {
            setError('Please enter valid card details.'); return;
        }
        if (paymentMethod === 'upi' && !upiId.includes('@')) {
            setError('Please enter a valid UPI ID.'); return;
        }

        try {
            setLoading(true);

            if (paymentMethod === 'cod') {
                await new Promise(r => setTimeout(r, 1000));
                await processOrder();
            } else {
                // Simulation Sequence
                setProcessingStep('connecting');
                await new Promise(r => setTimeout(r, 1500));

                setProcessingStep('verifying');
                await new Promise(r => setTimeout(r, 1500));

                setProcessingStep('approving');
                await new Promise(r => setTimeout(r, 1000));

                await processOrder();
            }
        } catch (err) {
            // processOrder handles its own errors but catch any unexpected ones
            if (!error) {
                setError(err.message || 'Something went wrong. Please try again.');
            }
            setLoading(false);
            setProcessingStep(null);
        }
    };

    if (!shippingAddress) return null;

    return (
        <div className="space-y-6 relative">

            {/* --- Processing Overlay --- */}
            <AnimatePresence>
                {processingStep && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-white/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
                    >
                        <div className="w-24 h-24 relative mb-8">
                            <motion.div
                                animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                className="w-full h-full border-4 border-gray-100 border-t-orange-500 rounded-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <ShieldCheck size={32} className="text-orange-500" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-black text-gray-900 mb-2">Processing Secure Payment</h2>
                        <motion.p
                            key={processingStep}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="text-gray-500 font-medium"
                        >
                            {processingStep === 'connecting' && "Connecting to bank gateway..."}
                            {processingStep === 'verifying' && "Verifying secure credentials..."}
                            {processingStep === 'approving' && "Transaction approved! Finalizing..."}
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- Error Banner --- */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl flex items-start gap-3"
                    >
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-red-600 text-sm font-black">!</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold">{error}</p>
                            <p className="text-xs text-red-500 mt-1">Your cart has not been cleared. Please try again.</p>
                        </div>
                        <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 text-lg font-bold">&times;</button>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* 1. Order Summary Header */}
            <div className="bg-gray-900 text-white p-6 rounded-[2rem] shadow-xl shadow-gray-200">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total to Pay</p>
                        <h1 className="text-4xl font-black tracking-tighter">₹{totalAmount}</h1>
                    </div>
                    <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm">
                        <Lock size={20} className="text-green-400" />
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-gray-400 bg-white/5 py-2 px-3 rounded-lg w-fit">
                    <ShieldCheck size={14} /> 256-bit SSL Encrypted
                </div>
            </div>

            {/* Order Items Summary */}
            <div className="frosted-paper p-6 rounded-[2rem] border border-white/60 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-gray-900">Order Summary</h3>
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg">{orderItems.length} {orderItems.length === 1 ? 'item' : 'items'}</span>
                </div>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {orderItems.map((item) => (
                        <div key={item.id} className="flex gap-3 items-center">
                            <div className="w-12 h-12 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden shrink-0">
                                <img src={item.image || item.imageUrl || 'https://placehold.co/100'} className="w-full h-full object-cover" alt={item.name} loading="lazy" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                                <p className="text-xs text-gray-400">Qty: {item.quantity} × ₹{item.price}</p>
                            </div>
                            <p className="text-sm font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(0)}</p>
                        </div>
                    ))}
                </div>

                <div className="border-t border-gray-100 mt-4 pt-4 space-y-2">
                    <div className="flex justify-between text-sm text-gray-500">
                        <span>Subtotal</span>
                        <span>₹{totalAmount}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                        <span>Shipping</span>
                        <span className="text-green-600 font-bold">Free</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-gray-900 pt-1">
                        <span>Total</span>
                        <span className="text-primary">₹{totalAmount}</span>
                    </div>
                </div>
            </div>

            {/* Shipping Address Preview */}
            {shippingAddress && (
                <div className="frosted-paper p-5 rounded-[2rem] border border-white/60 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-orange-500" />
                            <h3 className="font-bold text-gray-900 text-sm">Delivering to</h3>
                        </div>
                        <Link to="/checkout/address" className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1">
                            <Edit2 size={12} /> Change
                        </Link>
                    </div>
                    <p className="text-sm font-bold text-gray-800">{shippingAddress.fullName}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        {shippingAddress.addressLine1}, {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{shippingAddress.phoneNumber}</p>
                </div>
            )}

            {/* 2. Payment Method Tabs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-100 p-2 rounded-2xl">
                {[
                    { id: 'card', icon: CreditCard, label: 'Card' },
                    { id: 'upi', icon: QrCode, label: 'UPI' },
                    { id: 'wallet', icon: Wallet, label: 'Wallet' },
                    { id: 'cod', icon: Banknote, label: 'COD' },
                ].map(m => (
                    <button
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id)}
                        className={`flex flex-col items-center justify-center gap-2 py-3.5 rounded-xl transition-all ${paymentMethod === m.id
                            ? 'bg-white shadow-sm text-gray-900 font-bold ring-1 ring-black/5'
                            : 'text-gray-500 hover:bg-white/50 hover:text-gray-700'
                            }`}
                    >
                        <m.icon size={22} className={paymentMethod === m.id ? 'text-orange-500' : 'text-gray-400'} strokeWidth={paymentMethod === m.id ? 2.5 : 2} />
                        <span className="text-[11px] font-bold uppercase tracking-wide">{m.label}</span>
                    </button>
                ))}
            </div>

            {/* 3. Method Specific Forms */}
            <div className="frosted-paper p-6 rounded-[2rem] border border-white/60 shadow-sm min-h-[300px]">

                {paymentMethod === 'card' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <h3 className="font-bold text-gray-900">Enter Card Details</h3>
                        <div className="relative">
                            <CreditCard className="absolute left-4 top-3.5 text-gray-400" size={20} />
                            <input
                                name="number" value={cardData.number} onChange={handleCardChange}
                                type="text" placeholder="0000 0000 0000 0000" maxLength="19"
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl font-mono text-gray-800 outline-none focus:border-orange-500 transition-colors"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                name="expiry" value={cardData.expiry} onChange={handleCardChange}
                                type="text" placeholder="MM/YY" maxLength="5"
                                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl font-mono text-gray-800 outline-none focus:border-orange-500 transition-colors text-center"
                            />
                            <input
                                name="cvv" value={cardData.cvv} onChange={handleCardChange}
                                type="password" placeholder="CVV" maxLength="3"
                                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl font-mono text-gray-800 outline-none focus:border-orange-500 transition-colors text-center"
                            />
                        </div>
                        <input
                            name="name" value={cardData.name} onChange={handleCardChange}
                            type="text" placeholder="Card Holder Name"
                            className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl font-bold text-gray-800 outline-none focus:border-orange-500 transition-colors"
                        />
                    </motion.div>
                )}

                {paymentMethod === 'upi' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <h3 className="font-bold text-gray-900">UPI Payment</h3>

                        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                            {['gpay', 'phonepe', 'paytm', 'bhim'].map(app => (
                                <div key={app} className="w-16 h-16 bg-white border border-gray-100 rounded-2xl flex items-center justify-center shrink-0 cursor-pointer hover:border-orange-500 transition-colors">
                                    <span className="text-[10px] font-bold uppercase text-gray-400">{app}</span>
                                </div>
                            ))}
                        </div>

                        <div className="relative">
                            <div className="absolute left-4 top-3.5 text-gray-400 font-bold text-xs">ID</div>
                            <input
                                value={upiId} onChange={e => setUpiId(e.target.value)}
                                type="text" placeholder="username@upi"
                                className="w-full pl-10 pr-20 py-3 bg-white border border-gray-100 rounded-xl font-bold text-gray-800 outline-none focus:border-orange-500 transition-colors"
                            />
                            <button className="absolute right-2 top-2 px-3 py-1.5 bg-orange-100 text-orange-600 text-xs font-bold rounded-lg hover:bg-orange-200">Verify</button>
                        </div>

                        <div className="p-4 bg-orange-50 rounded-2xl flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-900 border border-gray-200">
                                <QrCode size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-900">Scan QR Code</p>
                                <p className="text-[10px] text-gray-500">Use any UPI app to scan</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {paymentMethod === 'wallet' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                        <h3 className="font-bold text-gray-900 mb-4">Select Wallet</h3>
                        {['Paytm Wallet', 'Amazon Pay Balance', 'PhonePe Wallet'].map(w => (
                            <div
                                key={w}
                                onClick={() => setWalletProvider(w)}
                                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${walletProvider === w ? 'border-orange-500 bg-orange-50' : 'border-gray-100 bg-white hover:border-gray-200'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                        <Wallet size={16} className="text-gray-500" />
                                    </div>
                                    <span className="font-bold text-sm text-gray-900">{w}</span>
                                </div>
                                {walletProvider === w && <CheckCircle size={18} className="text-orange-500" />}
                            </div>
                        ))}
                    </motion.div>
                )}

                {paymentMethod === 'cod' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center text-center py-6">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                            <Banknote size={40} />
                        </div>
                        <h3 className="font-black text-gray-900 text-xl mb-2">Cash on Delivery</h3>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">
                            Pay in cash when our delivery partner arrives at your doorstep.
                        </p>
                        <div className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                            <ShieldCheck size={14} /> Additional verification may be required
                        </div>
                    </motion.div>
                )}

            </div>

            {/* 4. Pay Button */}
            <Button
                onClick={handlePay}
                isLoading={loading}
                disabled={loading}
                className="w-full h-14 text-lg shadow-xl shadow-gray-200 bg-gray-900 text-white hover:bg-black"
            >
                {!loading && <ShieldCheck size={20} className="mr-2" />}
                {paymentMethod === 'cod' ? 'Place Order' : `Pay ₹${totalAmount}`}
            </Button>

        </div>
    );
};

export default Payment;
