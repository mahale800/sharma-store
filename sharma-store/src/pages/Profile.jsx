import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User, Mail, Phone, MapPin, Camera, Save, Loader2, LogOut, Package, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoyaltyDashboard from '../components/loyalty/LoyaltyDashboard';
import NotificationPreferences from '../components/NotificationPreferences';

const Profile = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '', phone: '', address: '', photoURL: ''
    });

    const getProfileImage = () => {
        if (formData.photoURL) return formData.photoURL;
        if (currentUser?.photoURL) return currentUser.photoURL;
        return 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
    };

    useEffect(() => {
        const fetchUserData = async () => {
            if (!currentUser) { navigate('/login'); return; }
            try {
                const docRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) setFormData({ ...docSnap.data() });
                else setFormData(prev => ({ ...prev, email: currentUser.email, name: currentUser.displayName || '' }));
            } finally { setLoading(false); }
        };
        fetchUserData();
    }, [currentUser, navigate]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.size < 500000) {
            const reader = new FileReader();
            reader.onloadend = () => setFormData({ ...formData, photoURL: reader.result });
            reader.readAsDataURL(file);
        } else if (file) alert("Image too large (<500KB needed)");
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await setDoc(doc(db, "users", currentUser.uid), { ...formData, email: currentUser.email, updatedAt: new Date().toISOString() }, { merge: true });
            alert('Profile updated!');
        } catch (error) {
            console.error(error);
            alert("Failed to update");
        } finally { setSaving(false); }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>;

    return (
        <div className="min-h-screen bg-transparent pt-32 pb-24 px-4 page-enter">
            <div className="max-w-[1100px] mx-auto">
                <h1 className="text-3xl font-black text-gray-900 mb-8">Dashboard</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Col: Photo & Loyalty */}
                    <div className="space-y-6 flex flex-col">
                        {/* Profile Picture Upload - MOVED TO TOP */}
                        <div className="frosted-paper p-6 rounded-3xl border border-white/60 text-center order-1 lg:order-1">
                            <div className="relative w-24 h-24 mx-auto mb-4 group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                                <img src={getProfileImage()} alt="Profile" className="w-full h-full rounded-2xl object-cover shadow-lg group-hover:scale-95 transition-transform" />
                                <div className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera className="text-white" /></div>
                            </div>
                            <h3 className="font-bold text-gray-900">{formData.name || 'User'}</h3>
                            <p className="text-xs text-gray-500 font-bold">{currentUser?.email}</p>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        </div>

                        {/* Loyalty Dashboard Component - BELOW PHOTO */}
                        <div className="order-2 lg:order-2">
                            {/* Quick Link to Orders */}
                            <div
                                onClick={() => navigate('/my-orders')}
                                className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-orange-200 transition-all cursor-pointer flex items-center justify-between mb-6 group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                        <Package size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">My Orders</h3>
                                        <p className="text-xs text-gray-500 font-bold">Track & View History</p>
                                    </div>
                                </div>
                                <ArrowRight size={20} className="text-gray-300 group-hover:text-orange-600 transition-colors" />
                            </div>

                            <LoyaltyDashboard />
                        </div>
                    </div>

                    {/* Right Col: Settings Form */}
                    <div className="lg:col-span-2">
                        <div className="frosted-paper p-8 rounded-3xl border border-white/60 mb-6">
                            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2"><User size={24} /> Account Details</h2>
                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Full Name</label>
                                        <input type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white/50 border-0 rounded-xl px-4 py-3 font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 transition-all outline-none" placeholder="Your Name" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email</label>
                                        <input type="text" value={currentUser?.email || ''} disabled className="w-full bg-gray-100/50 border-0 rounded-xl px-4 py-3 font-bold text-gray-400 cursor-not-allowed" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Phone</label>
                                        <input type="tel" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-white/50 border-0 rounded-xl px-4 py-3 font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 transition-all outline-none" placeholder="+91 99999 99999" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Address</label>
                                        <textarea rows={3} value={formData.address || ''} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full bg-white/50 border-0 rounded-xl px-4 py-3 font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none" placeholder="Delivery Address..." />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button type="submit" disabled={saving} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
                                        {saving ? <Loader2 className="animate-spin" /> : <Save size={18} />} Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Notification Preferences Section */}
                    <div className="lg:col-span-2">
                        <NotificationPreferences />
                    </div>

                    {/* Dedicated Logout Section */}
                    <div className="lg:col-span-2">
                        <div className="frosted-paper p-6 rounded-3xl border border-red-100 shadow-sm">
                            <button
                                onClick={() => { logout(); navigate('/login'); }}
                                className="w-full bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 rounded-xl py-4 font-bold flex items-center justify-center gap-3 transition-colors text-lg"
                            >
                                <LogOut size={24} /> Log Out
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Profile;
