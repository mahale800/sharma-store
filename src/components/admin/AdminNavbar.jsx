import React from 'react';
import { Search, Bell, Settings } from 'lucide-react';

const AdminNavbar = () => {
    return (
        <header className="hidden md:flex justify-between items-center mb-10 pl-2">
            <div className="w-full max-w-md relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="Search orders, products..."
                    className="w-full pl-12 pr-4 py-3 bg-white/40 border border-white/60 hover:bg-white/60 focus:bg-white backdrop-blur-md rounded-2xl text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm"
                />
            </div>
            <div className="flex items-center gap-4">
                <button className="relative w-11 h-11 bg-white/40 hover:bg-white backdrop-blur-md rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 transition-all shadow-sm group">
                    <Bell size={20} />
                    <span className="absolute top-2 right-3 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                </button>
                <button className="w-11 h-11 bg-white/40 hover:bg-white backdrop-blur-md rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 transition-all shadow-sm">
                    <Settings size={20} />
                </button>
            </div>
        </header>
    );
};

export default AdminNavbar;
