import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Zap, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { usePerformance } from '../hooks/usePerformance';
import { useEngagement } from '../hooks/useEngagement';
import Button from './Button';

import Card from './common/Card';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { addToCart, clearCart } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const isWishlisted = isInWishlist(product.id);
    const isOutOfStock = Number(product.stock) === 0;

    // Fallback image logic
    const [imgSrc, setImgSrc] = useState(product.image || product.imageUrl || product.img || 'https://placehold.co/400x400?text=No+Image');

    const { logEvent } = useEngagement();

    const handleAddToCart = (e) => {
        e.stopPropagation();
        if (isOutOfStock) {
            return;
        } 
        logEvent('add_to_cart', 'organic', { productId: product.id });
        addToCart(product);
    };

    const handleBuyNow = (e) => {
        e.stopPropagation();

        if (!product || isOutOfStock) {
            return;
        }
        logEvent('checkout_attempt', 'organic', { productId: product.id, isBuyNow: true });
        // Unified Flow: Clear cart, add item, go to address
        clearCart();
        addToCart(product);
        navigate('/checkout/address');
    };

    const handleWishlist = (e) => {
        e.stopPropagation();
        toggleWishlist(product);
    };

    const { shouldAnimate } = usePerformance();

    return (
        <Card
            padded={false}
            hoverable={shouldAnimate}
            onClick={() => {
                if (product?.id) {
                    navigate(`/product/${product.id}`);
                } else {
                    console.error("Product ID missing in ProductCard:", product);
                }
            }}
            className={`group h-full flex flex-col relative overflow-hidden bg-white rounded-3xl border-gray-100 ${shouldAnimate ? 'hover:shadow-xl hover:shadow-orange-500/10' : ''}`}
        >
            {/* Image Area */}
            <div className="relative aspect-square bg-gray-50 w-full overflow-hidden">
                <img
                    src={imgSrc}
                    alt={product.name}
                    loading="lazy"
                    className={`w-full h-full object-cover transition-transform duration-300 ${shouldAnimate ? 'group-hover:scale-110' : ''}`}
                    onError={() => setImgSrc('https://placehold.co/400x400?text=No+Image')}
                />

                {/* Category Label */}
                <p className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg">
                    {product.category || 'Collection'}
                </p>
                {isOutOfStock && (
                    <span className="absolute bottom-4 left-4 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                        Out of Stock
                    </span>
                )}

                {/* Wishlist Button */}
                <button
                    onClick={handleWishlist}
                    className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-md transition-all duration-200 ${isWishlisted ? 'bg-red-50 text-red-500' : 'bg-white/60 text-gray-400 hover:bg-white hover:text-red-500'}`}
                >
                    <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
                </button>
            </div>

            {/* Content Area */}
            <div className="p-5 flex flex-col flex-grow">
                {/* Title & Price */}
                <div className="mb-4">
                    <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2 truncate group-hover:text-orange-600 transition-colors">
                        {product.name}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-900 font-black text-xl">₹{product.price}</span>
                        {product.originalPrice && <span className="text-gray-400 text-sm line-through font-bold">₹{product.originalPrice}</span>}
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-auto grid grid-cols-[auto_1fr] gap-2">
                    {/* Add to Cart - Reveal on Desktop Hover */}
                    <div className="transition-all duration-300 ease-out transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 lg:block hidden">
                        <Button
                            variant="secondary"
                            size="icon"
                            onClick={handleAddToCart}
                            className="bg-gray-100 text-gray-900 hover:bg-gray-200 shadow-none border-0"
                        >
                            <ShoppingCart size={18} />
                        </Button>
                    </div>
                    {/* Mobile: Always Visible */}
                    <div className="lg:hidden block">
                        <Button
                            variant="secondary"
                            size="icon"
                            onClick={handleAddToCart}
                            className="bg-gray-100 text-gray-900 hover:bg-gray-200 shadow-none border-0"
                        >
                            <ShoppingCart size={18} />
                        </Button>
                    </div>

                    <Button
                        variant="primary"
                        size="md"
                        onClick={handleBuyNow}
                        disabled={isOutOfStock}
                        className="w-full rounded-full shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-all font-black"
                    >
                        <Zap size={18} className="mr-1" fill="currentColor" />
                        {isOutOfStock ? 'Unavailable' : 'Buy Now'}
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default ProductCard;
