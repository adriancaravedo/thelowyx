"use client";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Sheet from "@/components/ui/Sheet";
import { useApp } from "@/store/AppContext";

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsSheet({ open, onClose }: SettingsSheetProps) {
  const { profile, updateProfile } = useApp();
  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username);
  const [email, setEmail] = useState(profile.email);
  const [editing, setEditing] = useState(false);

  const handleSave = () => {
    updateProfile({ name, username, email });
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
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Name</div>
          {editing
            ? <input value={name} onChange={e => setName(e.target.value)} className="w-full border-b border-gray-200 py-1 text-gray-900 text-sm focus:outline-none focus:border-blue-500" />
            : <div className="text-gray-900 text-sm">{profile.name}</div>
          }
        </div>
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Username</div>
          {editing
            ? <input value={username} onChange={e => setUsername(e.target.value)} className="w-full border-b border-gray-200 py-1 text-gray-900 text-sm focus:outline-none focus:border-blue-500" />
            : <div className="text-gray-900 text-sm">{profile.username}</div>
          }
        </div>
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Email</div>
          {editing
            ? <input value={email} onChange={e => setEmail(e.target.value)} className="w-full border-b border-gray-200 py-1 text-gray-900 text-sm focus:outline-none focus:border-blue-500" />
            : <div className="text-gray-900 text-sm">{profile.email}</div>
          }
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
