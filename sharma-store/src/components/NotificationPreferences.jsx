import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import Button from './Button';
import { Bell, Smile, Zap, Heart, Briefcase, Lock, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const NotificationPreferences = () => {
    const { preferences, updatePreferences, requestPermission, permissionStatus, sendTestNotification, triggerMarketing, triggerAbandonedCart } = useNotifications();

    const tones = [
        { id: 'Professional', icon: Briefcase, color: 'bg-gray-100 text-gray-600', desc: 'Concise & Helpful' },
        { id: 'Friendly', icon: Smile, color: 'bg-blue-100 text-blue-600', desc: 'Warm & Inviting' },
        { id: 'Comedy', icon: Zap, color: 'bg-yellow-100 text-yellow-600', desc: 'Witty & Fun' },
        { id: 'Flirty', icon: Heart, color: 'bg-pink-100 text-pink-600', desc: 'Playful & Charming' },
    ];

    return (
        <div className="frosted-paper p-8 rounded-3xl border border-white/60">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <Bell size={24} /> Notification Style
                </h2>
            </div>

            {/* Granular Toggles */}
            <div className="mb-6 grid grid-cols-2 gap-3">
                {[
                    { key: 'orderUpdates', label: 'Orders' },
                    { key: 'marketing', label: 'Marketing' },
                    { key: 'loyalty', label: 'Loyalty' },
                    { key: 'cartReminders', label: 'Cart' }
                ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                        <span className="text-sm font-bold text-gray-700 capitalize">{label}</span>
                        <button
                            onClick={() => {
                                updatePreferences({ [key]: !preferences[key] });
                            }}
                            className={`w-8 h-5 rounded-full transition-colors flex items-center px-0.5 ${(preferences[key] ?? true) ? 'bg-orange-500' : 'bg-gray-200'
                                }`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${(preferences[key] ?? true) ? 'translate-x-3' : 'translate-x-0'
                                }`} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Push Permission Status */}
            <div className="mb-8 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-gray-900">Device Permissions</h3>
                    <p className="text-xs text-gray-500">
                        {permissionStatus === 'granted'
                            ? "You're all set to receive updates on this device."
                            : "Enable push notifications to get real-time order updates."}
                    </p>
                </div>
                {permissionStatus === 'granted' ? (
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                            <Check size={14} strokeWidth={3} />
                            <span className="text-xs font-black uppercase tracking-wide">Active</span>
                        </div>
                        <Button
                            onClick={sendTestNotification}
                            size="sm"
                            variant="secondary"
                            className="text-xs h-8"
                        >
                            Test Push
                        </Button>
                        <Button
                            onClick={triggerMarketing}
                            size="sm"
                            variant="outline"
                            className="text-xs h-8 ml-2"
                        >
                            Trigger Marketing
                        </Button>
                        <Button
                            onClick={triggerAbandonedCart}
                            size="sm"
                            variant="outline"
                            className="text-xs h-8 ml-2 text-red-500 border-red-200 bg-red-50"
                        >
                            Trigger AC
                        </Button>
                    </div>
                ) : (
                    <Button
                        onClick={requestPermission}
                        size="sm"
                        variant="primary"
                        className="shadow-lg shadow-orange-500/20"
                    >
                        Enable Push
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                {tones.map((tone) => (
                    <button
                        key={tone.id}
                        onClick={() => updatePreferences({ tone: tone.id })}
                        className={`relative p-4 rounded-2xl border transition-all text-left group ${preferences.tone === tone.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-200 bg-white'
                            }`}
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${tone.color}`}>
                            <tone.icon size={20} />
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm mb-1">{tone.id}</h3>
                        <p className="text-xs text-gray-500 font-medium">{tone.desc}</p>

                        {preferences.tone === tone.id && (
                            <motion.div layoutId="active-ring" className="absolute inset-0 border-2 border-orange-500 rounded-2xl" />
                        )}
                    </button>
                ))}
            </div>

            <p className="mt-6 text-xs font-medium text-gray-400 text-center">
                We'll use AI to customize your updates based on this style.
            </p>
        </div>
    );
};

export default NotificationPreferences;
