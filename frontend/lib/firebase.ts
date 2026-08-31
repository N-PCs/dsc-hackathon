// Firebase Authentication & Client Setup
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  Auth,
} from "firebase/auth";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDpu0w07PqgYE1SzsXlW8A_0l6ZBc45JWI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dscorigin.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dscorigin",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "dscorigin.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "131384799615",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:131384799615:web:229ac9ff5b19872eb6aa4a",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-58MTEF0T3Y",
};

// Initialize Firebase safely (avoid re-initialization on hot reloads)
export const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth: Auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

/**
 * Validates whether an email belongs to the official student domain (@vitbhopal.ac.in)
 */
export function isVITBhopalEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const clean = email.trim().toLowerCase();
  return clean.endsWith("@vitbhopal.ac.in");
}

/**
 * Sign in with Google Popup
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Firebase Google Sign-In error:", error);
    throw error;
  }
}

/**
 * Sign in with Email & Password
 */
export async function signInWithEmail(email: string, pass: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
    return result.user;
  } catch (error: any) {
    console.error("Firebase Email Sign-In error:", error);
    throw error;
  }
}

/**
 * Register / Sign Up with Email & Password
 */
export async function signUpWithEmail(email: string, pass: string) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    return result.user;
  } catch (error: any) {
    console.error("Firebase Sign-Up error:", error);
    throw error;
  }
}

/**
 * Sign Out
 */
export async function logOut() {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error("Firebase Sign-Out error:", error);
    throw error;
  }
}

/**
 * Password Reset
 */
export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error: any) {
    console.error("Firebase Password Reset error:", error);
    throw error;
  }
}
