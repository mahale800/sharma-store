import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Home, ArrowLeft, Gift } from 'lucide-react';
import Button from '../components/Button';

const Cart = () => {
    const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();
    const navigate = useNavigate();
    const [isGift, setIsGift] = useState(false);

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-transparent">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <ShoppingBag size={40} className="text-gray-400" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Cart is Empty</h2>
                <p className="text-gray-500 mb-8 text-center max-w-sm">
                    Looks like you haven't made your choice yet.
                </p>
                <Link to="/">
                    <Button variant="primary" size="lg" className="rounded-full pl-6 pr-8">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Start Shopping
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent pt-20 pb-32 md:pb-12 page-enter">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-xl transition-colors"><ArrowLeft size={24} className="text-gray-700" /></button>
                    <h1 className="text-3xl font-black text-gray-900">My Cart <span className="text-lg font-medium text-gray-400 ml-2">({cartItems.length} items)</span></h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
                    {/* Cart Items List */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.id} className="frosted-paper p-4 rounded-3xl border border-white/60 flex gap-4 md:gap-6 items-start shadow-sm relative group">
                                {/* Image */}
                                <Link to={`/product/${item.id}`} className="w-24 h-24 bg-white rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100">
                                    <img
                                        src={item.image || item.imageUrl || item.img || 'https://placehold.co/400x400?text=No+Image'}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => e.target.src = 'https://placehold.co/400x400?text=No+Image'}
                                    />
                                </Link>

                                {/* Details */}
                                <div className="flex-1 min-w-0 flex flex-col justify-between h-24 py-1">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">{item.category}</p>
                                                <Link to={`/product/${item.id}`} className="text-base md:text-lg font-bold text-gray-900 line-clamp-1 hover:text-primary transition-colors">{item.name}</Link>
                                                {item.isGift && <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">Gift Item</span>}
                                            </div>

                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors active:scale-90"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto">
                                        <p className="text-primary font-black text-xl">₹{item.price}</p>

                                        {/* Qty Control */}
                                        <div className="flex items-center gap-1 bg-gray-50/80 p-1 rounded-xl border border-gray-200/50">
                                            <button
                                                onClick={() => updateQuantity(item.id, -1)}
                                                className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors text-gray-600 disabled:opacity-30 active:scale-90 shadow-sm"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus size={14} strokeWidth={3} />
                                            </button>
                                            <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, 1)}
                                                className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors text-gray-600 active:scale-90 shadow-sm"
                                            >
                                                <Plus size={14} strokeWidth={3} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Order Summary (Hidden Mobile) */}
                    <div className="hidden lg:block lg:col-span-1">
                        <div className="frosted-paper p-8 rounded-3xl border border-white/60 shadow-sm sticky top-28">
                            <h2 className="text-xl font-black text-gray-900 mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-gray-500 font-medium">
                                    <span>Subtotal</span>
                                    <span>₹{cartTotal}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 font-medium">
                                    <span>Shipping</span>
                                    <span className="text-green-600 font-bold">Free</span>
                                </div>
                                <div className="flex justify-between text-gray-500 font-medium">
                                    <span>Taxes</span>
                                    <span>₹0</span>
                                </div>
                            </div>

                            {/* Gift Options */}
                            <div
                                onClick={() => setIsGift(!isGift)}
                                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 mb-8 ${isGift ? 'bg-purple-50 border-purple-200 shadow-sm' : 'bg-white/50 border-gray-100 hover:border-gray-200'}`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isGift ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    <Gift size={20} />
                                </div>
                                <div className="flex-1">
                                    <h3 className={`font-bold text-sm ${isGift ? 'text-purple-900' : 'text-gray-900'}`}>Send as Gift?</h3>
                                </div>
                                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${isGift ? 'bg-purple-500' : 'bg-gray-200'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isGift ? 'translate-x-full' : ''}`}></div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200/50 pt-6 mb-8">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-900">Total Amount</span>
                                    <span className="text-3xl font-black text-primary">₹{cartTotal}</span>
                                </div>
                            </div>

                            <Button
                                onClick={() => navigate('/checkout/address', { state: { isGift } })}
                                size="lg"
                                className="w-full gap-2 rounded-2xl py-4"
                            >
                                Proceed to Checkout
                                <ArrowRight size={20} />
                            </Button>

                            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
                                <ShoppingBag size={12} />
                                Secure Checkout Powered by Sharma Store
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Sheet Summary */}
            <div className="lg:hidden fixed bottom-16 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-gray-200 p-5 pb-safe rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-40 animate-in slide-in-from-bottom">
                {/* Mobile Gift Toggle */}
                <div className="flex items-center gap-3 mb-4" onClick={() => setIsGift(!isGift)}>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${isGift ? 'bg-purple-500 border-purple-500' : 'border-gray-300'}`}>
                        {isGift && <Gift size={12} className="text-white" />}
                    </div>
                    <span className={`text-xs font-bold ${isGift ? 'text-purple-600' : 'text-gray-500'}`}>Send entire order as a gift</span>
                </div>

                <div className="flex items-center justify-between mb-2">
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Total</p>
                        <p className="text-2xl font-black text-gray-900">₹{cartTotal}</p>
                    </div>
                    <Button
                        onClick={() => navigate('/checkout/address', { state: { isGift } })}
                        size="md"
                        className="px-8 rounded-xl gap-2"
                    >
                        Checkout <ArrowRight size={18} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
