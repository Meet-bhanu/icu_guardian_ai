import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBJZqdGvZdx9msdD7zELT81054yo38DtUk",
  authDomain: "healthhalo-a044a.firebaseapp.com",
  projectId: "healthhalo-a044a",
  storageBucket: "healthhalo-a044a.firebasestorage.app",
  messagingSenderId: "261295476274",
  appId: "1:261295476274:web:e8fc28292e924eebd0f62b",
  measurementId: "G-QNM796Q3NC"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
