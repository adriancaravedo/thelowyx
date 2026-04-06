"use client";
import { Account } from "@/store/AppContext";
import { formatCurrency } from "@/lib/utils";

interface AccountCardProps {
  account: Account;
  size?: "sm" | "md" | "lg";
}

export default function AccountCard({ account, size = "md" }: AccountCardProps) {
  const sizes = {
    sm: { card: "w-28 h-16 rounded-xl p-2", name: "text-xs font-bold", sub: "text-[9px]", num: "text-[9px]" },
    md: { card: "w-44 h-24 rounded-2xl p-3", name: "text-sm font-bold", sub: "text-[10px]", num: "text-[10px]" },
    lg: { card: "w-56 h-32 rounded-2xl p-4", name: "text-base font-bold", sub: "text-xs", num: "text-xs" },
  };
  const s = sizes[size];

  return (
    <div
      className={`${s.card} flex flex-col justify-between relative overflow-hidden`}
      style={{ backgroundColor: account.color }}
    >
      {/* Shine overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 60%)" }} />

      <div className={`${s.name} text-white tracking-wide`}>{account.name}</div>
      <div className="flex justify-between items-end">
        <div>
          <div className={`${s.sub} text-white/70`}>
            {account.type === "credit" ? "Credit" : account.type === "debit" ? "Debit" : "Investment"}
          </div>
          {account.limit && (
            <div className={`${s.sub} text-white/60`}>{formatCurrency(account.limit)} limit</div>
          )}
        </div>
        <div className={`${s.num} text-white/90 font-mono`}>•••• {account.last4}</div>
      </div>
    </div>
  );
}
