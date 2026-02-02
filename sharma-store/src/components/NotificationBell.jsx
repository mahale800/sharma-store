import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationBell = () => {
    const { notifications, unreadCount, markAllAsRead, clearAll, markAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Tone Colors
    const getToneStyles = (tone) => {
        switch (tone) {
            case 'Professional': return 'bg-gray-50 border-gray-100';
            case 'Friendly': return 'bg-blue-50 border-blue-100';
            case 'Comedy': return 'bg-yellow-50 border-yellow-100';
            case 'Flirty': return 'bg-pink-50 border-pink-100';
            default: return 'bg-white border-gray-100';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl text-gray-500 hover:text-orange-600 hover:bg-orange-50 transition-all group"
            >
                <Bell className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-12 text-orange-600' : ''}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-80 sm:w-96 bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl overflow-hidden z-50 origin-top-right ring-1 ring-black/5"
                    >
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white/50">
                            <h3 className="font-bold text-gray-900">Notifications</h3>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button onClick={markAllAsRead} className="p-1.5 text-xs font-bold text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors" title="Mark all read">
                                        <Check size={14} />
                                    </button>
                                )}
                                <button onClick={clearAll} className="p-1.5 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors" title="Clear all">
                                    <Trash2 size={14} />
                                </button>
                                <button onClick={() => setIsOpen(false)} className="md:hidden p-1.5 text-gray-400">
                                    <X size={14} />
                                </button>
                            </div>
                        </div>

                        {/* List */}
                        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-2 no-scrollbar">
                            {notifications.length > 0 ? (
                                notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        onClick={() => markAsRead(notif.id)}
                                        className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${getToneStyles(notif.tone)} ${notif.read ? 'opacity-60 grayscale-[0.5]' : 'opacity-100 shadow-sm'}`}
                                    >
                                        <div className="flex gap-3">
                                            {/* Icon based on Tone/Type could go here */}
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-gray-900 leading-snug mb-1">{notif.message}</p>
                                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                                    <span>{notif.tone}</span> • <span>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                            {!notif.read && (
                                                <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 shrink-0" />
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center text-gray-400">
                                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-xs font-bold uppercase tracking-widest">No Updates</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
