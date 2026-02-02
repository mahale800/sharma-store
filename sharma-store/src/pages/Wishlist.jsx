import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingCart, Heart, ArrowRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Wishlist = () => {
    const { wishlistItems, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();

    const handleMoveToCart = (product) => {
        addToCart(product);
        removeFromWishlist(product.id);
    };

    if (wishlistItems.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
                    <Heart size={48} className="text-red-300 fill-red-100" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Wishlist is Empty</h2>
                <p className="text-gray-500 mb-8 text-center max-w-sm">
                    Looks like you haven't saved any items yet. Explore our products and save your favorites!
                </p>
                <Link
                    to="/"
                    className="flex items-center gap-2 px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-orange-200"
                >
                    <Home size={20} /> Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
                    <p className="text-gray-500 mt-1">{wishlistItems.length} items saved</p>
                </div>
                <Link
                    to="/"
                    className="flex items-center gap-2 text-gray-500 hover:text-orange-600 font-medium transition-colors"
                >
                    <Home size={18} /> Home
                </Link>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wishlistItems.map((item) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        key={item.id}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all"
                    >
                        <div className="relative aspect-square overflow-hidden bg-gray-50">
                            <img
                                src={item.image || item.imageUrl || item.img || 'https://placehold.co/400x400'}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <button
                                onClick={() => removeFromWishlist(item.id)}
                                className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                                title="Remove from Wishlist"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <div className="p-5">
                            <div className="mb-4">
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">{item.category}</p>
                                <h3 className="font-bold text-gray-900 leading-tight truncate">{item.name}</h3>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <span className="text-xl font-bold text-gray-900">₹{item.price}</span>
                                <button
                                    onClick={() => handleMoveToCart(item)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-all"
                                >
                                    <ShoppingCart size={16} />
                                    Move to Cart
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Wishlist;
