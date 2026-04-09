import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { buildStoreProfile, SHOP_PROFILE } from '../data/shopProfile';

const StoreSettingsContext = createContext({
    storeProfile: SHOP_PROFILE,
    loading: true,
    acceptingOrders: true,
    enableNotifications: true
});

export const useStoreSettings = () => useContext(StoreSettingsContext);

export const StoreSettingsProvider = ({ children }) => {
    const [settingsDoc, setSettingsDoc] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onSnapshot(
            doc(db, 'settings', 'store_config'),
            (snapshot) => {
                setSettingsDoc(snapshot.exists() ? snapshot.data() : null);
                setLoading(false);
            },
            (error) => {
                console.warn('Falling back to default store settings:', error?.message || error);
                setSettingsDoc(null);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    const value = useMemo(() => {
        const storeProfile = buildStoreProfile({
            name: settingsDoc?.storeName || SHOP_PROFILE.name,
            shortName: settingsDoc?.storeName || SHOP_PROFILE.shortName,
            email: settingsDoc?.contactEmail || SHOP_PROFILE.email,
            whatsappNumber: settingsDoc?.whatsappNumber || SHOP_PROFILE.whatsappNumber,
            primaryPhone: settingsDoc?.whatsappNumber || SHOP_PROFILE.primaryPhone,
            secondaryPhone: settingsDoc?.secondaryPhone || SHOP_PROFILE.secondaryPhone,
            storeAddress: settingsDoc?.storeAddress || SHOP_PROFILE.fullAddress,
            fullAddress: settingsDoc?.storeAddress || SHOP_PROFILE.fullAddress,
            categories: settingsDoc?.categories || SHOP_PROFILE.categories
        });

        return {
            storeProfile,
            loading,
            acceptingOrders: settingsDoc?.acceptingOrders ?? true,
            enableNotifications: settingsDoc?.enableNotifications ?? true
        };
    }, [loading, settingsDoc]);

    return (
        <StoreSettingsContext.Provider value={value}>
            {children}
        </StoreSettingsContext.Provider>
    );
};
