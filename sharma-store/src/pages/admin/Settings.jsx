import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { Save, Loader2, Store, Bell, Phone, MessageSquare } from 'lucide-react';
import Button from '../../components/Button';
import { seedProducts } from '../../data/seedProducts';

const Settings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [seedLoading, setSeedLoading] = useState(false);

    // Seed Handler
    const handleSeed = async () => {
        // DEBUG: Immediate alert to prove click works
        alert("DEBUG: Button Clicked! Starting Seed...");

        // if (!confirm("Are you sure? This will add 40 products to your live database.")) return;
        setSeedLoading(true);

        try {
            const productsRef = collection(db, "products");
            let count = 0;
            for (const product of seedProducts) {
                await addDoc(productsRef, product);
                count++;
            }
            alert(`Success! Added ${count} products.`);
            window.location.reload(); // Force reload to show changes
        } catch (error) {
            console.error("Seeding failed:", error);
            alert("Failed to seed data. Check console: " + error.message);
        } finally {
            setSeedLoading(false);
        }
    };

    // Default Settings
    const [config, setConfig] = useState({
        storeName: 'Sharma Store',
        contactEmail: '',
        whatsappNumber: '',
        acceptingOrders: true,
        enableNotifications: true
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const docRef = doc(db, 'settings', 'store_config');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setConfig(prev => ({ ...prev, ...docSnap.data() }));
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await setDoc(doc(db, 'settings', 'store_config'), config, { merge: true });
            alert("Settings saved successfully!");
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>;

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Settings</h1>
                <p className="text-sm font-medium text-gray-500">Configure your store preferences.</p>
            </div>

            {/* Developer Zone - SEED DATA (MOVED TO TOP) */}
            <div className="bg-red-50 p-6 rounded-3xl border-2 border-red-200 shadow-xl mb-8 relative z-[9999]" style={{ isolation: 'isolate' }}>
                <h2 className="text-lg font-black text-red-600 flex items-center gap-2 mb-4">
                    <span className="text-2xl">⚠</span> Developer Zone (v2 - FIX)
                </h2>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-red-100 shadow-sm relative z-[9999]">
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">👇 CLICK THIS BUTTON TO FIX DATA</h3>
                        <p className="text-sm text-gray-500 font-bold">Adds 40 sample products (10/category).</p>
                    </div>

                    {/* Raw Text Button just in case */}
                    <button onClick={() => alert("Raw button works")} className="underline text-red-500 font-bold z-[10000] relative cursor-pointer">
                        Test Click
                    </button>

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSeed();
                        }}
                        disabled={seedLoading}
                        style={{ pointerEvents: 'auto', cursor: 'pointer', zIndex: 99999, position: 'relative' }}
                        className="px-8 py-4 bg-red-600 text-white font-black text-lg rounded-xl shadow-xl hover:bg-red-700 hover:scale-105 transition-all flex items-center gap-2 active:bg-green-500"
                    >
                        {seedLoading ? <Loader2 className="animate-spin" /> : <Store size={24} />}
                        {seedLoading ? "SEEDING DATA..." : "INJECT TEST DATA NOW"}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSave} className="frosted-paper p-8 rounded-[2.5rem] border border-white/60 shadow-lg space-y-8">

                {/* General Settings */}
                <div className="space-y-6">
                    <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                        <Store size={20} className="text-primary" /> General
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Store Name</label>
                            <input
                                type="text"
                                name="storeName"
                                value={config.storeName || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/50 border border-transparent focus:border-primary/30 rounded-xl font-bold text-gray-900 outline-none transition-all focus:bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Contact Email</label>
                            <input
                                type="email"
                                name="contactEmail"
                                value={config.contactEmail || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/50 border border-transparent focus:border-primary/30 rounded-xl font-bold text-gray-900 outline-none transition-all focus:bg-white"
                            />
                        </div>
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* Communication */}
                <div className="space-y-6">
                    <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                        <MessageSquare size={20} className="text-green-500" /> WhatsApp & Support
                    </h2>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">WhatsApp Number (+91)</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="tel"
                                name="whatsappNumber"
                                value={config.whatsappNumber || ''}
                                onChange={handleChange}
                                placeholder="9876543210"
                                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-transparent focus:border-primary/30 rounded-xl font-bold text-gray-900 outline-none transition-all focus:bg-white"
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 pl-1">Used for "Chat on WhatsApp" buttons.</p>
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* Store Controls */}
                <div className="space-y-6">
                    <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                        <Store size={20} className="text-orange-500" /> Operations
                    </h2>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div>
                            <h3 className="font-bold text-gray-900">Accepting Orders</h3>
                            <p className="text-xs text-gray-500 font-medium">Turn off to temporarily close the store.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="acceptingOrders"
                                checked={config.acceptingOrders}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div>
                            <h3 className="font-bold text-gray-900">Email Notifications</h3>
                            <p className="text-xs text-gray-500 font-medium">Receive alerts for new orders.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="enableNotifications"
                                checked={config.enableNotifications}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                    </div>
                </div>

                <Button
                    type="submit"
                    isLoading={saving}
                    disabled={saving}
                    className="w-full h-14 text-lg bg-gray-900 text-white hover:bg-black shadow-xl"
                >
                    {!saving && <Save className="mr-2" />} Save Configuration
                </Button>

            </form>


            {/* Developer Utils (Discreet) */}
            <div className="pt-12 pb-4 opacity-40 hover:opacity-100 transition-opacity">
                <div className="border border-gray-200 rounded-3xl p-6 bg-gray-50/50">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Advanced Utils</h3>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-600">Reset & Seed Database</span>
                        <button
                            type="button"
                            onClick={handleSeed}
                            disabled={seedLoading}
                            className="text-xs bg-gray-200 hover:bg-red-100 hover:text-red-600 px-3 py-2 rounded-lg font-bold transition-colors"
                        >
                            {seedLoading ? "Processing..." : "Inject Test Data"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
