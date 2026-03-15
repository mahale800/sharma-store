import React from 'react';
import { useRecommendations } from '../hooks/useRecommendations';
import { useCart } from '../context/CartContext';
import { Sparkles, ShoppingCart, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const RecommendationRow = ({ source, currentProduct }) => {
    const { recommendations, loading } = useRecommendations(source, currentProduct);
    const { addToCart } = useCart();

    if (loading) return (
        <div className="py-8 flex justify-center">
            <Loader2 className="animate-spin text-orange-500" />
        </div>
    );

    if (recommendations.length === 0) return null;

    return (
        <div className="py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-2 mb-4 px-4">
                <Sparkles className="text-orange-500" size={20} />
                <h3 className="text-xl font-bold text-gray-800">
                    {source === 'cart' ? 'You May Also Like' :
                        source === 'product' ? 'Customers Also Bought' :
                            'Recommended for You'}
                </h3>
            </div>

            <div className="flex overflow-x-auto gap-4 px-4 pb-4 scrollbar-hide snap-x">
                {recommendations.map((product) => (
                    <div key={product.id} className="min-w-[200px] md:min-w-[220px] bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all snap-start group flex flex-col">

                        {/* Image */}
                        <div className="relative h-[160px] rounded-xl overflow-hidden mb-3 bg-white">
                            <img
                                src={product.image || product.imageUrl || 'https://placehold.co/200'}
                                alt={product.name}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {product.discount > 0 && (
                                <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                    -{product.discount}%
                                </span>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 flex flex-col">
                            <Link to={`/product/${product.id}`} className="font-bold text-gray-800 line-clamp-1 hover:text-orange-600 transition-colors">
                                {product.name}
                            </Link>
                            <p className="text-xs text-gray-500 mb-2">{product.category}</p>

                            <div className="mt-auto flex items-center justify-between">
                                <span className="font-black text-gray-900">₹{product.price}</span>
                                <button
                                    onClick={() => addToCart(product)}
                                    className="p-2 bg-gray-900 text-white rounded-lg hover:bg-orange-600 active:scale-95 transition-all shadow-lg shadow-gray-200"
                                >
                                    <ShoppingCart size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecommendationRow;
