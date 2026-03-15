import React from 'react';
import { useShop } from '../../context/ShopContext';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Package } from 'lucide-react';
import Card from '../common/Card';

const LowStockAlerts = () => {
    const { products } = useShop();

    // Filter products with low stock (e.g., < 10)
    const lowStockProducts = (products || [])
        .filter(p => p.stock !== undefined && p.stock < 10)
        .sort((a, b) => a.stock - b.stock) // Lowest stock first
        .slice(0, 5); // Show top 5

    if (lowStockProducts.length === 0) return null;

    return (
        <Card className="h-full border-red-100 bg-red-50/30">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="bg-red-100 p-2 rounded-lg text-red-600">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <h3 className="font-black text-gray-900">Low Stock Alerts</h3>
                        <p className="text-xs font-bold text-red-500 uppercase tracking-wide">Action Required</p>
                    </div>
                </div>
                <Link to="/admin/products" className="p-2 hover:bg-white rounded-lg transition-colors text-gray-400 hover:text-gray-900">
                    <ArrowRight size={18} />
                </Link>
            </div>

            <div className="space-y-3">
                {lowStockProducts.map(product => (
                    <div key={product.id} className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-red-100/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex-shrink-0 overflow-hidden">
                                <img
                                    src={product.image || product.imageUrl || 'https://placehold.co/100'}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{product.name}</h4>
                                <p className="text-xs text-gray-500">{product.category}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className={`text-sm font-black ${product.stock === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                                {product.stock} left
                            </span>
                            {product.stock === 0 && <span className="text-[10px] uppercase font-bold text-red-500">Out of Stock</span>}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default LowStockAlerts;
