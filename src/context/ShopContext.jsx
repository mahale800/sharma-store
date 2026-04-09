import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { FALLBACK_PRODUCTS } from '../data/fallbackProducts';
import { SHOP_CATEGORIES } from '../data/shopProfile';

const ShopContext = createContext();

const normalizeProduct = (product, id = product.id) => ({
    name: product.name || 'Unnamed Product',
    price: Number(product.price) || 0,
    originalPrice: Number(product.originalPrice || product.mrp || product.price) || 0,
    mrp: Number(product.mrp || product.originalPrice || product.price) || 0,
    category: product.category || 'Uncategorized',
    description: product.description || 'No description available.',
    stock: Number(product.stock) || 0,
    image: product.image || product.imageUrl || product.img || 'https://placehold.co/400x400?text=No+Image',
    rating: Number(product.rating) || 0,
    reviewsCount: Number(product.reviewsCount) || 0,
    discountPercent: Number(product.discountPercent || product.discount) || 0,
    isFeatured: Boolean(product.isFeatured),
    unitsSold: Number(product.unitsSold) || 0,
    ...product,
    id
});

export const ShopProvider = ({ children }) => {
    // 1. Source Data (Immutable) - "allProducts" as requested
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // 2. Filter State - "selectedCategory" as requested
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState("featured");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // 3. Output State
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [usingFallbackProducts, setUsingFallbackProducts] = useState(false);

    const fallbackProducts = useMemo(
        () => FALLBACK_PRODUCTS.map(product => normalizeProduct(product)),
        []
    );

    // 4. Fetch Data (Once per app load)
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
            const data = snapshot.docs.map(doc => normalizeProduct(doc.data(), doc.id));

            if (data.length > 0) {
                setAllProducts(data);
                setUsingFallbackProducts(false);
            } else {
                setAllProducts(fallbackProducts);
                setUsingFallbackProducts(true);
            }
            setLoading(false);
        }, (error) => {
            if (error.code === 'permission-denied') {
                console.warn("Product access denied. Falling back to preview catalog.");
            } else {
                console.error("Error fetching products, using preview catalog:", error);
            }
            setAllProducts(fallbackProducts);
            setUsingFallbackProducts(true);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [fallbackProducts]);

    // 5. Derived Filter Logic (Effect-based)
    useEffect(() => {

        let result = [...allProducts];

        // Search
        if (debouncedSearchQuery) {
            const q = debouncedSearchQuery.toLowerCase();
            result = result.filter(item =>
                item.name?.toLowerCase().includes(q) ||
                item.category?.toLowerCase().includes(q) ||
                item.description?.toLowerCase().includes(q)
            );
        }

        // Category Filter (Case-Insensitive "all" check)
        // Treat "all", "All", "ALL" as the reset key
        if (selectedCategory && selectedCategory.toLowerCase() !== "all") {
            result = result.filter(p =>
                p.category?.toLowerCase() === selectedCategory.toLowerCase()
            );
        }

        // Price Filter
        if (minPrice !== "" && !isNaN(minPrice)) {
            result = result.filter(p => Number(p.price) >= Number(minPrice));
        }
        if (maxPrice !== "" && !isNaN(maxPrice)) {
            result = result.filter(p => Number(p.price) <= Number(maxPrice));
        }

        // Sort
        if (sortBy === "price-low") {
            result.sort((a, b) => Number(a.price) - Number(b.price));
        } else if (sortBy === "price-high") {
            result.sort((a, b) => Number(b.price) - Number(a.price));
        }



        setFilteredProducts(result);
    }, [allProducts, selectedCategory, debouncedSearchQuery, sortBy, minPrice, maxPrice]);

    // 6. Derived Categories List
    const categories = useMemo(() => {
        const available = new Set(allProducts.map(p => p.category).filter(Boolean));
        const ordered = SHOP_CATEGORIES.filter(category => available.has(category));
        const extras = Array.from(available).filter(category => !SHOP_CATEGORIES.includes(category)).sort();
        return ["All", ...ordered, ...extras];
    }, [allProducts]);

    // 7. Reset
    const resetFilters = () => {
        setSearchQuery("");
        setSelectedCategory("All");
        setSortBy("featured");
        setMinPrice("");
        setMaxPrice("");
    };

    const value = {
        allProducts,
        filteredProducts,
        loading,
        usingFallbackProducts,
        searchQuery, setSearchQuery,
        selectedCategory, setSelectedCategory,
        sortBy, setSortBy,
        minPrice, setMinPrice,
        maxPrice, setMaxPrice,
        categories,
        resetFilters,
        getProductById: (productId) => allProducts.find(product => product.id === productId) || null
    };

    return (
        <ShopContext.Provider value={value}>
            {children}
        </ShopContext.Provider>
    );
};

 
export const useShop = () => useContext(ShopContext);
