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

const MONO = { fontFamily: "var(--font-geist-mono)" };

export default function AccountInfoSheet({ open, onClose, account, onEdit }: AccountInfoSheetProps) {
  const { deleteAccount } = useApp();
  const [range, setRange] = useState<TimeRange>("1M");
  const [holdingOpen, setHoldingOpen] = useState(false);

  if (!account) return null;

  const change = calcChangePercent(account.history, range);
  const isPositive = change >= 0;
  const isInvestment = account.type === "investment";
  const isCredit = account.type === "credit";
  const isRealEstate = account.type === "real_estate";
  const isLoan = account.type === "loan";
  const utilized = isCredit && account.limit
    ? ((account.balance / account.limit) * 100).toFixed(2) : null;

  const typeLabel = {
    debit: "Debit Cards", credit: "Credit Cards", investment: "Investments",
    real_estate: "Real State", loan: "Loans", other: "Others"
  }[account.type] || "";

  const handleDelete = () => { deleteAccount(account.id); onClose(); };

  return (
    <>
      <Sheet open={open} onClose={onClose}>
        <div className="text-center text-xs text-gray-400 mb-3">{typeLabel}</div>

        {/* Card preview */}
        <div className="flex justify-center mb-3">
          <AccountCard account={account} size="lg" />
        </div>

        {/* Name */}
        <div className="text-center font-bold text-lg mb-3">
          {account.description || account.name}
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 mb-4">
          {isCredit ? (
            <>
              <div className="text-center">
                <div className="text-xs text-gray-400">Balance</div>
                <div className="text-sm font-semibold" style={MONO}>{formatCurrency(account.balance)}</div>
              </div>
              {account.limit && (
                <div className="text-center">
                  <div className="text-xs text-gray-400">Limit</div>
                  <div className="text-sm font-semibold" style={MONO}>{formatCurrency(account.limit)}</div>
                </div>
              )}
              {utilized && (
                <div className="text-center">
                  <div className="text-xs text-gray-400">Utilized</div>
                  <div className="text-sm font-semibold text-green-500" style={MONO}>{utilized}%</div>
                </div>
              )}
            </>
          ) : isRealEstate ? (
            <div className="text-center">
              <div className={`text-sm font-semibold ${isPositive ? "text-green-500" : "text-red-500"}`}>
                {isPositive ? "↗" : "↘"} {Math.abs(change)}%
              </div>
              <div className="text-xs text-gray-400">Estimated value</div>
              <div className="text-sm font-semibold" style={MONO}>{formatCurrency(account.balance)}</div>
            </div>
          ) : (
            <>
              <div className="text-center">
                <div className="text-xs text-gray-400">{isLoan ? "Current" : "Available"}</div>
                <div className="text-sm font-semibold" style={MONO}>{formatCurrency(account.balance)}</div>
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

        {/* Chart */}
        <Sparkline history={account.history} range={range} height={120} />
        <div className="mt-2 mb-4">
          <RangeSelector value={range} onChange={setRange} />
        </div>

        {/* Holdings — horizontal scroll cards */}
        {isInvestment && (account.holdings || []).length > 0 && (
          <div className="mb-4 -mx-1">
            <div className="flex gap-3 overflow-x-auto px-1 pb-2 scrollbar-hide">
              {(account.holdings || []).map(h => {
                const hChange = h.changePercent || 0;
                const hPositive = hChange >= 0;
                // Mini sparkline data from account history
                const miniHistory = account.history.slice(-10);
                return (
                  <div key={h.id} className="min-w-[140px] bg-white border border-gray-100 rounded-2xl p-3 flex-shrink-0 shadow-sm">
                    {/* Header row */}
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <span className="text-xs text-gray-400 mr-1">{h.quantity}</span>
                        <span className="text-xs font-bold text-gray-900" style={MONO}>{h.symbol}</span>
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${hPositive ? "bg-green-400 text-white" : "bg-red-400 text-white"}`}>
                        {hPositive ? "↗" : "↘"}{Math.abs(hChange).toFixed(2)}%
                      </span>
                    </div>
                    {/* Description */}
                    <div className="text-[9px] text-gray-400 truncate mb-2">{h.description}</div>
                    {/* Mini sparkline */}
                    <Sparkline history={miniHistory} range="1M" height={40} showDot={true} />
                    {/* Value */}
                    <div className="text-sm font-bold text-gray-900 mt-2" style={MONO}>
                      {formatCurrency(h.currentValue || h.quantity * h.buyPrice)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
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

      <HoldingSheet
        open={holdingOpen}
        onClose={() => setHoldingOpen(false)}
        accountId={account.id}
      />
    </>
  );
}
