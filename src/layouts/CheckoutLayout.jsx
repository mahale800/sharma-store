import React from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, MapPin, CreditCard, Check, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { AnimatePresence } from 'framer-motion';
import PageTransition from '../components/common/PageTransition';
import { useEngagement } from '../hooks/useEngagement';

const CheckoutLayout = () => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { cartItems } = useCart();
    const isSuccess = pathname.includes('success');
    const { logEvent } = useEngagement();

    React.useEffect(() => {
        if (pathname === '/checkout/address') {
            logEvent('checkout_attempt', 'organic', { itemCount: cartItems.length });
        }
    }, [pathname, logEvent, cartItems.length]);

    // Steps Logic
    const steps = [
        { path: 'cart', label: 'Cart', icon: ShoppingBag, disabled: false },
        { path: 'address', label: 'Address', icon: MapPin, disabled: false },
        { path: 'payment', label: 'Payment', icon: CreditCard, disabled: !pathname.includes('payment') && !pathname.includes('success') }
    ];

    const currentStepIndex = steps.findIndex(s => pathname.includes(s.path)) || (pathname.includes('/cart') ? 0 : 1);

    // Safety Redirect: Empty Cart (Skip if on Success page or coming from Buy Now - strictly routed by logic)
    // Note: We'll handle "Buy Now" safety inside the pages via location.state check.

    if (isSuccess) return <Outlet />;

    return (
        <div className="min-h-screen bg-slate-50 pt-28 md:pt-32 pb-20 md:pb-10 font-sans">

            {/* Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors text-gray-500">
                        <ArrowLeft size={22} />
                    </button>
                    <h1 className="font-black text-gray-900 text-lg tracking-tight">Checkout</h1>
                    <div className="w-8"></div> {/* Spacer */}
                </div>
            </div>

            {/* Progress Stepper */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="flex items-center justify-between relative">
                    {/* Connecting Line */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0"></div>
                    <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-green-500 rounded-full z-0 transition-all duration-500"
                        style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                    ></div>

                    {steps.map((step, index) => {
                        const isCompleted = index < currentStepIndex;
                        const isCurrent = index === currentStepIndex;

                        return (
                            <div key={step.path} className="relative z-10 flex flex-col items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${isCompleted ? 'bg-green-500 border-green-500 text-white' :
                                        isCurrent ? 'bg-white border-primary text-gray-900 shadow-md scale-110' :
                                            'bg-white border-gray-200 text-gray-300'
                                        }`}
                                >
                                    {isCompleted ? <Check size={16} strokeWidth={4} /> : <step.icon size={16} strokeWidth={2.5} />}
                                </div>
                                <span className={`absolute -bottom-8 text-[10px] font-bold uppercase tracking-wider transition-colors ${isCurrent ? 'text-gray-900' : isCompleted ? 'text-green-600' : 'text-gray-400'
                                    }`}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 mt-4">
                <AnimatePresence mode="wait">
                    <PageTransition key={pathname}>
                        <Outlet />
                    </PageTransition>
                </AnimatePresence>
            </div>

        </div>
    );
};

export default CheckoutLayout;
