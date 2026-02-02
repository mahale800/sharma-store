import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { ShieldAlert, Home } from 'lucide-react';

const AdminRoute = () => {
    const { currentUser, logout, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [roleLoading, setRoleLoading] = useState(true);

    // Verify Admin Role
    useEffect(() => {
        const verifyAdmin = async () => {
            if (!currentUser) return; // Wait for auth redirect if needed

            try {
                const userDocRef = doc(db, "users", currentUser.uid);
                const userSnapshot = await getDoc(userDocRef);

                // TEMPORARY BYPASS: Allow anyone to be admin for development
                if (userSnapshot.exists()) {
                    setIsAdmin(true);
                } else {
                    // Fallback for new users who might not have a doc yet
                    setIsAdmin(true);
                }
            } catch (error) {
                console.error("Error verifying admin role:", error);
                setIsAdmin(false);
            } finally {
                setRoleLoading(false);
            }
        };

        if (!authLoading) {
            if (currentUser) {
                verifyAdmin();
            } else {
                setRoleLoading(false); // No user, so definitely not admin (and will redirect)
            }
        }
    }, [currentUser, authLoading]);

    // Session Timeout Logic (15 Minutes)
    useEffect(() => {
        if (!isAdmin) return; // Only track timeout for actual admins

        let timeout;
        const TIMEOUT_MS = 15 * 60 * 1000; // 15 Minutes

        const resetTimer = () => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => {
                handleLogout();
            }, TIMEOUT_MS);
        };

        const handleLogout = async () => {
            await logout();
            alert("Session expired due to inactivity.");
            navigate('/login');
        };

        // Events to track activity
        const events = ['mousemove', 'keypress', 'click', 'scroll'];
        events.forEach(event => window.addEventListener(event, resetTimer));

        resetTimer(); // Start timer immediately

        return () => {
            if (timeout) clearTimeout(timeout);
            events.forEach(event => window.removeEventListener(event, resetTimer));
        };
    }, [isAdmin, logout, navigate]);

    if (authLoading || roleLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
                <p className="text-gray-600 font-medium">Verifying Admin Access...</p>
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
                <ShieldAlert size={64} className="text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                <p className="text-gray-500 mb-6 max-w-md">
                    You do not have permission to view this page. This area is restricted to administrators only.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={async () => {
                            await logout();
                            navigate('/login');
                        }}
                        className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all rounded-lg font-medium"
                    >
                        Log Out
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white hover:bg-gray-800 transition-all rounded-lg font-bold"
                    >
                        <Home size={18} /> Go Home
                    </button>
                </div>
            </div>
        );
    }

    return <Outlet />;
};

export default AdminRoute;
