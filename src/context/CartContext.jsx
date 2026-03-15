import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext'; // Import useAuth
import { db } from '../firebase/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

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

        // Sync to Firestore if Logged In
        if (currentUser && cartItems.length > 0) {
            const cartRef = doc(db, 'userCarts', currentUser.uid);
            setDoc(cartRef, {
                userId: currentUser.uid,
                items: cartItems,
                lastUpdated: serverTimestamp(),
                reminded: false
            }, { merge: true }).catch(err => console.error("Failed to sync cart", err));
        }
    }, [cartItems, currentUser]);

    // Clear cart on logout
    const previousUser = React.useRef(currentUser);
    useEffect(() => {
        if (previousUser.current && !currentUser) {
            setCartItems([]); // Only clear if transitioning from User to Null (logout)
        }
        previousUser.current = currentUser;
    }, [currentUser]);


    const addToCart = (product, quantity = 1) => {
        if (!currentUser) {
            // console.warn("Blocked guest add-to-cart attempt.");
            // alert("Please log in to add items to your cart.");
            // since we are not in a component, we can't easily navigate without a hook if outside provider context, 
            // BUT CartProvider is inside BrowserRouter in App.jsx.
            // However, useCart is a hook. The Provider is a component.
            // We can use the window.location or just fail silently if the UI handles it.
            // The ProductCard ALREADY handles the check and redirect. 
            // Here we just want to be SURE.
            // Throwing an error or returning early is safe.
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

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        getCartTotal: () => cartTotal
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
