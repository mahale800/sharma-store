import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import ProductCard from '../components/ProductCard';
import { Search } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { motion } from 'framer-motion';

const Shop = () => {
    const {
        filteredProducts,
        loading,
        searchQuery, setSearchQuery,
        selectedCategory, setSelectedCategory,
        sortBy, setSortBy,
        categories,
        resetFilters
    } = useShop();

    // Removed local fetching and filtering logic - now in Context

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen pt-28 pb-24 bg-slate-50 font-sans page-enter">
            <div className="max-w-[1300px] mx-auto px-4 sm:px-6 md:px-12">

                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Shop All</h1>

                    {/* Controls Bar */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">

                        {/* Search Input (Mobile Duplicate / Desktop Helper) */}
                        <div className="relative w-full md:w-96 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all font-bold"
                            />
                        </div>

                        {/* Filters & Sort */}
                        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
                            <div className="flex bg-gray-100 p-1 rounded-xl">
                                <button
                                    onClick={() => setSortBy("featured")}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${sortBy === "featured" ? 'bg-white shadow text-slate-900' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    Featured
                                </button>
                                <button
                                    onClick={() => setSortBy("price-low")}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${sortBy === "price-low" ? 'bg-white shadow text-slate-900' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    Rs. Low-High
                                </button>
                                <button
                                    onClick={() => setSortBy("price-high")}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${sortBy === "price-high" ? 'bg-white shadow text-slate-900' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    Rs. High-Low
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categories Tabs */}
                <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap transition-colors border ${selectedCategory === cat ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="h-[400px] bg-gray-100 rounded-3xl animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8"
                    >
                        {filteredProducts.map((product) => (
                            <motion.div key={product.id} variants={itemVariants} className="h-full">
                                <ProductCard product={product} />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Search className="text-gray-300" size={40} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">No products found</h2>
                        <p className="text-gray-500">Try adjusting your search or filters.</p>
                        <button
                            onClick={resetFilters}
                            className="mt-6 px-6 py-2 bg-orange-600 text-white font-bold rounded-xl shadow-lg hover:bg-orange-700 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Shop;
