"use client";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Sheet from "@/components/ui/Sheet";
import { useAuth } from "@/store/AuthContext";

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsSheet({ open, onClose }: SettingsSheetProps) {
  const { profile, saveProfile } = useAuth();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setUsername(profile.username);
      setEmail(profile.email);
    }
  }, [profile]);

  const handleSave = async () => {
    await saveProfile({ name, username, email });
    setEditing(false);
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onClose} className="p-1 -ml-1">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
      </div>

      <div className="mb-2">
        <div className="text-xl font-bold text-gray-900">Personal</div>
        <div className="text-sm text-gray-400 mt-1">
          To help prevent fraud on TheLowyx, we ask for this info to check that you&apos;re really you.
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {[
          { label: "Name", value: name, set: setName },
          { label: "Username", value: username, set: setUsername },
          { label: "Email", value: email, set: setEmail },
        ].map(({ label, value, set }) => (
          <div key={label}>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</div>
            {editing
              ? <input value={value} onChange={e => set(e.target.value)}
                  className="w-full border-b border-gray-200 py-1 text-gray-900 text-sm focus:outline-none focus:border-blue-500" />
              : <div className="text-gray-900 text-sm">{value}</div>
            }
          </div>
        ))}
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Currency</div>
          <div className="text-gray-900 text-sm">{profile?.currency === "USD" ? "USD $" : "PEN S/."}</div>
        </div>
      </div>

      <div className="mt-8">
        {editing ? (
          <div className="flex gap-3">
            <button onClick={() => setEditing(false)} className="flex-1 py-3.5 bg-gray-100 rounded-2xl text-gray-600 font-semibold text-sm">Cancel</button>
            <button onClick={handleSave} className="flex-1 py-3.5 bg-gray-900 rounded-2xl text-white font-semibold text-sm">Save</button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="w-full py-3.5 bg-gray-100 rounded-2xl text-gray-800 font-semibold text-sm">
            Edit profile
          </button>
        )}
      </div>
    </Sheet>
  );
}
