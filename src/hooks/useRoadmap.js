import { useState, useCallback } from 'react';
import { collection, getDocs, query, orderBy, serverTimestamp, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export const useRoadmap = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchRoadmap = useCallback(async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'roadmap'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (err) {
            console.error("Error fetching roadmap:", err);
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const saveRoadmapItems = useCallback(async (items) => {
        setLoading(true);
        try {
            const batch = writeBatch(db);
            items.forEach(item => {
                const docRef = doc(collection(db, 'roadmap'));
                batch.set(docRef, {
                    ...item,
                    createdAt: serverTimestamp(),
                    status: item.status || 'Planned'
                });
            });
            await batch.commit();
            return true;
        } catch (err) {
            console.error("Error saving roadmap:", err);
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateItemStatus = useCallback(async (id, newStatus) => {
        try {
            await updateDoc(doc(db, 'roadmap', id), { status: newStatus });
            return true;
        } catch (err) {
            console.error("Error updating status:", err);
            return false;
        }
    }, []);

    return { fetchRoadmap, saveRoadmapItems, updateItemStatus, loading, error };
};
