import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Phone, MapPin, ArrowRight, Sparkles, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

// ... imports ...
import { useCart } from '../../context/CartContext';

const Address = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useAuth();
    const { cartItems, cartTotal } = useCart();

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        addressLine1: '',
        city: '',
        state: '',
        pincode: ''
    });

    const [loading, setLoading] = useState(false); // For autofill loading or submitting
    const [autofilled, setAutofilled] = useState(false);

    // 1. Initial Load: Check localStorage OR Profile
    useEffect(() => {
        const loadInitialData = async () => {
            // Priority 1: Saved local session address
            const savedAddress = localStorage.getItem('sharma-shipping-address');
            if (savedAddress) {
                setFormData(JSON.parse(savedAddress));
                return;
            }

            // Priority 2: User Profile
            if (currentUser) {
                setLoading(true);
                try {
                    const docSnap = await getDoc(doc(db, "users", currentUser.uid));
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setFormData(prev => ({
                            ...prev,
                            fullName: data.name || data.fullName || '',
                            email: currentUser.email || '',
                            phoneNumber: data.phone || data.phoneNumber || '',
                            addressLine1: data.address || ''
                        }));
                        if (data.name || data.phone || data.address || currentUser.email) setAutofilled(true);
                    } else {
                         // Fallback even if doc doesn't exist but auth does
                         setFormData(prev => ({
                            ...prev,
                            email: currentUser.email || ''
                        }));
                    }
                } catch (e) {
                    console.error("Autofill failed", e);
                } finally {
                    setLoading(false);
                }
            }
        };

        loadInitialData();
    }, [currentUser]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic Validation
        if (formData.phoneNumber.length < 10) {
            alert("Please enter a valid phone number");
            return;
        }

        // Save & Next
        localStorage.setItem('sharma-shipping-address', JSON.stringify(formData));

        // Pass Product Context Forward
        navigate('/checkout/payment', { state: location.state });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column: Address Form */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                    {autofilled && (
                        <div className="absolute top-0 right-0 bg-gradient-to-bl from-orange-100 to-white pl-4 pb-2 pt-1 pr-2 rounded-bl-2xl text-orange-600 text-[10px] font-black uppercase tracking-wide flex items-center gap-1">
                            <Sparkles size={10} /> Auto-filled
                        </div>
                    )}

                    <h2 className="text-xl font-black text-gray-900 mb-6">Where should we deliver?</h2>

                    <form id="address-form" onSubmit={handleSubmit} className="space-y-4">

                        {/* Contact Info */}
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">Contact</label>
                            
                            {/* NEW: Email Field for Guest Checkout */}
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    name="email"
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Email Address (for Order Invoice)"
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl font-bold text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative group">
                                    <User className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                                    <input
                                        name="fullName"
                                        required
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="Full Name"
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl font-bold text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                    />
                                </div>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                                    <input
                                        name="phoneNumber"
                                        required
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        placeholder="Mobile Number"
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl font-bold text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Address Info */}
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2 mt-2 block">Address</label>
                            <div className="relative group">
                                <MapPin className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                                <textarea
                                    name="addressLine1"
                                    required
                                    value={formData.addressLine1}
                                    onChange={handleChange}
                                    placeholder="House No, Street, Landmark"
                                    rows={2}
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl font-bold text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    name="city"
                                    required
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="City"
                                    className="w-full px-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl font-bold text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                />
                                <input
                                    name="pincode"
                                    required
                                    value={formData.pincode}
                                    onChange={handleChange}
                                    placeholder="Pincode"
                                    className="w-full px-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl font-bold text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                />
                            </div>
                            <input
                                name="state"
                                required
                                value={formData.state}
                                onChange={handleChange}
                                placeholder="State"
                                className="w-full px-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl font-bold text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                            />
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-fit space-y-6">
                <h3 className="font-black text-gray-900 text-lg">Order Summary</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {cartItems.map((item) => (
                        <div key={item.id} className="flex gap-3">
                            <div className="w-12 h-12 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden shrink-0">
                                <img src={item.image || item.imageUrl || 'https://placehold.co/100'} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                                <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                            </div>
                            <p className="text-sm font-bold text-gray-900">₹{item.price * item.quantity}</p>
                        </div>
                    ))}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2">
                    <div className="flex justify-between text-sm text-gray-500">
                        <span>Subtotal</span>
                        <span>₹{cartTotal}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                        <span>Shipping</span>
                        <span className="text-green-600 font-bold">Free</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="text-2xl font-black text-primary">₹{cartTotal}</span>
                    </div>
                </div>

                <button
                    form="address-form"
                    type="submit"
                    className="w-full py-4 bg-gray-900 text-white font-bold text-lg rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    Continue to Payment <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default Address;
