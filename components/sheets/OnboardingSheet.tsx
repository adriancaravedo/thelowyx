"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/store/AuthContext";

interface OnboardingSheetProps {
  open: boolean;
  onComplete: () => void;
}

export default function OnboardingSheet({ open, onComplete }: OnboardingSheetProps) {
  const { profile, saveProfile } = useAuth();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [currency, setCurrency] = useState<"USD" | "PEN">("USD");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setUsername(profile.username || "");
      setCurrency(profile.currency || "USD");
    }
  }, [profile]);

  const currencySymbol = currency === "USD" ? "$" : "S/.";
  const displayUsername = username ? `${currencySymbol}${username}` : `${currencySymbol}username`;
  const displayName = name || "Your Name";

  const handleSave = async () => {
    if (!name.trim() || !username.trim()) return;
    setSaving(true);
    await saveProfile({ name, username, currency, onboardingComplete: true });

    // Confetti
    const confetti = (await import("canvas-confetti")).default;
    confetti({
      particleCount: 200,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#22c55e", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6"],
    });
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 120,
        origin: { y: 0.5 },
        colors: ["#22c55e", "#3b82f6", "#f59e0b"],
      });
    }, 300);

    setTimeout(() => {
      setSaving(false);
      onComplete();
    }, 1200);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Blurred backdrop — NOT clickable to dismiss */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />

      {/* Sheet */}
      <div
        className="relative bg-white rounded-t-3xl w-full z-10 px-5 pb-10 pt-3"
        style={{ animation: "slideUp 0.3s cubic-bezier(0.32,0.72,0,1)" }}
      >
        {/* Handle */}
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        <p className="text-center text-gray-400 text-sm mb-5">Welcome aboard</p>

        {/* Card preview */}
        <div
          className="rounded-2xl p-5 mb-6 mx-auto"
          style={{
            background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
            width: "100%",
            maxWidth: 320,
            minHeight: 160,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Shine */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)",
            pointerEvents: "none",
          }} />
          <div className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-geist-sans)" }}>
            {displayName}
          </div>
          <div className="flex justify-between items-end mt-10">
            <div className="text-white/60 text-sm font-mono">{displayUsername}</div>
            <div className="text-white/80 text-sm font-semibold">{currency}</div>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-5 mb-6">
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-800 mb-1">Name</div>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Adrian Caravedo"
              className="w-full text-center text-gray-400 text-sm border-b border-gray-100 pb-1 focus:outline-none focus:border-blue-400 bg-transparent"
            />
          </div>

          <div className="text-center">
            <div className="text-sm font-semibold text-gray-800 mb-1">Username</div>
            <input
              value={username}
              onChange={e => setUsername(e.target.value.replace(/\s/g, "").toLowerCase())}
              placeholder="andrelowyx"
              className="w-full text-center text-gray-400 text-sm border-b border-gray-100 pb-1 focus:outline-none focus:border-blue-400 bg-transparent"
            />
          </div>

          <div className="text-center">
            <div className="text-sm font-semibold text-gray-800 mb-2">Currency</div>
            <div className="flex bg-gray-100 rounded-full p-1 gap-1 w-fit mx-auto">
              {(["USD", "PEN"] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-6 py-1.5 rounded-full text-sm font-medium transition-all ${
                    currency === c ? "bg-white text-black shadow-sm" : "text-gray-500"
                  }`}
                >
                  {c === "USD" ? "USD $" : "PEN S/."}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!name.trim() || !username.trim() || saving}
          className="w-full py-3.5 bg-gray-100 rounded-2xl text-gray-800 font-semibold text-sm disabled:opacity-40 transition-all"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
