"use client";
import { AlignLeft } from "lucide-react";
import NotificationPanel from "@/components/ui/NotificationPanel";

interface HeaderProps {
  title: string;
  onMenuOpen: () => void;
}

export default function Header({ title, onMenuOpen }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button onClick={onMenuOpen} className="p-1 -ml-1">
          <AlignLeft size={22} className="text-gray-700" />
        </button>
        <span className="text-gray-300">|</span>
        <h1 className="text-base font-semibold text-gray-800">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <NotificationPanel />
        <img
          src="/thelowyx.png"
          alt="TheLowyx"
          className="h-8 w-auto"
          style={{ background: "transparent", mixBlendMode: "normal" }}
        />
      </div>
    </header>
  );
}
