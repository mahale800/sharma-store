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
            setAllProducts(data);
            setLoading(false);
            console.log("INITIAL FETCH: Loaded", data.length, "products");
        }, (error) => {
            console.error("Error fetching products:", error);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // 5. Derived Filter Logic (Effect-based)
    useEffect(() => {
        console.log("--- FILTERING START ---");
        console.log("Source Count:", allProducts.length);
        console.log("Selected Category:", selectedCategory);

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
        if (selectedCategory && selectedCategory.trim().toLowerCase() !== "all") {
            const cat = selectedCategory.trim().toLowerCase();
            result = result.filter(item =>
                item.category?.trim().toLowerCase() === cat
            );
        }

        // Sort
        if (sortBy === "price-low") {
            result.sort((a, b) => Number(a.price) - Number(b.price));
        } else if (sortBy === "price-high") {
            result.sort((a, b) => Number(b.price) - Number(a.price));
        }

        console.log("Filtered Count:", result.length);
        console.log("--- FILTERING END ---");

        setFilteredProducts(result);
    }, [allProducts, selectedCategory, searchQuery, sortBy]);

    // 6. Derived Categories List
    const categories = useMemo(() => {
        const uniqueCats = Array.from(new Set(allProducts.map(p => p.category?.trim()).filter(Boolean)));
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
