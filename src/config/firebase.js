import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Read environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if variables are valid and present
const isConfigValid = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "YOUR_API_KEY" &&
  firebaseConfig.projectId;

let app;
let auth;
let db;
let isFirebaseAvailable = false;

if (isConfigValid) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseAvailable = true;
    console.log("Firebase initialized successfully in online mode.");
  } catch (error) {
    console.error("Firebase initialization failed. Falling back to offline mode:", error);
  }
} else {
  console.warn("Firebase environment variables are missing or incomplete. Operating in LOCAL FALLBACK mode using LocalStorage.");
}

export { auth, db, isFirebaseAvailable };
