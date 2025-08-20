import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAt8-MxL3Vix8ioizBoEiwqRJ0hG5siJEE",
  authDomain: "balancoffeeandroastery.firebaseapp.com",
  databaseURL: "https://balancoffeeandroastery-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "balancoffeeandroastery",
  storageBucket: "balancoffeeandroastery.firebasestorage.app",
  messagingSenderId: "1043800304780",
  appId: "1:1043800304780:web:e7672a8eff411f44dcdfa9",
  measurementId: "G-QL43J88LBC"
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
