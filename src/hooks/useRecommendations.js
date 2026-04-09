import { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { getRecommendations } from '../services/aiService';

export const useRecommendations = (source, currentProduct) => {
    const { allProducts: products } = useShop();
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!products.length) {
            setRecommendations([]);
            setLoading(false);
            return;
        }

        const fetchRecs = async () => {
            setLoading(true);
            let initialRecs = [];

            // 1. Rule-Based Fallback (Fast)
            if (source === 'product' && currentProduct) {
                // Same category, excluding current
                initialRecs = products
                    .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
                    .slice(0, 5);
            } else if (source === 'trending') {
                // Sort by trending metrics (orders, views, ratings)
                initialRecs = [...products]
                    .sort((a, b) => (b.unitsSold || b.rating || 0) - (a.unitsSold || a.rating || 0))
                    .slice(0, 5);
            } else if (source === 'cart' || source === 'home') {
                // Random trending/featured
                initialRecs = products.filter(p => p.isFeatured).slice(0, 5);
                if (initialRecs.length === 0) initialRecs = products.slice(0, 5);
            }

            setRecommendations(initialRecs);

            try {
                // 2. AI Refinement (Async)
                /* 
                   In a real app, we'd pass user history or cart items as context.
                   For now, we simulate context based on the source.
                */
                let context = "";
                if (source === 'product' && currentProduct) {
                    context = `User is looking at "${currentProduct.name}". Suggest complementary items.`;
                } else if (source === 'cart') {
                    context = "User is about to checkout. Suggest impulse buy items under ₹200.";
                } else if (source === 'trending') {
                    context = "Suggest products that are currently trending, popular, or highly rated.";
                } else {
                    context = "User is on the home page. Suggest popular bestsellers for personalized recommendations.";
                }

                const aiIds = await getRecommendations(context, products.map(p => ({
                    id: p.id,
                    name: p.name,
                    category: p.category
                })));

                if (aiIds.length > 0) {
                    const aiRecs = products.filter(p => aiIds.includes(p.id));
                    if (aiRecs.length > 0) {
                        setRecommendations(aiRecs);
                    }
                }
            } catch (err) {
                console.warn("AI Recs failed, keeping rule-based fallback.", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecs();
    }, [source, currentProduct, products]);

    return { recommendations, loading };
};
