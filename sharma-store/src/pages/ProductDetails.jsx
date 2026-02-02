import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { ShoppingCart, Zap, Heart, ShieldCheck, Truck, RefreshCw, Banknote, Star, Minus, Plus, Store, Gift, MessageCircle, ChevronRight, Share2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { motion } from 'framer-motion';
import RecommendationRow from '../components/RecommendationRow';
import ReviewList from '../components/ReviewList';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(null);
    const [qty, setQty] = useState(1);
    const [isGift, setIsGift] = useState(false);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }

        const fetchProduct = async () => {
            try {
                const docRef = doc(db, "products", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = { ...docSnap.data(), id: docSnap.id };
                    setProduct(data);
                    setActiveImage(data.image || data.imageUrl || data.img || 'https://placehold.co/600x600?text=No+Image');
                } else {
                    console.log("No such product!");
                }
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
        window.scrollTo(0, 0);
    }, [id]);

    const handleBuyNow = () => {
        navigate('/checkout', { state: { directBuyProduct: { ...product, quantity: qty, isGift } } });
    };

    const handleWhatsApp = () => {
        const message = `Hi Sharma Store, I am interested in ${product.name}. Is it available?`;
        const url = `https://wa.me/919021780559?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const handleQtyChange = (delta) => {
        setQty(prev => {
            const manualLimit = 10;
            const stockLimit = product?.stock || 10;
            const limit = Math.min(manualLimit, stockLimit);
            const newValue = prev + delta;
            return Math.max(1, Math.min(newValue, limit));
        });
    };

    if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

    if (!product) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
            <button onClick={() => navigate('/')} className="px-6 py-3 bg-primary text-white rounded-xl font-bold">Go Home</button>
        </div>
    );

    const isWishlisted = isInWishlist(product.id);
    const discount = product.discountPercent || 30; // Use actual discount if available
    const mrp = product.mrp || Math.round(product.price * 1.42);

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen bg-slate-50 font-sans text-gray-900 pb-32 md:pb-20 page-enter pt-20"
            >
                <main className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 py-6">

                    {/* 1. Breadcrumb & Actions */}
                    <div className="flex items-center justify-between mb-6">
                        <nav className="flex items-center gap-2 text-sm text-gray-500 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar">
                            <Link to="/" className="hover:text-primary transition-colors font-bold">Home</Link>
                            <ChevronRight size={14} />
                            <span className="text-gray-900 font-medium capitalize">{product.category || 'Shop'}</span>
                            <ChevronRight size={14} />
                            <span className="text-gray-400 truncate max-w-[150px]">{product.name}</span>
                        </nav>
                        <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                            <Share2 size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        {/* Left: Gallery - Sticky on Desktop */}
                        <div className="space-y-4 md:sticky md:top-24 h-fit z-10">
                            <div className="relative aspect-square bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm group">
                                <img
                                    src={activeImage}
                                    alt={product.name}
                                    className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-500"
                                />
                                <button
                                    onClick={() => toggleWishlist(product)}
                                    className={`absolute top-4 right-4 p-3 rounded-full shadow-lg transition-all active:scale-95 ${isWishlisted ? 'bg-red-50 text-red-500 border-red-100' : 'bg-white text-gray-400 hover:text-red-500 border-gray-100'} border`}
                                >
                                    <Heart size={24} className={isWishlisted ? 'fill-current' : ''} />
                                </button>
                                {/* Zoom Hint */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[10px] px-3 py-1 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    Hover to Zoom
                                </div>
                            </div>
                        </div>

                        {/* Right: Info */}
                        <div className="flex flex-col">
                            {/* Product Title */}
                            <h1 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight mb-2 tracking-tight">
                                {product.name}
                            </h1>

                            {/* Ratings */}
                            <div className="flex items-center gap-2 mb-6">
                                <div className="flex items-center bg-green-600 text-white px-2 py-0.5 rounded text-sm font-bold gap-1">
                                    {product.rating || 4.5} <Star size={12} fill="currentColor" />
                                </div>
                                <span className="text-sm font-medium text-gray-500">{product.reviewsCount || 120} Ratings & Reviews</span>
                            </div>

                            {/* Price Block */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 mb-6 shadow-sm">
                                <div className="flex items-baseline gap-3 mb-2">
                                    <span className="text-4xl font-black text-gray-900 tracking-tight">₹{product.price}</span>
                                    <span className="text-lg text-gray-400 line-through decoration-2">₹{mrp}</span>
                                    <span className="text-orange-600 text-lg font-bold">({discount}% OFF)</span>
                                </div>
                                <p className="text-xs text-green-600 font-bold mb-4">inclusive of all taxes</p>

                                {/* Stock Status */}
                                {product.stock < 10 && product.stock > 0 && (
                                    <p className="text-xs font-bold text-red-500 animate-pulse mb-0">
                                        Only {product.stock} left in stock!
                                    </p>
                                )}
                                {product.stock === 0 && (
                                    <p className="text-sm font-bold text-red-500 mb-0">
                                        Currently Unavailable
                                    </p>
                                )}
                            </div>

                            {/* Desktop Actions Block */}
                            <div className="hidden md:grid grid-cols-[140px_1fr_1fr] gap-4 mb-8">
                                {/* Qty Selector */}
                                <div className="flex items-center justify-between bg-gray-100 rounded-xl px-2 h-14">
                                    <button onClick={() => handleQtyChange(-1)} disabled={qty <= 1} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-lg transition-colors disabled:opacity-30"><Minus size={18} /></button>
                                    <span className="font-bold text-lg">{qty}</span>
                                    <button onClick={() => handleQtyChange(1)} disabled={qty >= 10} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-lg transition-colors disabled:opacity-30"><Plus size={18} /></button>
                                </div>

                                <button
                                    onClick={() => addToCart({ ...product, isGift }, qty)}
                                    className="h-14 bg-white border-2 border-gray-900 text-gray-900 rounded-xl font-bold hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-lg"
                                >
                                    <ShoppingCart size={20} /> Add to Cart
                                </button>

                                <button
                                    onClick={handleBuyNow}
                                    className="h-14 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 active:scale-[0.98] transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 text-lg"
                                >
                                    <Zap size={20} fill="currentColor" /> Buy Now
                                </button>
                            </div>

                            {/* Quick Trust Info */}
                            <div className="grid grid-cols-4 gap-2 mb-8 border-b border-gray-200 pb-8">
                                {[
                                    { icon: Truck, label: "Fast Delivery", sub: "in 2 days" },
                                    { icon: ShieldCheck, label: "Genuine", sub: "100% Verified" },
                                    { icon: RefreshCw, label: "Easy Return", sub: "7 Days" },
                                    { icon: Banknote, label: "COD", sub: "Available" }
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col items-center text-center p-2 rounded-xl hover:bg-white transition-colors">
                                        <div className="mb-2 text-primary bg-primary/10 p-2 rounded-full">
                                            <item.icon size={20} />
                                        </div>
                                        <span className="text-xs font-bold text-gray-900">{item.label}</span>
                                        <span className="text-[10px] text-gray-500">{item.sub}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Sections */}
                            <div className="space-y-8">
                                {/* Description */}
                                <section>
                                    <h3 className="font-black text-gray-900 mb-3 text-lg flex items-center gap-2">
                                        Product Details
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                                        {product.description || "Experience premium quality with this meticulously crafted product. Designed for durability and style, it fits perfectly into your lifestyle. Whether for personal use or as a thoughtful gift, this item stands out with its superior finish and attention to detail."}
                                    </p>

                                    {/* Mock Highlights */}
                                    <ul className="mt-4 space-y-2">
                                        {[
                                            "Premium quality material for long-lasting usage",
                                            "Modern and aesthetic design",
                                            "Perfect for gifting on special occasions",
                                            "Value for money deal"
                                        ].map((pt, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0"></div>
                                                {pt}
                                            </li>
                                        ))}
                                    </ul>
                                </section>

                                {/* Gift Option */}
                                <section className="bg-purple-50 rounded-2xl p-5 border border-purple-100 flex items-start gap-4">
                                    <div className="bg-white p-3 rounded-full text-purple-600 shadow-sm">
                                        <Gift size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <h4 className="font-bold text-purple-900">Gifting this item?</h4>
                                            <div
                                                className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${isGift ? 'bg-purple-600' : 'bg-gray-300'}`}
                                                onClick={() => setIsGift(!isGift)}
                                            >
                                                <motion.div
                                                    className="w-5 h-5 bg-white rounded-full shadow-sm"
                                                    animate={{ x: isGift ? 20 : 0 }}
                                                />
                                            </div>
                                        </div>
                                        <p className="text-xs text-purple-700 leading-relaxed">
                                            Add gift wrap and a personalized message at checkout. We'll make sure it looks special!
                                        </p>
                                    </div>
                                </section>

                                {/* Reviews */}
                                <ReviewList reviewsCount={product.reviewsCount || 120} rating={product.rating || 4.5} />
                            </div>
                        </div>
                    </div>

                    <div className="mt-20">
                        <RecommendationRow source="product" currentProduct={product} />
                    </div>
                </main>
            </motion.div>

            {/* FIXED MOBILE FOOTER ACTIONS */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-3 pb-safe z-50 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
                <div className="flex gap-3 h-12">
                    {/* WhatsApp/Chat - Small */}
                    <button onClick={handleWhatsApp} className="w-12 h-full rounded-lg bg-green-50 text-green-600 border border-green-100 flex items-center justify-center active:scale-95 transition-transform shrink-0">
                        <MessageCircle size={24} />
                    </button>

                    {/* Add to Cart - Secondary */}
                    <button
                        onClick={() => addToCart({ ...product, isGift }, qty)}
                        className="flex-1 bg-white text-gray-900 border border-gray-300 rounded-lg font-bold text-sm active:scale-95 transition-transform flex items-center justify-center"
                    >
                        Add to Cart
                    </button>

                    {/* Buy Now - Primary & Prominent */}
                    <button
                        onClick={handleBuyNow}
                        className="flex-1 bg-orange-500 text-white rounded-lg font-bold text-sm active:scale-95 transition-transform shadow-lg shadow-orange-500/30 flex items-center justify-center gap-1"
                    >
                        <Zap size={16} fill="currentColor" /> Buy Now
                    </button>
                </div>
            </div>
        </>
    );
};

export default ProductDetails;
