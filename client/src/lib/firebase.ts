import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

// Check if credentials are set. If not, print warning.
const hasCredentials = !!firebaseConfig.apiKey;
if (!hasCredentials) {
  console.warn(
    "[Firebase] Setup incomplete: VITE_FIREBASE_API_KEY is not defined. " +
    "Please copy credentials from Firebase Console and set them in your .env file."
  );
  
  // Use dummy fallbacks to prevent crash on initialization, allowing the app to compile
  firebaseConfig.apiKey = "dummy-api-key-for-compilation";
  firebaseConfig.authDomain = "dummy-auth-domain";
  firebaseConfig.projectId = "dummy-project-id";
  firebaseConfig.storageBucket = "dummy-storage-bucket";
  firebaseConfig.messagingSenderId = "123456789";
  firebaseConfig.appId = "1:123456789:web:abcdef123";
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, hasCredentials };
