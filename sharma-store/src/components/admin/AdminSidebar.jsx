
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    LogOut,
    MessageSquare,
    Map,
    Trophy
} from 'lucide-react';
import Logo from '../common/Logo';

const AdminSidebar = () => {
    const { logout, currentUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const sidebarLinks = [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/rewards', icon: Trophy, label: 'Rewards' },
        { path: '/admin/products', icon: Package, label: 'Products' },
        { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
        { path: '/admin/customers', icon: Users, label: 'Customers' },
        { path: '/admin/feedback', icon: MessageSquare, label: 'Feedback' },
        { path: '/admin/roadmap', icon: Map, label: 'Roadmap' },
    ];

    return (
        <aside className="hidden md:flex fixed left-6 top-6 bottom-6 w-64 frosted-paper rounded-3xl flex-col border border-white/60 shadow-xl z-50">
            {/* Brand Header */}
            <div className="flex items-center gap-3 px-4 mb-8 pt-8">
                <Logo variant="full" size="md" />
            </div>

            {/* Nav Links */}
            {/* Nav Links */}
            <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto no-scrollbar">
                {sidebarLinks.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        className={({ isActive }) =>
                            `flex items - center gap - 3 px - 4 py - 3.5 text - sm font - bold rounded - 2xl transition - all duration - 300 group relative overflow - hidden ${isActive
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                                : 'text-gray-500 hover:bg-white hover:shadow-sm hover:text-gray-900'
                            } `
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <link.icon
                                    size={20}
                                    className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-orange-500 transition-colors'} `}
                                />
                                {link.label}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* User Profile Footer */}
            <div className="p-4 mt-auto">
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-xs uppercase">
                            {currentUser?.email?.slice(0, 2) || 'AD'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-black text-gray-900 truncate">Administrator</p>
                            <p className="text-[10px] text-gray-500 truncate font-medium w-32">{currentUser?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
                    >
                        <LogOut size={14} /> Logout
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default AdminSidebar;
