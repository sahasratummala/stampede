// lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration (Matches the one you provided)
const firebaseConfig = {
  apiKey: "AIzaSyAVs6RM6eg6rMgm8d_x9yJPKWcZNcBpynQ",
  authDomain: "stampede-7321b.firebaseapp.com",
  projectId: "stampede-7321b",
  storageBucket: "stampede-7321b.firebasestorage.app",
  messagingSenderId: "316932487255",
  appId: "1:316932487255:web:a907d6595fefbcebe94b12"
};

// Initialize Firebase (Safely checks if already initialized)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize and Export services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;