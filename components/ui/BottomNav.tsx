"use client";
import { usePathname, useRouter } from "next/navigation";
import { CreditCard, Home, FileText, Plus } from "lucide-react";

const NAV = [
  { path: "/accounts", icon: CreditCard, label: "Accounts" },
  { path: "/dashboard", icon: Home, label: "Dashboard" },
  { path: "/transactions", icon: FileText, label: "Transactions" },
  { path: "/add", icon: Plus, label: "Add" },
];

interface BottomNavProps {
  onAddPress?: () => void;
}

export default function BottomNav({ onAddPress }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex justify-center pb-5 px-4 pointer-events-none">
      <div
        className="rounded-full px-2 py-2 flex items-center gap-1 pointer-events-auto border border-white/20"
        style={{
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.5) inset",
        }}
      >
        {NAV.map(({ path, icon: Icon, label }) => {
          const isActive = pathname === path || (path === "/dashboard" && pathname === "/");
          const isAdd = path === "/add";

          return (
            <button
              key={path}
              onClick={() => isAdd ? onAddPress?.() : router.push(path)}
              className={`flex items-center justify-center transition-all rounded-full ${
                isActive
                  ? "bg-gray-900 text-white px-5 py-2.5"
                  : "text-gray-400 px-4 py-2.5 hover:text-gray-600"
              }`}
              aria-label={label}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
