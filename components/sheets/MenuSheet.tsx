"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Receipt, Grid3X3, Sliders, Settings, RefreshCw, Target, TrendingUp, Camera, ArrowLeft } from "lucide-react";
import Sheet from "@/components/ui/Sheet";
import SettingsSheet from "@/components/sheets/SettingsSheet";
import { useAuth } from "@/store/AuthContext";

interface MenuSheetProps {
  open: boolean;
  onClose: () => void;
  onSettingsOpen?: () => void;
}

export default function MenuSheet({ open, onClose }: MenuSheetProps) {
  const router = useRouter();
  const { profile, saveProfile, logout } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => saveProfile({ avatar: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  const handleSignOut = async () => { await logout(); onClose(); };

  const menuItems = [
    { icon: Users, label: "Members", soon: true },
    { icon: Receipt, label: "Receipts", soon: true },
    { icon: Grid3X3, label: "Categories", soon: false, action: () => { router.push("/categories"); onClose(); } },
    { icon: Sliders, label: "Preferences", soon: true },
    { icon: Settings, label: "Settings", soon: false, action: () => setSettingsOpen(true) },
  ];

  const moreItems = [
    { icon: RefreshCw, label: "Recurring", soon: true },
    { icon: Target, label: "Goals", soon: true },
    { icon: TrendingUp, label: "Investments", soon: true },
  ];

  // If settings is open, show settings view inside the same sheet
  if (settingsOpen) {
    return (
      <Sheet open={open} onClose={onClose}>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setSettingsOpen(false)} className="p-1 -ml-1">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
        </div>
        <SettingsInline onBack={() => setSettingsOpen(false)} />
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onClose={onClose}>
      {/* Profile */}
      <div className="mb-6">
        <div className="relative w-16 h-16 mb-3">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
            {profile?.avatar
              ? <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">
                  {profile?.name?.charAt(0) || "?"}
                </div>
            }
          </div>
          <button onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 w-5 h-5 bg-gray-700 rounded-full flex items-center justify-center">
            <Camera size={10} className="text-white" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <div className="text-xl font-bold text-gray-900">{profile?.name || ""}</div>
        <div className="text-sm text-gray-400">@{profile?.username || ""}</div>
      </div>

      <div className="mb-6">
        <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">Your Household</div>
        <div className="space-y-0.5">
          {menuItems.map(({ icon: Icon, label, soon, action }) => (
            <button key={label} onClick={soon ? undefined : action}
              className={`flex items-center gap-3 w-full py-3 text-left ${soon ? "opacity-50 cursor-default" : "hover:bg-gray-50 rounded-xl px-2 -mx-2"}`}>
              <Icon size={18} className="text-gray-500" />
              <span className="text-gray-800 font-medium">{label}</span>
              {soon && <span className="ml-1 bg-blue-100 text-blue-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full">SOON</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">More features</div>
        <div className="space-y-0.5">
          {moreItems.map(({ icon: Icon, label }) => (
            <button key={label} className="flex items-center gap-3 w-full py-3 opacity-50 cursor-default">
              <Icon size={18} className="text-gray-500" />
              <span className="text-gray-800 font-medium">{label}</span>
              <span className="ml-1 bg-blue-100 text-blue-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full">SOON</span>
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleSignOut} className="w-full py-3.5 bg-gray-50 rounded-2xl text-red-500 font-semibold text-sm">
        Sign out
      </button>
    </Sheet>
  );
}

// Inline Settings component shown inside the menu sheet
function SettingsInline({ onBack }: { onBack: () => void }) {
  const { profile, saveProfile } = useAuth();
  const [name, setName] = useState(profile?.name || "");
  const [username, setUsername] = useState(profile?.username || "");
  const [email, setEmail] = useState(profile?.email || "");
  const [editing, setEditing] = useState(false);

  const handleSave = async () => {
    await saveProfile({ name, username, email });
    setEditing(false);
  };

  return (
    <div>
      <div className="text-xl font-bold text-gray-900 mb-1">Personal</div>
      <div className="text-sm text-gray-400 mb-6">
        To help prevent fraud on TheLowyx, we ask for this info to check that you&apos;re really you.
      </div>
      <div className="space-y-5">
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
    </div>
  );
}
