"use client";
import { useState } from "react";
import Sheet from "@/components/ui/Sheet";
import Sparkline from "@/components/ui/Sparkline";
import RangeSelector from "@/components/ui/RangeSelector";
import AccountCard from "@/components/ui/AccountCard";
import HoldingSheet from "@/components/sheets/HoldingSheet";
import { useApp, Account } from "@/store/AppContext";
import { formatCurrency, calcChangePercent, TimeRange } from "@/lib/utils";

interface AccountInfoSheetProps {
  open: boolean;
  onClose: () => void;
  account: Account | null;
  onEdit: (a: Account) => void;
}

export default function AccountInfoSheet({ open, onClose, account, onEdit }: AccountInfoSheetProps) {
  const { deleteAccount, deleteHolding } = useApp();
  const [range, setRange] = useState<TimeRange>("1M");
  const [holdingOpen, setHoldingOpen] = useState(false);

  if (!account) return null;

  const change = calcChangePercent(account.history, range);
  const isPositive = change >= 0;
  const isInvestment = account.type === "investment";
  const isRealEstate = account.type === "real_estate";
  const isCredit = account.type === "credit";
  const isLoan = account.type === "loan";

  const handleDelete = () => { deleteAccount(account.id); onClose(); };

  const utilized = isCredit && account.limit ? ((account.balance / account.limit) * 100).toFixed(2) : null;

  return (
    <>
      <Sheet open={open} onClose={onClose}>
        <div className="text-center text-xs text-gray-400 mb-3">
          {account.type === "debit" ? "Debit Cards" : account.type === "credit" ? "Credit Cards" :
           account.type === "investment" ? "Investments" : account.type === "real_estate" ? "Real State" :
           account.type === "loan" ? "Loans" : "Others"}
        </div>

        <div className="flex justify-center mb-3">
          <AccountCard account={account} size="lg" />
        </div>

        <div className="text-center font-bold text-lg mb-3">{account.description || account.name}</div>

        {/* Stats row */}
        <div className={`flex justify-center gap-8 mb-4`}>
          {isRealEstate ? (
            <>
              <div className="text-center">
                <div className={`text-sm font-semibold ${isPositive ? "text-green-500" : "text-red-500"}`}>
                  {isPositive ? "↗" : "↘"} {Math.abs(change)}%
                </div>
                <div className="text-xs text-gray-400 mt-0.5">Estimated value</div>
                <div className="text-sm font-semibold">{formatCurrency(account.balance)}</div>
              </div>
            </>
          ) : isCredit ? (
            <>
              <div className="text-center"><div className="text-xs text-gray-400">Balance</div><div className="text-sm font-semibold">{formatCurrency(account.balance)}</div></div>
              {account.limit && <div className="text-center"><div className="text-xs text-gray-400">Limit</div><div className="text-sm font-semibold">{formatCurrency(account.limit)}</div></div>}
              {utilized && <div className="text-center"><div className="text-xs text-gray-400">Utilized</div><div className="text-sm font-semibold text-green-500">{utilized}%</div></div>}
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="text-xs text-gray-400">{isLoan ? "Current" : "Available"}</div>
                <div className="text-sm font-semibold">{formatCurrency(account.balance)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400">Change</div>
                <div className={`text-sm font-semibold ${isPositive ? "text-green-500" : "text-red-500"}`}>
                  {isPositive ? "↗" : "↘"} {Math.abs(change)}%
                </div>
              </div>
            </>
          )}
        </div>

        <Sparkline history={account.history} range={range} height={120} />
        <div className="mt-2 mb-4"><RangeSelector value={range} onChange={setRange} /></div>

        {/* Holdings */}
        {isInvestment && (account.holdings || []).length > 0 && (
          <div className="mb-4">
            <div className="flex gap-3 overflow-x-auto pb-2">
              {(account.holdings || []).map(h => (
                <div key={h.id} className="min-w-[140px] bg-gray-50 rounded-2xl p-3 flex-shrink-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-gray-900 font-mono">{h.quantity} {h.symbol}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${(h.changePercent || 0) >= 0 ? "bg-green-400 text-white" : "bg-red-400 text-white"}`}>
                      {(h.changePercent || 0) >= 0 ? "↗" : "↘"}{Math.abs(h.changePercent || 0).toFixed(2)}%
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 truncate mb-2">{h.description}</div>
                  <Sparkline history={account.history.slice(-10)} range="1M" height={40} showDot={false} />
                  <div className="text-sm font-bold text-gray-900 mt-1">{formatCurrency(h.currentValue || h.quantity * h.buyPrice)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={() => { onClose(); setTimeout(() => onEdit(account), 150); }}
          className="w-full py-3.5 bg-gray-100 rounded-2xl text-gray-800 font-semibold text-sm mb-2">
          Edit account
        </button>
        {isInvestment && (
          <button onClick={() => setHoldingOpen(true)}
            className="w-full py-3.5 bg-gray-100 rounded-2xl text-gray-800 font-semibold text-sm mb-2">
            Add holding
          </button>
        )}
        <button onClick={handleDelete} className="w-full py-2 text-red-500 font-semibold text-sm">
          Delete account
        </button>
      </Sheet>

      <HoldingSheet open={holdingOpen} onClose={() => setHoldingOpen(false)} accountId={account.id} />
    </>
  );
}
