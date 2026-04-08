"use client";
import { Account } from "@/store/AppContext";
import { formatCurrency } from "@/lib/utils";

interface AccountCardProps {
  account: Account;
  size?: "sm" | "md" | "lg";
  previewName?: string;
  previewDesc?: string;
  previewLast4?: string;
}

const typeLabel = (type: string) => {
  switch(type) {
    case "credit": return "Credit";
    case "debit": return "Debit";
    case "investment": return "Investment";
    case "real_estate": return "Real Estate";
    case "loan": return "Loan";
    case "other": return "Cash";
    default: return type;
  }
};

export default function AccountCard({ account, size = "md", previewName, previewDesc, previewLast4 }: AccountCardProps) {
  const sizes = {
    sm: { card: "w-28 h-16 rounded-xl p-2", name: "text-xs font-bold", sub: "text-[9px]", num: "text-[9px]" },
    md: { card: "w-44 h-24 rounded-2xl p-3", name: "text-sm font-bold", sub: "text-[10px]", num: "text-[10px]" },
    lg: { card: "w-56 h-32 rounded-2xl p-4", name: "text-base font-bold", sub: "text-xs", num: "text-xs" },
  };
  const s = sizes[size];
  const displayName = previewName !== undefined ? previewName : account.name;
  const displayDesc = previewDesc !== undefined ? previewDesc : (account.description || typeLabel(account.type));
  const displayLast4 = previewLast4 !== undefined ? previewLast4 : account.last4;

  return (
    <div className={`${s.card} flex flex-col justify-between relative overflow-hidden`} style={{ backgroundColor: account.color }}>
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 60%)" }} />
      <div className={`${s.name} text-white tracking-wide`}>{displayName || "Account Name"}</div>
      <div className="flex justify-between items-end">
        <div className={`${s.sub} text-white/70`}>{displayDesc}</div>
        <div className={`${s.num} text-white/90 font-mono`}>
          {displayLast4 ? `•••• ${displayLast4}` : "•••• ----"}
        </div>
      </div>
    </div>
  );
}
