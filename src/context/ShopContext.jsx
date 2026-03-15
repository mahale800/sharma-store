import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
    // 1. Source Data (Immutable) - "allProducts" as requested
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // 2. Filter State - "selectedCategory" as requested
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState("featured");

    // 3. Output State
    const [filteredProducts, setFilteredProducts] = useState([]);

    // 4. Fetch Data (Once per app load)
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
            const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            // Set SOURCE of truth
            console.log("Fetched Products:", data);
            setAllProducts(data);
            setLoading(false);
        }, (error) => {
            if (error.code === 'permission-denied') {
                console.warn("Product access denied. Rules likely not deployed. Using empty list.");
                setAllProducts([]); // Handle gracefully
            } else {
                console.error("Error fetching products:", error);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // 5. Derived Filter Logic (Effect-based)
    useEffect(() => {

        let result = [...allProducts];

        // Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(item =>
                item.name?.toLowerCase().includes(q) ||
                item.category?.toLowerCase().includes(q)
            );
        }

        // Category Filter (Case-Insensitive "all" check)
        // Treat "all", "All", "ALL" as the reset key
        if (selectedCategory && selectedCategory.toLowerCase() !== "all") {
            result = result.filter(p =>
                p.category?.toLowerCase() === selectedCategory.toLowerCase()
            );
        }

        // Sort
        if (sortBy === "price-low") {
            result.sort((a, b) => Number(a.price) - Number(b.price));
        } else if (sortBy === "price-high") {
            result.sort((a, b) => Number(b.price) - Number(a.price));
        }



        setFilteredProducts(result);
    }, [allProducts, selectedCategory, searchQuery, sortBy]);

    // 6. Derived Categories List
    const categories = useMemo(() => {
        const uniqueCats = Array.from(new Set(allProducts.map(p => p.category).filter(Boolean)));
        // Return "All" as layout friendly name, but logic handles it
        return ["All", ...uniqueCats.sort()];
    }, [allProducts]);

    // 7. Reset
    const resetFilters = () => {
        setSearchQuery("");
        setSelectedCategory("All");
        setSortBy("featured");
    };

    const value = {
        allProducts,
        filteredProducts,
        loading,
        searchQuery, setSearchQuery,
        selectedCategory, setSelectedCategory,
        sortBy, setSortBy,
        categories,
        resetFilters
    };

    return (
        <ShopContext.Provider value={value}>
            {children}
        </ShopContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useShop = () => useContext(ShopContext);
