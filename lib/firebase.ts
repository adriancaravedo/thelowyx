import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD3lGvFAuKHfWuPy_hHxabPl3YFhl_1d44",
  authDomain: "thelowyx.firebaseapp.com",
  projectId: "thelowyx",
  storageBucket: "thelowyx.firebasestorage.app",
  messagingSenderId: "43873698106",
  appId: "1:43873698106:web:e236bbad674c705fd6d003",
  measurementId: "G-FJP6QRTVL9",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
