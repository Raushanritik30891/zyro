// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA37gaPCtCguphVGuQpeSPHWriy2dQPh2E",
  authDomain: "t9-esports-final.firebaseapp.com",
  projectId: "t9-esports-final",
  storageBucket: "t9-esports-final.firebasestorage.app",
  messagingSenderId: "838888827680",
  appId: "1:838888827680:web:616b4b52033826a9604545",
  measurementId: "G-9GNHB4N6F9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (optional - only for web)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Firebase services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
export { analytics };

export default app;