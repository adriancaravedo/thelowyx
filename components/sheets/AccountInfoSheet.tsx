"use client";
import { useState } from "react";
import Sheet from "@/components/ui/Sheet";
import Sparkline from "@/components/ui/Sparkline";
import RangeSelector from "@/components/ui/RangeSelector";
import AccountCard from "@/components/ui/AccountCard";
import { useApp, Account } from "@/store/AppContext";
import { formatCurrency, calcChangePercent, TimeRange } from "@/lib/utils";

interface AccountInfoSheetProps {
  open: boolean;
  onClose: () => void;
  account: Account | null;
  onEdit: (a: Account) => void;
}

export default function AccountInfoSheet({ open, onClose, account, onEdit }: AccountInfoSheetProps) {
  const { deleteAccount } = useApp();
  const [range, setRange] = useState<TimeRange>("1M");

  if (!account) return null;

  const change = calcChangePercent(account.history, range);
  const isPositive = change >= 0;

  const handleDelete = () => {
    deleteAccount(account.id);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="flex flex-col items-center mb-4">
        <AccountCard account={account} size="lg" />
        <div className="text-lg font-bold mt-4 mb-3">{account.name}</div>
        <div className="flex gap-8">
          <div className="text-center">
            <div className="text-xs text-gray-400">Available</div>
            <div className="text-base font-semibold">{formatCurrency(account.balance)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">Change</div>
            <div className={`text-base font-semibold ${isPositive ? "text-green-500" : "text-red-500"}`}>
              {isPositive ? "↗" : "↘"} {Math.abs(change)}%
            </div>
          </div>
        </div>
      </div>

      <Sparkline history={account.history} range={range} height={130} />
      <div className="mt-2 mb-6">
        <RangeSelector value={range} onChange={setRange} />
      </div>

      <button
        onClick={() => { onClose(); setTimeout(() => onEdit(account), 150); }}
        className="w-full py-3.5 bg-gray-100 rounded-2xl text-gray-800 font-semibold text-sm mb-3"
      >
        Edit account
      </button>
      <button onClick={handleDelete} className="w-full py-2 text-red-500 font-semibold text-sm">
        Delete account
      </button>
    </Sheet>
  );
}
