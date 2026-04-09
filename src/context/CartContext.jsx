import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase/firebase';
import { doc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

export const CartContext = createContext();

 
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize cart from localStorage
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem('sharma-cart');
            if (savedCart) {
                const parsed = JSON.parse(savedCart);
                if (Array.isArray(parsed)) {
                    setCartItems(parsed);
                }
            }
        } catch (error) {
            console.error("Failed to parse cart from local storage:", error);
        }
        setIsInitialized(true);
    }, []);

    const clampQuantity = useCallback((product, quantity) => {
        const nextQuantity = Math.max(1, Number(quantity) || 1);
        const stockLimit = Number(product?.stock);

        if (Number.isFinite(stockLimit) && stockLimit > 0) {
            return Math.min(nextQuantity, stockLimit);
        }

        return nextQuantity;
    }, []);

    // Persist to localStorage and sync to Firestore
    useEffect(() => {
        if (!isInitialized) return;
        
        localStorage.setItem('sharma-cart', JSON.stringify(cartItems));

        if (currentUser) {
            const cartRef = doc(db, 'userCarts', currentUser.uid);
            setDoc(cartRef, {
                userId: currentUser.uid,
                items: cartItems,
                lastUpdated: serverTimestamp(),
                reminded: cartItems.length === 0
            }, { merge: true }).catch(err => {
                console.error("Failed to sync cart", err);
            });
        }
    }, [cartItems, currentUser, isInitialized]);

    // Firestore real-time sync for logged-in users
    useEffect(() => {
        if (!currentUser) return;

        const cartRef = doc(db, 'userCarts', currentUser.uid);
        const unsubscribe = onSnapshot(cartRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data().items) {
                // Only sync if localStorage is empty (fresh login)
                const localCart = localStorage.getItem('sharma-cart');
                if (!localCart || localCart === '[]') {
                    setCartItems(docSnap.data().items);
                }
            }
        }, (error) => {
            console.error("Cart sync error:", error);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const addToCart = useCallback((product, quantity = 1) => {
        if (!product?.id) {
            console.error("Invalid product added to cart");
            return;
        }

        if (Number(product.stock) === 0) {
            return;
        }

        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id);
            if (existingItem) {
                return prevItems.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: clampQuantity(item, item.quantity + quantity) }
                        : item
                );
            }
            return [...prevItems, { ...product, quantity: clampQuantity(product, quantity) }];
        });
    }, [clampQuantity]);

    const removeFromCart = useCallback((productId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    }, []);

    const updateQuantity = useCallback((productId, amount) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === productId
                    ? { ...item, quantity: clampQuantity(item, item.quantity + amount) }
                    : item
            ).filter(item => item.quantity > 0)
        );
    }, [clampQuantity]);

    const setItemQuantity = useCallback((productId, quantity) => {
        if (quantity < 1) {
            setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
        } else {
            setCartItems(prevItems =>
                prevItems.map(item =>
                    item.id === productId ? { ...item, quantity: clampQuantity(item, quantity) } : item
                )
            );
        }
    }, [clampQuantity]);

    const clearCart = useCallback(() => {
        setCartItems([]);
        localStorage.removeItem('sharma-cart');
    }, []);

    // Memoized calculations
    const cartCount = useCallback(() => {
        return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
    }, [cartItems]);

    const cartTotal = useCallback(() => {
        return cartItems.reduce((total, item) => {
            const price = parseFloat(item.price) || 0;
            const qty = item.quantity || 0;
            return total + (price * qty);
        }, 0);
    }, [cartItems]);

    const isCartEmpty = cartItems.length === 0;

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        setItemQuantity,
        clearCart,
        cartCount: cartCount(),
        cartTotal: cartTotal(),
        getCartTotal: cartTotal,
        isCartEmpty
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
