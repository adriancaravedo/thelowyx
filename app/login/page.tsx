"use client";
import { useAuth } from "@/store/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { user, profile, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col justify-end">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/background-signup.png')" }}
      />

      {/* Gradient overlay bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 px-8 pb-16 flex flex-col items-center gap-6">
        {/* Logo */}
        <img
          src="/thelowyx-logo-white.png"
          alt="TheLowyx"
          className="h-12 w-auto"
          style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))" }}
        />

        {/* Google button */}
        <button
          onClick={handleGoogle}
          className="flex items-center gap-3 bg-white rounded-full px-6 py-3.5 w-full max-w-xs justify-center shadow-lg"
          style={{ fontFamily: "inherit" }}
        >
          <img src="/icon-google.png" alt="Google" className="w-5 h-5" />
          <span className="text-gray-800 font-medium text-sm">Sign in with Google</span>
        </button>
      </div>
    </div>
  );
}
