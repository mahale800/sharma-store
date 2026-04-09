import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Pencil, Package, Layers3, AlertTriangle, Boxes } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import Button from '../../components/Button';
import Card from '../../components/common/Card';
import { FALLBACK_PRODUCTS } from '../../data/fallbackProducts';
import { SHOP_CATEGORIES } from '../../data/shopProfile';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [usingFallbackProducts, setUsingFallbackProducts] = useState(false);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
            const liveProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (liveProducts.length > 0) {
                setProducts(liveProducts);
                setUsingFallbackProducts(false);
            } else {
                setProducts(FALLBACK_PRODUCTS);
                setUsingFallbackProducts(true);
            }
            setLoading(false);
        }, () => {
            setProducts(FALLBACK_PRODUCTS);
            setUsingFallbackProducts(true);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleDelete = async (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm("Delete this product?")) {
            await deleteDoc(doc(db, "products", id));
        }
    };

    const filtered = products.filter((product) => {
        const matchesSearch = `${product.name} ${product.category}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const lowStockCount = products.filter(product => Number(product.stock) > 0 && Number(product.stock) < 10).length;
    const outOfStockCount = products.filter(product => Number(product.stock) === 0).length;
    const categoryCount = new Set(products.map(product => product.category).filter(Boolean)).size;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Products</h1>
                    <p className="text-sm font-medium text-gray-500">Manage inventory & stock.</p>
                </div>
                <Link to="/admin/products/add" className="hidden md:block">
                    <Button variant="primary" className="gap-2 shadow-xl shadow-orange-500/20">
                        <Plus size={20} /> Add Product
                    </Button>
                </Link>
            </div>

            {/* Mobile Add Button */}
            {/* Mobile Add Button */}
            <Link to="/admin/products/add" className="md:hidden fixed bottom-24 right-6 z-40">
                <Button variant="primary" size="icon-lg" className="rounded-full shadow-2xl shadow-orange-500/30">
                    <Plus size={24} />
                </Button>
            </Link>

            {/* Search */}
            <Card className="p-2 border border-white/60 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/50 rounded-xl font-bold text-gray-900 outline-none focus:bg-white transition-colors"
                    />
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                            <Boxes size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Inventory</p>
                            <p className="text-2xl font-black text-gray-900">{products.length}</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Products currently visible in the catalog.</p>
                </Card>

                <Card className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-11 h-11 rounded-2xl bg-orange-500 text-white flex items-center justify-center">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Low Stock</p>
                            <p className="text-2xl font-black text-gray-900">{lowStockCount + outOfStockCount}</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">{outOfStockCount} out of stock, {lowStockCount} running low.</p>
                </Card>

                <Card className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-11 h-11 rounded-2xl bg-blue-500 text-white flex items-center justify-center">
                            <Layers3 size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Categories</p>
                            <p className="text-2xl font-black text-gray-900">{categoryCount}</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Aligned with your real in-store sections.</p>
                </Card>
            </div>

            {usingFallbackProducts && (
                <Card className="p-4 border border-amber-200 bg-amber-50 text-amber-900">
                    <p className="text-sm font-bold">Live inventory is unavailable, so admin is showing the preview product catalog right now.</p>
                </Card>
            )}

            <div className="flex flex-wrap gap-2">
                {['All', ...SHOP_CATEGORIES].map((category) => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${selectedCategory === category ? 'bg-slate-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'}`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Product List */}
            <div className="space-y-4">
                {loading ? <div className="text-center py-10 font-bold text-gray-400">Loading Inventory...</div> :
                    filtered.length === 0 ? <div className="text-center py-10 font-bold text-gray-400">No products found.</div> :
                        filtered.map(product => {
                            const isLowStock = product.stock < 10;
                            const isOut = product.stock == 0;

                            return (
                                <Card key={product.id} className="p-4 rounded-3xl border border-white/60 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                                    {/* Stock Indicator Stripe */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-2 ${isOut ? 'bg-red-500' : isLowStock ? 'bg-orange-500' : 'bg-green-500'}`}></div>

                                    <div className="flex items-center gap-4 pl-4">
                                        {/* Image */}
                                        <div className="w-20 h-20 bg-white rounded-2xl p-2 shadow-sm border border-gray-100 flex-shrink-0">
                                            <img src={product.image || product.imageUrl || 'https://placehold.co/100'} alt={product.name} className="w-full h-full object-contain rounded-xl" />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{product.category}</p>
                                                    <h3 className="font-black text-gray-900 text-lg truncate pr-4">{product.name}</h3>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 mt-2">
                                                <span className="font-black text-xl text-primary">₹{product.price}</span>
                                                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${isOut ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                                    {isOut ? 'Out of Stock' : `${product.stock} in stock`}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <Link to={`/admin/products/edit/${product.id}`}>
                                                <Button variant="ghost" size="icon" className="bg-white hover:bg-blue-50 text-gray-400 hover:text-blue-600 shadow-sm">
                                                    <Pencil size={18} />
                                                </Button>
                                            </Link>
                                            <Button variant="ghost" size="icon" onClick={(e) => handleDelete(e, product.id)} className="bg-white hover:bg-red-50 text-gray-400 hover:text-red-600 shadow-sm">
                                                <Trash2 size={18} />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
            </div>
        </div>
    );
};

export default Products;
