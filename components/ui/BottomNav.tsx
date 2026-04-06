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
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex justify-center pb-4 px-4 pointer-events-none">
      <div className="bg-white/90 backdrop-blur-md rounded-full shadow-lg px-2 py-2 flex items-center gap-1 pointer-events-auto border border-gray-100">
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
