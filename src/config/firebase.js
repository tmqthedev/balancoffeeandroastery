// Firebase configuration for frontend (Free Spark Plan - No Storage)
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services (No Storage for free plan)
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// For images, we'll use local storage or external CDN
export const storage = null; // Not using Firebase Storage

export default app;
