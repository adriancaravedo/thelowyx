"use client";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Receipt, Grid3X3, Sliders, Settings, RefreshCw, Target, TrendingUp, Camera } from "lucide-react";
import Sheet from "@/components/ui/Sheet";
import { useAuth } from "@/store/AuthContext";

interface MenuSheetProps {
  open: boolean;
  onClose: () => void;
  onSettingsOpen: () => void;
}

export default function MenuSheet({ open, onClose, onSettingsOpen }: MenuSheetProps) {
  const router = useRouter();
  const { profile, saveProfile, logout } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => saveProfile({ avatar: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  const menuItems = [
    { icon: Users, label: "Members", soon: true },
    { icon: Receipt, label: "Receipts", soon: true },
    { icon: Grid3X3, label: "Categories", soon: false, action: () => { router.push("/categories"); onClose(); } },
    { icon: Sliders, label: "Preferences", soon: true },
    { icon: Settings, label: "Settings", soon: false, action: () => { onClose(); setTimeout(onSettingsOpen, 100); } },
  ];

  const moreItems = [
    { icon: RefreshCw, label: "Recurring", soon: true },
    { icon: Target, label: "Goals", soon: true },
    { icon: TrendingUp, label: "Investments", soon: true },
  ];

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onClose} className="p-1 -ml-1">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
      </div>

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

      <button onClick={logout} className="w-full py-3.5 bg-gray-50 rounded-2xl text-red-500 font-semibold text-sm">
        Sign out
      </button>
    </Sheet>
  );
}
