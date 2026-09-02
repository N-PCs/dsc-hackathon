"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import {
  auth,
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  logOut,
  resetPassword,
  isVITBhopalEmail,
} from "./firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isVITStudent: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<User | undefined>;
  signInWithEmail: (email: string, pass: string) => Promise<User | undefined>;
  signUpWithEmail: (email: string, pass: string) => Promise<User | undefined>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser: User | null) => {
        setUser(currentUser);
        setLoading(false);
      },
      (err: Error) => {
        console.error("Auth state observer error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      const u = await signInWithGoogle();
      return u;
    } catch (err: any) {
      const msg = err.message || "Failed to sign in with Google";
      setError(msg);
      throw err;
    }
  };

  const handleEmailSignIn = async (email: string, pass: string) => {
    setError(null);
    try {
      const u = await signInWithEmail(email, pass);
      return u;
    } catch (err: any) {
      let msg = "Failed to sign in with email & password.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        msg = "Invalid email or password.";
      } else if (err.code === "auth/too-many-requests") {
        msg = "Too many failed login attempts. Please try again later.";
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
      throw new Error(msg);
    }
  };

  const handleEmailSignUp = async (email: string, pass: string) => {
    setError(null);
    try {
      const u = await signUpWithEmail(email, pass);
      return u;
    } catch (err: any) {
      let msg = "Failed to create account.";
      if (err.code === "auth/email-already-in-use") {
        msg = "An account with this email already exists.";
      } else if (err.code === "auth/weak-password") {
        msg = "Password should be at least 6 characters.";
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
      throw new Error(msg);
    }
  };

  const handleSignOut = async () => {
    setError(null);
    try {
      await logOut();
      setUser(null);
    } catch (err: any) {
      setError(err.message || "Failed to sign out");
      throw err;
    }
  };

  const handlePasswordReset = async (email: string) => {
    setError(null);
    try {
      await resetPassword(email);
    } catch (err: any) {
      let msg = "Failed to send password reset email.";
      if (err.code === "auth/user-not-found") {
        msg = "No account found with this email.";
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
      throw new Error(msg);
    }
  };

  const isVITStudent = user?.email ? isVITBhopalEmail(user.email) : false;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isVITStudent,
        error,
        signInWithGoogle: handleGoogleSignIn,
        signInWithEmail: handleEmailSignIn,
        signUpWithEmail: handleEmailSignUp,
        signOut: handleSignOut,
        sendPasswordReset: handlePasswordReset,
        clearError: () => setError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
