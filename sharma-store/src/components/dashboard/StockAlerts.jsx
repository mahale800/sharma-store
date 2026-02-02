import React, { useEffect, useState } from 'react';
import { PackageX, AlertTriangle, ArrowRight, CheckCircle } from 'lucide-react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { Link } from 'react-router-dom';

const StockAlerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLowStock = async () => {
            try {
                // Fetch products with stock <= 10
                // Note: Firestore requires an index for this if mixed with other sorts, but simple filtering is fine.
                // We'll fetch all and filter client side if the dataset is small, or use a query.
                // Since this is a small store, we'll fetch all products and filter to find the critical ones.

                const productsRef = collection(db, "products");
                const snapshot = await getDocs(productsRef);
                const lowStockItems = [];

                snapshot.forEach(doc => {
                    const data = doc.data();
                    const stock = parseInt(data.stock || 0);
                    if (stock <= 10) {
                        lowStockItems.push({
                            id: doc.id,
                            name: data.name,
                            stock: stock,
                            image: data.image || data.imageUrl
                        });
                    }
                });

                // Sort by stock ascending (lowest first)
                lowStockItems.sort((a, b) => a.stock - b.stock);
                setAlerts(lowStockItems.slice(0, 5)); // Show top 5
            } catch (error) {
                console.error("Error fetching stock alerts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLowStock();
    }, []);

    if (loading) return <div className="h-64 bg-white rounded-2xl border border-gray-100 flex items-center justify-center animate-pulse"><div className="w-8 h-8 bg-gray-200 rounded-full"></div></div>;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <AlertTriangle size={20} className="text-red-500" />
                    <h3 className="text-lg font-bold text-gray-900">Stock Alerts</h3>
                </div>
                {alerts.length > 0 && (
                    <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded-md animate-pulse">
                        {alerts.length} CRITICAL
                    </span>
                )}
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
                {alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-center">
                        <CheckCircle size={32} className="mb-2 text-green-500 opacity-50" />
                        <p className="text-sm font-bold">All stock levels healthy.</p>
                    </div>
                ) : (
                    alerts.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {item.image ? (
                                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <PackageX size={18} className="text-gray-400" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-sm font-bold text-gray-900 truncate max-w-[120px]" title={item.name}>{item.name}</h4>
                                    <p className={`text-[10px] font-black uppercase ${item.stock === 0 ? 'text-red-600' : 'text-orange-500'}`}>
                                        {item.stock === 0 ? 'Out of Stock' : `${item.stock} Units Left`}
                                    </p>
                                </div>
                            </div>
                            <Link
                                to={`/admin/products/edit/${item.id}`}
                                className="px-3 py-1.5 text-xs font-bold bg-white border border-gray-200 rounded-lg hover:border-primary hover:text-primary transition-colors shadow-sm"
                            >
                                Restock
                            </Link>
                        </div>
                    ))
                )}
            </div>

            <Link to="/admin/products" className="w-full mt-6 py-3 flex items-center justify-center gap-2 text-sm font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors group">
                View Full Inventory <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
    );
};

export default StockAlerts;
