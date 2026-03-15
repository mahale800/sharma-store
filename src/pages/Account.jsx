import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLoyalty } from '../context/LoyaltyContext';
import { useNotifications } from '../context/NotificationContext';
import { db } from '../firebase/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User, Mail, Package, MapPin, Camera, Save, Loader2, LogOut, Bell, Gift, ChevronRight, Edit2, Crown, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/common/Card';
import MyOrders from './MyOrders';
import Redeem from './Redeem';

const Account = () => {
    const { currentUser, logout } = useAuth();
    const { coins, streak, tier } = useLoyalty();
    const { preferences, updatePreferences } = useNotifications();
    const navigate = useNavigate();

    // UI State
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef(null);

    // Form Data
    const [formData, setFormData] = useState({
        name: '', phone: '', address: '', photoURL: ''
    });

    useEffect(() => {
        if (!currentUser) { navigate('/login'); return; }
        fetchUserData();
    }, [currentUser, navigate]);

    const fetchUserData = async () => {
        try {
            const docRef = doc(db, "users", currentUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setFormData({ ...docSnap.data() });
            } else {
                setFormData(prev => ({
                    ...prev,
                    email: currentUser.email,
                    name: currentUser.displayName || ''
                }));
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.size < 500000) { // 500KB limit
            const reader = new FileReader();
            reader.onloadend = () => setFormData(prev => ({ ...prev, photoURL: reader.result }));
            reader.readAsDataURL(file);
        } else if (file) {
            alert("Image too large (max 500KB)");
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await setDoc(doc(db, "users", currentUser.uid), {
                ...formData,
                email: currentUser.email,
                updatedAt: new Date().toISOString()
            }, { merge: true });
            setIsEditing(false);
        } catch (error) {
            console.error("Save failed", error);
            alert("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-orange-500" size={40} />
        </div>
    );

    const displayName = formData.name || currentUser?.displayName || 'User';
    const profileImage = formData.photoURL || currentUser?.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

    return (
        <div className="w-full bg-slate-50 pb-8 px-4 md:px-8 page-enter">
            <div className="max-w-5xl mx-auto">
                <div className="flex gap-6 mb-8 border-b border-gray-200 pb-2 overflow-x-auto no-scrollbar">
                    <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 font-bold transition-all border-b-2 ${activeTab === 'dashboard' ? 'text-orange-600 border-orange-600' : 'text-gray-500 border-transparent hover:text-gray-900'}`}>Overview</button>
                    <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 font-bold transition-all border-b-2 ${activeTab === 'orders' ? 'text-orange-600 border-orange-600' : 'text-gray-500 border-transparent hover:text-gray-900'}`}>Orders</button>
                    <button onClick={() => setActiveTab('rewards')} className={`px-4 py-2 font-bold transition-all border-b-2 ${activeTab === 'rewards' ? 'text-orange-600 border-orange-600' : 'text-gray-500 border-transparent hover:text-gray-900'}`}>Rewards</button>
                </div>

                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 1. Profile Overview Card */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 relative overflow-hidden group">
                    <div className="flex items-start justify-between mb-6">
                        <h2 className="text-xl font-black text-slate-900">Profile</h2>
                        {!isEditing && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditing(true)}
                                className="text-orange-600 hover:bg-orange-50"
                            >
                                <Edit2 size={16} className="mr-1" /> Edit
                            </Button>
                        )}
                    </div>

                    <div className="flex flex-col items-center text-center">
                        <div
                            className={`relative w-24 h-24 mb-4 ${isEditing ? 'cursor-pointer' : ''}`}
                            onClick={() => isEditing && fileInputRef.current.click()}
                        >
                            <img
                                src={profileImage}
                                alt="Profile"
                                className="w-full h-full rounded-full object-cover border-4 border-slate-50 shadow-md"
                            />
                            {isEditing && (
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <Camera className="text-white" size={24} />
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleSave} className="w-full space-y-4 text-left">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                                    <input
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full mt-1 p-3 bg-slate-50 rounded-xl font-bold text-slate-900 border-transparent focus:border-orange-500 focus:ring-0 outline-none transition-all"
                                        placeholder="Your Name"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Phone</label>
                                    <input
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        type="tel"
                                        className="w-full mt-1 p-3 bg-slate-50 rounded-xl font-bold text-slate-900 border-transparent focus:border-orange-500 focus:ring-0 outline-none transition-all"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Address</label>
                                    <textarea
                                        value={formData.address || ''}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full mt-1 p-3 bg-slate-50 rounded-xl font-bold text-slate-900 border-transparent focus:border-orange-500 focus:ring-0 outline-none transition-all resize-none min-h-[80px]"
                                        placeholder="Enter your complete delivery address"
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="flex-1"
                                        onClick={() => { setIsEditing(false); fetchUserData(); }}
                                        disabled={saving}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="flex-1"
                                        isLoading={saving}
                                        disabled={saving}
                                    >
                                        Save
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <h3 className="text-2xl font-black text-slate-900 mb-1">{displayName}</h3>
                                <p className="text-slate-500 font-medium flex items-center gap-1.5 justify-center mb-4">
                                    <Mail size={16} /> {currentUser.email}
                                </p>

                                {tier && (
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 inline-flex items-center gap-1 ${tier === 'Platinum' ? 'bg-slate-800 text-white' :
                                        tier === 'Gold' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        <Crown size={12} /> {tier} Member
                                    </div>
                                )}

                                {formData.phone && (
                                    <p className="text-slate-400 text-sm font-medium block">{formData.phone}</p>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* 2. Rewards Card */}
                <div
                    onClick={() => setActiveTab('rewards')}
                    className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white cursor-pointer hover:scale-[1.02] transition-transform relative overflow-hidden"
                >
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-8">
                            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                                <Gift size={24} className="text-white" />
                            </div>
                            <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm flex items-center gap-1">
                                {streak} Day Streak 🔥
                            </div>
                        </div>
                        <div>
                            <p className="text-purple-200 text-sm font-bold uppercase tracking-wider mb-1">Total Rewards</p>
                            <h3 className="text-4xl font-black">{coins.toLocaleString()} <span className="text-2xl opacity-80">Coins</span></h3>
                        </div>
                    </div>

                    {/* Decorative Circles */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-10 -mb-10 pointer-events-none"></div>
                </div>

                {/* 3. Orders Card */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 flex flex-col justify-between hover:border-orange-200 transition-colors group">
                    <div>
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Package size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">My Orders</h3>
                        <p className="text-sm text-slate-500">Track current orders or view past purchase history.</p>
                    </div>
                    <Button
                        variant="secondary"
                        onClick={() => setActiveTab('orders')}
                        className="mt-6 w-full justify-between group-hover:bg-blue-50 group-hover:text-blue-700"
                    >
                        View Orders <ChevronRight size={16} />
                    </Button>
                </div>

                {/* 4. Address Card */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 flex flex-col justify-between hover:border-orange-200 transition-colors group">
                    <div>
                        <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <MapPin size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Delivery Address</h3>
                        <p className="text-sm text-slate-500 line-clamp-2">
                            {formData.address || "No address saved. Add one for faster checkout."}
                        </p>
                    </div>
                    <Button
                        variant="secondary"
                        onClick={() => setIsEditing(true)}
                        className="mt-6 w-full justify-between group-hover:bg-orange-50 group-hover:text-orange-700"
                    >
                        Manage Address <ChevronRight size={16} />
                    </Button>
                </div>

                {/* 5. Track Order Card */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 flex flex-col justify-between hover:border-orange-200 transition-colors group">
                    <div>
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Truck size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Track Order</h3>
                        <p className="text-sm text-slate-500">Check the status of your active shipments.</p>
                    </div>
                    <Button
                        variant="secondary"
                        onClick={() => navigate('/track-order')}
                        className="mt-6 w-full justify-between group-hover:bg-green-50 group-hover:text-green-700"
                    >
                        Track Package <ChevronRight size={16} />
                    </Button>
                </div>

                {/* 6. Notification Settings (Simplified) */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 lg:col-span-2 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                            <Bell size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Notifications</h3>
                            <p className="text-xs text-slate-500 font-medium">Receive updates about orders & rewards</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:block">
                            {preferences.enabled !== false ? 'On' : 'Off'}
                        </span>
                        <button
                            onClick={() => updatePreferences({ enabled: !preferences.enabled })}
                            className={`w-12 h-7 rounded-full transition-colors flex items-center px-1 ${(preferences.enabled ?? true) ? 'bg-green-500' : 'bg-slate-200'
                                }`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${(preferences.enabled ?? true) ? 'translate-x-5' : 'translate-x-0'
                                }`} />
                        </button>
                    </div>
                </div>

                {/* 6. Logout Button */}
                <div className="lg:col-span-2 mt-4">
                    <button
                        onClick={() => { logout(); navigate('/'); }}
                        className="w-full bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 rounded-2xl py-4 font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                        <LogOut size={20} /> Sign Out
                    </button>
                    <p className="text-center text-xs text-slate-400 font-medium mt-4">
                        Version 2.0.0 • Sharma Store
                    </p>
                </div>

                    </div>
                )}
                {activeTab === 'orders' && <MyOrders isComponent={true} />}
                {activeTab === 'rewards' && <Redeem isComponent={true} />}
            </div>
        </div>
    );
};

export default Account;
