import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    LogOut
} from 'lucide-react';

const AdminMobileNav = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const { storeProfile } = useStoreSettings();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const sidebarLinks = [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dash' },
        { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
        { path: '/admin/products', icon: Package, label: 'Prods' },
        { path: '/admin/customers', icon: Users, label: 'Users' },
    ];

    return (
        <>
            {/* --- MOBILE HEADER --- */}
            <div className="md:hidden sticky top-0 z-30 flex items-center justify-between mb-6 px-4 py-4 bg-slate-50/90 backdrop-blur-xl border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                        <span className="font-black text-lg">S.</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-gray-900">{storeProfile.shortName}</h2>
                        <p className="text-xs text-gray-500 font-bold">Admin Panel</p>
                    </div>
                </div>
                <button onClick={handleLogout} className="p-2 bg-white rounded-full shadow-sm text-gray-500 hover:text-red-500">
                    <LogOut size={20} />
                </button>
            </div>

            {/* --- MOBILE BOTTOM NAV --- */}
            <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-gray-200 z-50 px-6 py-2 pb-safe shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                <div className="flex justify-between items-center">
                    {sidebarLinks.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            end={link.path === '/admin/dashboard'}
                            className={({ isActive }) =>
                                `flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive
                                    ? 'text-orange-500'
                                    : 'text-gray-400 hover:text-gray-600'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-orange-500/10' : 'bg-transparent'}`}>
                                        <link.icon
                                            size={22}
                                            strokeWidth={isActive ? 2.5 : 2}
                                            className={isActive ? 'drop-shadow-sm' : ''}
                                        />
                                    </div>
                                    <span className="text-[10px] font-bold">{link.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </div>
        </>
    );
};

export default AdminMobileNav;
