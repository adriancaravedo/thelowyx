"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { User, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";

export interface UserProfile {
  uid: string;
  name: string;
  username: string;
  currency: "USD" | "PEN";
  avatar?: string;
  email: string;
  onboardingComplete: boolean;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  saveProfile: (p: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const ref = doc(db, "users", u.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile);
        } else {
          // New user — create empty profile
          const newProfile: UserProfile = {
            uid: u.uid,
            name: u.displayName || "",
            username: "",
            currency: "USD",
            avatar: u.photoURL || "",
            email: u.email || "",
            onboardingComplete: false,
          };
          await setDoc(ref, newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
  };

  const saveProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    const updated = { ...profile, ...updates } as UserProfile;
    await setDoc(ref, updated, { merge: true });
    setProfile(updated);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, logout, saveProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
