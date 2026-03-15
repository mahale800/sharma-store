import { useState } from 'react';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export const useFeedback = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const submitFeedback = async (data) => {
        setLoading(true);
        try {
            await addDoc(collection(db, 'feedback'), {
                ...data,
                createdAt: serverTimestamp(),
                status: 'new' // new, reviewed, resolved
            });
            return true;
        } catch (err) {
            console.warn("Error submitting feedback:", err.message);
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateFeedbackSentiment = async (sentimentMap) => {
        try {
            // Firestore transactions or batched writes are best here
            // We'll iterate for simplicity as batch is limited to 500, which is fine for now
            const updatePromises = Object.keys(sentimentMap).map(id => {
                // We only update if the ID exists in the map
                const data = sentimentMap[id];
                const docRef = doc(db, 'feedback', id);
                return updateDoc(docRef, { ...data, analyzedAt: serverTimestamp() });
            });
            await Promise.all(updatePromises);
            return true;
        } catch (err) {
            console.error("Error updating sentiment:", err);
            return false;
        }
    };

    const getFeedback = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (err) {
            console.warn("Error fetching feedback:", err.message);
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    };

    return { submitFeedback, getFeedback, updateFeedbackSentiment, loading, error };
};
