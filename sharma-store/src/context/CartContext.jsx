import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext'; // Import useAuth

export const CartContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const { currentUser } = useAuth(); // Get Auth State
    const [cartItems, setCartItems] = useState(() => {
        try {
            const savedCart = localStorage.getItem('sharma-cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error("Failed to parse cart from local storage:", error);
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('sharma-cart', JSON.stringify(cartItems));
    }, [cartItems]);

    // Clear cart on logout
    useEffect(() => {
        if (!currentUser) {
            setCartItems([]);
        }
    }, [currentUser]);


    const addToCart = (product, quantity = 1) => {
        if (!currentUser) {
            console.warn("Blocked guest add-to-cart attempt.");
            return;
        }
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id);
            if (existingItem) {
                return prevItems.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prevItems, { ...product, quantity }];
        });
    };

    const removeFromCart = (productId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, amount) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === productId
                    ? { ...item, quantity: Math.max(1, item.quantity + amount) }
                    : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    const value = React.useMemo(() => ({
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal
    }), [cartItems, cartCount, cartTotal]);

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
