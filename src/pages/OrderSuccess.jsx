import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Store, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const OrderSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { orderId, items, total, customerName } = location.state || {}; // Read passed state

    useEffect(() => {
        if (!location.state) {
            // If accessed directly without state, redirect home
            const timer = setTimeout(() => navigate('/'), 3000);
            return () => clearTimeout(timer);
        }

        // Trigger generic confetti
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#F97316', '#FBBF24', '#34D399'] // Sharma Store Brand Colors
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#F97316', '#FBBF24', '#34D399']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };

        frame();

        // One big blast at start for impact
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }, [location.state, navigate]);

    if (!location.state) {
        return (
            <div className="py-20 flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h2>
                    <p className="text-gray-500">Redirecting to home...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="py-10 flex flex-col items-center justify-center p-4 text-center bg-transparent">
            <div className="w-32 h-32 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8 animate-bounce-short shadow-xl shadow-green-100/50">
                <CheckCircle size={64} strokeWidth={3} />
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Order Confirmed!</h1>
            <p className="text-lg text-gray-500 max-w-md mb-8 font-medium">
                Yay, {customerName?.split(' ')[0] || 'there'}! Your order has been placed successfully. We've sent a confirmation email to your inbox.
            </p>

            {/* Order Details Card */}
            {orderId && (
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-lg mb-8 text-left w-full max-w-md animate-fade-in-up">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Order ID: #{orderId.slice(0, 8)}</p>
                    <div className="space-y-3 mb-4">
                        {items?.slice(0, 3).map((item, i) => (
                            <div key={i} className="flex justify-between text-sm">
                                <span className="text-gray-600 truncate flex-1 pr-4">{item.name} <span className="text-xs text-gray-400">x{item.quantity}</span></span>
                                <span className="font-bold text-gray-900">₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                        {items?.length > 3 && <p className="text-xs text-gray-400 italic">...and {items.length - 3} more items</p>}
                    </div>
                    <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                        <span className="font-bold text-gray-900">Total Paid</span>
                        <span className="text-xl font-black text-green-600">₹{total}</span>
                    </div>
                </div>
            )}

            <div className="frosted-paper p-6 rounded-3xl mb-8 flex items-center gap-4 border border-white/60 shadow-lg animate-fade-in-up delay-100">
                <div className="bg-yellow-100 p-3 rounded-full">
                    <img src="https://cdn-icons-png.flaticon.com/512/616/616490.png" className="w-8 h-8" alt="Coin" />
                </div>
                <div className="text-left">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">You Earned</p>
                    <p className="text-2xl font-black text-gray-900">+{Math.floor(total / 100) * 10} Sharma Coins</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full max-w-md">
                {currentUser ? (
                    <Link
                        to={orderId ? `/order/${orderId}` : "/my-orders"}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white border border-gray-200 text-gray-900 font-bold rounded-2xl hover:bg-gray-50 transition-all active:scale-95"
                    >
                        <ShoppingBag size={20} /> View Order Details
                    </Link>
                ) : (
                    <Link
                        to="/track-order"
                        state={{ orderId: orderId, email: currentUser?.email || 'guest' }}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white border border-gray-200 text-gray-900 font-bold rounded-2xl hover:bg-gray-50 transition-all active:scale-95"
                    >
                        <Truck size={20} /> Track Order
                    </Link>
                )}
                <Link
                    to="/"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:scale-105 transition-all shadow-xl shadow-gray-200 active:scale-95"
                >
                    <Store size={20} /> Continue Shopping
                </Link>
            </div>
        </div>
    );
};

export default OrderSuccess;
