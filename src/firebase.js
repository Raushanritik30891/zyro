import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAbF_TSr2aMNpY054ju17NfYbNUrhGwa7E",
  authDomain: "zyroesports.firebaseapp.com",
  projectId: "zyroesports",
  storageBucket: "zyroesports.firebasestorage.app",
  messagingSenderId: "312151411188",
  appId: "1:312151411188:web:95160883de31778a0411a1",
  measurementId: "G-EWYKYB410G"
};

// Initialize
const app = initializeApp(firebaseConfig);

// Services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;