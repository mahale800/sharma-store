import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { History, ArrowRight } from 'lucide-react';
import Card from './common/Card';

const RecentlyViewed = ({ currentProductId }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecent = async () => {
            const recentIds = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');

            // Filter out current product & limit to 4
            const targetIds = recentIds.filter(id => id !== currentProductId).slice(0, 4);

            if (targetIds.length === 0) {
                setLoading(false);
                return;
            }

            const productPromises = targetIds.map(id => getDoc(doc(db, "products", id)));

            try {
                const snapshots = await Promise.all(productPromises);
                const fetchedProducts = snapshots
                    .filter(snap => snap.exists())
                    .map(snap => ({ id: snap.id, ...snap.data() }));

                setProducts(fetchedProducts);
            } catch (error) {
                console.error("Error fetching recent products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecent();
    }, [currentProductId]);

    // Update LocalStorage when viewing a product
    useEffect(() => {
        if (!currentProductId) return;

        const recentIds = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        const newIds = [currentProductId, ...recentIds.filter(id => id !== currentProductId)].slice(0, 10); // Keep last 10

        localStorage.setItem('recentlyViewed', JSON.stringify(newIds));
    }, [currentProductId]);

    if (loading || products.length === 0) return null;

    return (
        <section className="mt-12 mb-8">
            <div className="flex items-center gap-2 mb-6">
                <History size={20} className="text-orange-500" />
                <h3 className="font-black text-gray-900 text-xl">Recently Viewed</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map(product => (
                    <Link key={product.id} to={`/product/${product.id}`} className="block h-full">
                        <Card className="h-full p-0 overflow-hidden hover:shadow-lg transition-all group border-gray-100">
                            <div className="aspect-square bg-gray-50 relative overflow-hidden">
                                <img
                                    src={product.image || product.imageUrl || 'https://placehold.co/300x300'}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-4">
                                <h4 className="font-bold text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-orange-600 transition-colors">
                                    {product.name}
                                </h4>
                                <p className="font-black text-gray-900">₹{product.price}</p>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default RecentlyViewed;
