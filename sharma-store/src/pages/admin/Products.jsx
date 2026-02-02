import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Pencil, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
            setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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

    const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Products</h1>
                    <p className="text-sm font-medium text-gray-500">Manage inventory & stock.</p>
                </div>
                <Link to="/admin/products/add" className="hidden md:flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-95">
                    <Plus size={20} /> Add Product
                </Link>
            </div>

            {/* Mobile Add Button */}
            <Link to="/admin/products/add" className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-2xl z-40">
                <Plus size={24} />
            </Link>

            {/* Search */}
            <div className="frosted-paper p-2 rounded-2xl border border-white/60 shadow-sm">
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
            </div>

            {/* Product List */}
            <div className="space-y-4">
                {loading ? <div className="text-center py-10 font-bold text-gray-400">Loading Inventory...</div> :
                    filtered.length === 0 ? <div className="text-center py-10 font-bold text-gray-400">No products found.</div> :
                        filtered.map(product => {
                            const isLowStock = product.stock < 10;
                            const isOut = product.stock == 0;

                            return (
                                <div key={product.id} className="frosted-paper p-4 rounded-3xl border border-white/60 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
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
                                            <Link to={`/admin/products/edit/${product.id}`} className="p-3 bg-white hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-xl transition-colors shadow-sm">
                                                <Pencil size={18} />
                                            </Link>
                                            <button onClick={(e) => handleDelete(e, product.id)} className="p-3 bg-white hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-xl transition-colors shadow-sm">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
            </div>
        </div>
    );
};

export default Products;
