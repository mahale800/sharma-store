import { messaging, db } from "./firebase";
import { getToken } from "firebase/messaging";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || import.meta.env.VITE_FIREBASE_KEY_PAIR_ID;

export const requestFcmToken = async (userId) => {
    try {
        if (!messaging) {
            return null;
        }

        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            console.warn("Notification permission denied");
            return null;
        }

        if (!VAPID_KEY) {
            console.warn("Firebase VAPID key missing. Push token cannot be created.");
            return null;
        }

        const token = await getToken(messaging, {
            vapidKey: VAPID_KEY,
        });

        if (token && userId) {
            // Save to 'userTokens' collection as requested
            // We use userId as doc ID to keep 1 token per user for simplicity in this demo,
            // OR use token as ID if multiple devices per user are needed.
            // The prompt asked for: collection: userTokens, fields: userId, token, deviceType, timestamp.
            // If we want multiple devices, we should probably use a composite ID or subcollection.
            // Strict requirement: "collection: userTokens".
            // Let's use `userTokens/${userId}_${shortToken}` to allow multiple devices, or just userId if 1:1.
            // For now, let's assume 1:1 or overwrite to keep it simple and match the "userId" doc structure often used, 
            // BUT for multi-device support, `userTokens/{token}` is better.
            // Let's use the token itself as the document ID to strictly avoid duplicates.

            await setDoc(doc(db, "userTokens", token), {
                userId: userId,
                token: token,
                deviceType: "web",
                createdAt: serverTimestamp(),
            });
        }

        return token;
    } catch (error) {
        console.error("An error occurred while retrieving token. ", error);
        return null;
    }
};
