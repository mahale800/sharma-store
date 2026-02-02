import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, Smile, Zap, Heart, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

const NotificationPreferences = () => {
    const { preferences, updatePreferences } = useNotifications();

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
                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                        {preferences.enabled ? 'On' : 'Off'}
                    </span>
                    <button
                        onClick={() => updatePreferences({ enabled: !preferences.enabled })}
                        className={`w-12 h-7 rounded-full transition-colors flex items-center px-1 ${preferences.enabled ? 'bg-green-500' : 'bg-gray-200'}`}
                    >
                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${preferences.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                </div>
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
