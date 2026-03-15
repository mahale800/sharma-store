import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate environment variables
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(
  varName => !import.meta.env[varName] || import.meta.env[varName] === 'your_api_key_here' || import.meta.env[varName].includes('your_')
);

if (missingVars.length > 0) {
  console.error(
    '❌ Missing Firebase Configuration!\n' +
    `The following environment variables are not set: ${missingVars.join(', ')}\n\n` +
    'Please configure these in your Vercel Dashboard:\n' +
    '1. Go to vercel.com → Your Project → Settings → Environment Variables\n' +
    '2. Add all VITE_FIREBASE_* variables from your Firebase Console\n\n' +
    'See DEPLOYMENT.md for detailed instructions.'
  );
}

// Check if config is valid before initializing
const isConfigValid = Object.values(firebaseConfig).every(val => val && !val.includes('your_'));

if (!isConfigValid) {
  console.warn('⚠️ Firebase configuration is incomplete. App will load but Firebase features will not work.');
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Only initialize messaging and functions if config is valid
export const messaging = isConfigValid ? getMessaging(app) : null;
export const functions = isConfigValid ? getFunctions(app) : null;

export default app;
