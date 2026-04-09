import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, ShoppingCart, User, Coins, Search, X, Store } from 'lucide-react';
import { useLoyalty } from '../context/LoyaltyContext';
import { useCart } from '../context/CartContext';
import { useShop } from '../context/ShopContext';
import NotificationBell from './NotificationBell';
import Logo from './common/Logo';
import { useStoreSettings } from '../context/StoreSettingsContext';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { coins } = useLoyalty();
    const { cartCount } = useCart();
    const { searchQuery, setSearchQuery, resetFilters } = useShop();
    const { storeProfile } = useStoreSettings();

    // Mobile Search Toggle
    const [showSearch, setShowSearch] = useState(false);

    // Helper to check if link is active
    const isActive = (path) => location.pathname === path;

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        if (location.pathname !== '/' && e.target.value) {
            navigate('/'); // Auto-redirect to home on search if not there
        }
    };

    const handleLogoClick = () => {
        resetFilters();
        window.scrollTo(0, 0);
    };

    return (
        <>
            {/* Desktop: Floating Island Navbar */}
            <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-[1200px] hidden md:block print:hidden">
                <div className="frosted-paper bento-shadow rounded-2xl px-6 py-4 flex items-center justify-between border border-white/40">
                    <div className="flex items-center gap-8">
                        {/* Brand Logo - UNIFIED STYLE (Matches Mobile) */}
                        <Link to="/" onClick={handleLogoClick} className="group">
                            <Logo variant="full" size="md" />
                            {/* Optional Tagline */}
                            <span className="block text-[10px] text-slate-500 font-medium tracking-wider uppercase pl-[52px] -mt-1 hidden sm:block">
                                Jalgaon Store
                            </span>
                        </Link>

                        <div className="flex items-center gap-2 bg-gray-100/50 p-1 rounded-xl border border-gray-200/50">
                            {['/', '/products', '/account'].map(path => (
                                <Link
                                    key={path}
                                    to={path}
                                    onClick={resetFilters} // Reset filters when navigating via menu
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${isActive(path) ? 'bg-white shadow-lg shadow-orange-500/20 text-orange-600 scale-105' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'}`}
                                >
                                    {path === '/' ? 'Home' : path === '/products' ? 'Shop' : 'Account'}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-md mx-8 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder={`Search ${storeProfile.categories.slice(0, 3).join(', ').toLowerCase()}...`}
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full pl-12 pr-4 py-3 bg-gray-100/50 hover:bg-white focus:bg-white border-transparent focus:border-primary/20 border-2 rounded-xl outline-none transition-all font-bold text-gray-900 placeholder:font-medium placeholder:text-gray-400"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Sharma Coins Balance */}
                        <div className="bg-gradient-to-r from-orange-50 to-orange-100 text-primary px-4 py-2.5 rounded-xl flex items-center gap-2 border border-orange-200/50 shadow-sm">
                            <Coins className="size-5 fill-primary text-primary" strokeWidth={2.5} />
                            <span className="text-sm font-black">{coins.toLocaleString()}</span>
                        </div>

                        {/* Desktop Cart Button - Solid Orange Pill */}
                        <Link
                            to="/cart"
                            className="relative flex items-center justify-center bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-full transition-all shadow-md hover:shadow-lg group"
                        >
                            {/* Icon */}
                            <ShoppingCart className="w-5 h-5" />

                            {/* Text Label (Desktop Only) */}
                            <span className="hidden lg:block ml-2 font-bold px-1">Cart</span>

                            {/* Count Badge */}
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-white text-orange-600 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-orange-600">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Notification Bell */}
                        <NotificationBell />
                    </div>
                </div>
            </nav>

            {/* Mobile Header (Top) */}
            <nav className="fixed top-0 left-0 w-full z-40 bg-white/85 backdrop-blur-xl border-b border-gray-100 md:hidden px-4 pt-3 pb-3 print:hidden shadow-[0_10px_30px_-25px_rgba(15,23,42,0.45)]">
                <div className="flex items-center justify-between gap-3">
                    {/* Brand Logo - UNIFIED STYLE (Same on Mobile & Laptop) */}
                    <Link to="/" className="group min-w-0" onClick={handleLogoClick}>
                        <Logo variant="full" size="sm" />
                    </Link>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => setShowSearch(prev => !prev)}
                            className={`w-10 h-10 rounded-xl border transition-colors flex items-center justify-center ${showSearch ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-gray-200 text-gray-500'}`}
                            aria-label="Toggle search"
                        >
                            {showSearch ? <X size={18} /> : <Search size={18} />}
                        </button>
                        <div className="bg-gradient-to-r from-orange-50 to-orange-100 text-primary px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-orange-200/50">
                            <Coins className="size-3.5 fill-primary text-primary" strokeWidth={2.5} />
                            <span className="text-xs font-black">{coins.toLocaleString()}</span>
                        </div>
                        <NotificationBell />
                    </div>
                </div>

                {/* Mobile Search Expandable */}
                {
                    showSearch && (
                        <div className="animate-in slide-in-from-top-2 fade-in duration-200 pt-3">
                            <input
                                autoFocus
                                type="text"
                                placeholder="What are you looking for?"
                                value={searchQuery}
                                onChange={handleSearch}
                                className="w-full pl-4 pr-4 py-3 bg-gray-100 rounded-2xl outline-none font-bold text-base text-gray-900 placeholder:text-sm"
                            />
                        </div>
                    )
                }
            </nav>

            {/* Mobile Bottom Navigation Bar (Fixed) - Hidden on specific pages */}
            {
                !['/cart', '/checkout'].includes(location.pathname) && !location.pathname.startsWith('/product/') && (
                    <nav className="fixed bottom-0 left-0 w-full bg-white/92 backdrop-blur-xl border-t border-gray-200 z-50 md:hidden pb-safe print:hidden shadow-[0_-10px_40px_-20px_rgba(15,23,42,0.2)]">
                        <div className="grid grid-cols-5 items-center justify-around relative px-2 py-1 h-[72px]">

                            {/* Home */}
                            <Link to="/" className={`flex flex-col items-center justify-center w-full gap-1 transition-all duration-300 ${isActive('/') ? 'text-orange-600 -translate-y-1' : 'text-gray-400 hover:text-gray-600'}`}>
                                <Home className={`size-6 transition-transform duration-300 ${isActive('/') ? 'scale-110 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]' : ''}`} strokeWidth={isActive('/') ? 3 : 2} />
                                <span className={`text-[10px] font-bold transition-opacity ${isActive('/') ? 'opacity-100' : 'opacity-80'}`}>Home</span>
                            </Link>

                            <Link to="/products" className={`flex flex-col items-center justify-center w-full gap-1 transition-all duration-300 ${isActive('/products') ? 'text-orange-600 -translate-y-1' : 'text-gray-400 hover:text-gray-600'}`}>
                                <Store className={`size-6 transition-transform duration-300 ${isActive('/products') ? 'scale-110 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]' : ''}`} strokeWidth={isActive('/products') ? 3 : 2} />
                                <span className="text-[10px] font-bold">Shop</span>
                            </Link>

                            {/* Floating Cart Button */}
                            <div className="relative -top-6 group flex justify-center">
                                <Link
                                    to="/cart"
                                    className="w-14 h-14 bg-orange-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-orange-500/40 border-4 border-white transform transition-transform duration-300 hover:scale-110 active:scale-95 animate-breathe gpu-accelerated"
                                >
                                    <ShoppingCart className="size-6" strokeWidth={2.5} />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-bounce-short">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>
                            </div>

                            {/* Search Toggle */}
                            <button
                                onClick={() => setShowSearch(!showSearch)}
                                className={`flex flex-col items-center justify-center w-full gap-1 transition-all duration-300 ${showSearch ? 'text-orange-600 -translate-y-1' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <Search className={`size-6 transition-transform duration-300 ${showSearch ? 'scale-110 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]' : ''}`} strokeWidth={showSearch ? 3 : 2} />
                                <span className="text-[10px] font-bold">Search</span>
                            </button>

                            {/* Account */}
                            <Link to="/account" className={`flex flex-col items-center justify-center w-full gap-1 transition-all duration-300 ${isActive('/account') ? 'text-orange-600 -translate-y-1' : 'text-gray-400 hover:text-gray-600'}`}>
                                <User className={`size-6 transition-transform duration-300 ${isActive('/account') ? 'scale-110 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]' : ''}`} strokeWidth={isActive('/account') ? 3 : 2} />
                                <span className="text-[10px] font-bold">Account</span>
                            </Link>

                        </div>
                    </nav>
                )
            }
        </>
    );
};

export default Navbar;
