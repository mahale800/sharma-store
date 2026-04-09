import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

import { AlertCircle, ArrowRight, Clock, Coins } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useLoyalty } from '../context/LoyaltyContext';
import DailyLoginPopup from '../components/loyalty/DailyLoginPopup';
import StreakWarningBanner from '../components/loyalty/StreakWarningBanner';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import Logo from '../components/common/Logo';
import RecommendationRow from '../components/RecommendationRow';
import RecentlyViewed from '../components/RecentlyViewed';

const Home = () => {
    const {
        filteredProducts,
        loading,
        usingFallbackProducts,
        searchQuery,
        selectedCategory, setSelectedCategory,
        categories
    } = useShop();
    const { coins } = useLoyalty();

    // Reward Popup State (Lifted Up)
    const [showReward, setShowReward] = useState(false);

    useEffect(() => {
        // Check for daily login
        const checkDailyLogin = () => {
            const today = new Date().toDateString();
            const lastLogin = localStorage.getItem('lastDailyPopup');
            if (lastLogin !== today) {
                // Delay slightly for effect
                setTimeout(() => setShowReward(true), 1500);
            }
        };
        checkDailyLogin();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <>
            {/* Main Content */}
            <div className="w-full pb-8 bg-slate-50 font-sans page-enter relative z-0">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">

                    {/* Bento Grid Hero Layout */}
                    {!searchQuery && (selectedCategory === "All" || selectedCategory === "all") && (
                        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-auto gap-6 mb-16">
                            {/* Hero Bento Card (2x2) - Solid Indigo */}
                            <div className="md:col-span-2 md:row-span-2 relative h-[500px] md:h-auto rounded-3xl overflow-hidden shadow-xl bg-indigo-600 group">
                                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                                <div className="relative z-10 flex flex-col justify-center h-full p-8 md:p-12 max-w-lg">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        <Logo variant="full" size="md" color="white" className="mb-6" />
                                    </motion.div>

                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-widest w-fit mb-6"
                                    >
                                        Limited Release
                                    </motion.span>

                                    <motion.h1
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                                        className="text-5xl md:text-6xl font-black text-white leading-tight mb-6 tracking-tight drop-shadow-sm"
                                    >
                                        New Semester <br /> Essentials
                                    </motion.h1>

                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                        className="text-lg text-white/80 font-medium mb-10 leading-relaxed max-w-sm drop-shadow-sm"
                                    >
                                        Frosted paper textures for the modern creative. Curated for focus and flow.
                                    </motion.p>

                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.8 }}
                                    >
                                        <Link to="/products" className="bg-white text-indigo-600 font-bold px-8 py-3 rounded-full shadow-lg hover:bg-gray-50 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 w-fit">
                                            Shop Bundle <ArrowRight size={20} />
                                        </Link>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Top Right: Daily Reward Status (Desktop only, Replaces Loyalty Perk) */}
                            <div
                                onClick={() => setShowReward(true)}
                                className="frosted-paper rounded-3xl p-6 bento-shadow flex flex-col justify-between border-b-4 border-b-primary min-h-[220px] relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100/50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="bg-white p-2 rounded-xl shadow-sm">
                                            <Coins className="text-primary size-8 animate-bounce" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-white/50 px-2 py-1 rounded-lg">Status</span>
                                    </div>
                                    <h3 className="text-lg font-black text-gray-900 mb-1">Daily Streak</h3>
                                    <p className="text-sm text-gray-500 font-medium">Keep it up!</p>
                                </div>
                                <div className="relative z-10 mt-4">
                                    <p className="text-3xl font-black text-primary flex items-baseline gap-1">
                                        {coins.toLocaleString()} <span className="text-sm text-gray-400 font-bold uppercase">Coins</span>
                                    </p>
                                    <div className="mt-4 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary w-[75%] rounded-full shadow-lg shadow-primary/50"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Flash Sale (1x1) */}
                            <div className="bg-yellow-300 rounded-3xl p-8 bento-shadow flex flex-col justify-between overflow-hidden relative min-h-[220px] group hover:scale-[1.02] transition-transform">
                                <div className="relative z-10">
                                    <h3 className="text-xl font-black text-black">Flash Sale</h3>
                                    <p className="text-sm text-black/70 font-bold flex items-center gap-1"><Clock size={16} /> Ends in 04:22:10</p>
                                </div>
                                <div className="relative z-10">
                                    <p className="text-sm font-bold text-black uppercase">Wooden Toys</p>
                                    <p className="text-2xl font-black text-black">Up to 40% Off</p>
                                </div>
                                <ShoppingBagIcon className="absolute -right-4 -bottom-4 text-black/10 size-32 group-hover:rotate-12 transition-transform" />
                            </div>
                        </div>
                    )}

                    {/* Startup Personalization Sections */}
                    {!searchQuery && (selectedCategory === "All" || selectedCategory === "all") && (
                        <div className="mb-16 space-y-12">
                            {usingFallbackProducts && (
                                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 flex items-start gap-3">
                                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                    <span>
                                        Showing a preview product catalog because the live database is unavailable right now.
                                    </span>
                                </div>
                            )}
                            <RecommendationRow source="home" />
                            <RecommendationRow source="trending" />
                            <RecentlyViewed currentProductId={null} />
                        </div>
                    )}

                    <div id="products-grid" className="scroll-mt-32">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                                {searchQuery ? `Search: ${searchQuery}` : "Latest Drops"}
                                <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">Hot</span>
                            </h2>

                            {/* Scrollable Categories for Mobile/Desktop */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 max-w-[50%] md:max-w-none no-scrollbar">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Product Feed */}
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-[400px] bg-gray-100 rounded-3xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true }}
                                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
                            >
                                {filteredProducts.map((product) => (
                                    <motion.div key={product.id} variants={itemVariants} className="h-full">
                                        <ProductCard product={product} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <div className="text-center py-24 frosted-paper rounded-3xl">
                                <p className="text-gray-500 font-bold text-lg">No products found.</p>
                            </div>
                        )}
                    </div>
                </main>

                {/* Mobile Fixed Floating Reward Pill (Bottom Left/Above Nav) */}
                <div
                    onClick={() => setShowReward(true)}
                    // Mobile: bottom-20 to clear Nav. Left aligned.
                    className="fixed bottom-20 left-4 z-40 md:hidden animate-in slide-in-from-bottom-5 cursor-pointer hover:scale-105 transition-transform"
                >
                    <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl shadow-orange-500/20 rounded-full pl-2 pr-4 py-2 flex items-center gap-3 ring-1 ring-gray-100">
                        <div className="bg-gradient-to-tr from-orange-400 to-orange-500 text-white p-2 rounded-full shadow-lg">
                            <Coins size={16} className="fill-white animate-pulse" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-500 uppercase leading-none">Daily Reward</span>
                            <span className="text-xs font-black text-gray-900 leading-tight">Claim Now</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Viewport Locked Overlay - Outside main container */}
            <DailyLoginPopup isOpen={showReward} onClose={() => setShowReward(false)} />

            {/* Streak Warning Banner (Conditional) */}
            <StreakWarningBanner onClaimClick={() => setShowReward(true)} />
        </>
    );
};

// Helper Icon for decoration
const ShoppingBagIcon = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M16 6V4H8V6M7 18H17V8H7V18M19 6H22V20H2V6H5V3H19V6Z" />
    </svg>
)

export default Home;
