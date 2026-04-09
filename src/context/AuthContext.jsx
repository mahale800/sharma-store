import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, db } from '../firebase/firebase';
import { signInWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged, createUserWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

 
export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true); // Only for initial auth check

    // Signup with Email
    const signupWithEmail = async (email, password, fullName) => {
        // Do NOT set global loading here, it unmounts the app
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 1. Update Auth Profile
            await updateProfile(user, {
                displayName: fullName
            });

            // 2. Create User Document in Firestore with Full Schema
            const defaultUserSchema = {
                uid: user.uid,
                email: email,
                fullName: fullName,
                role: 'customer',
                createdAt: new Date().toISOString(),
                // Rewards & Gamification
                rewards: {
                    coins: 0,
                    currentStreak: 0,
                    highestStreak: 0,
                    lastClaimDate: null,
                    tiersUnlocked: ['Silver'],
                    totalRewardsClaimed: 0
                },
                // User Preferences
                preferences: {
                    notificationTone: 'Professional',
                    notificationsEnabled: true,
                    theme: 'light',
                    language: 'en'
                },
                // Engagement
                engagement: {
                    aiInteractions: 0,
                    feedbackCount: 0,
                    lastActive: new Date().toISOString()
                }
            };

            await setDoc(doc(db, "users", user.uid), defaultUserSchema);

            return { success: true };
        } catch (error) {
            console.error("Signup failed", error);
            return { success: false, error };
        }
    };

    // Login with Email
    const loginWithEmail = async (email, password) => {
        // Do NOT set global loading here
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true };
        } catch (error) {
            console.error("Login failed", error);
            return { success: false, error };
        }
    };

    // Google Sign In
    const loginWithGoogle = async () => {
        // Do NOT set global loading here
        try {
            await signInWithPopup(auth, googleProvider);
            return { success: true };
        } catch (error) {
            console.error("Google login failed", error);
            return { success: false, error };
        }
    };

    // Logout
    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    // Password Reset
    const resetPassword = async (email) => {
        // Do NOT set global loading here
        try {
            await sendPasswordResetEmail(auth, email);
            return { success: true };
        } catch (error) {
            console.error("Reset password failed", error);
            return { success: false, error };
        }
    };

    // Observe Auth State (This manages the initial loading)
    // Observe Auth State (This manages the initial loading)
    useEffect(() => {
        let mounted = true;

        // Safety fallback: If Firebase takes too long (>3s), assume offline/loaded
        const safetyTimer = setTimeout(() => {
            if (mounted && loading) {
                console.warn("Auth check timed out, forcing app load.");
                setLoading(false);
            }
        }, 3000);

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (mounted) {
                setCurrentUser(user);
                setLoading(false);
                clearTimeout(safetyTimer);
            }
        }, (error) => {
            console.error("Auth state change error:", error);
            if (mounted) setLoading(false); // Force load on error
        });

        return () => {
            mounted = false;
            clearTimeout(safetyTimer);
            unsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const value = {
        currentUser,
        signupWithEmail,
        loginWithEmail,
        loginWithGoogle,
        logout,
        resetPassword,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
