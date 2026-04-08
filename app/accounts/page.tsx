"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp, Account, AccountType, Holding } from "@/store/AppContext";
import { useAuth } from "@/store/AuthContext";
import Header from "@/components/ui/Header";
import BottomNav from "@/components/ui/BottomNav";
import Sparkline from "@/components/ui/Sparkline";
import RangeSelector from "@/components/ui/RangeSelector";
import AccountCard from "@/components/ui/AccountCard";
import HoldingCard from "@/components/ui/HoldingCard";
import MenuSheet from "@/components/sheets/MenuSheet";
import AccountSheet from "@/components/sheets/AccountSheet";
import AccountInfoSheet from "@/components/sheets/AccountInfoSheet";
import HoldingSheet from "@/components/sheets/HoldingSheet";
import TransactionSheet from "@/components/sheets/TransactionSheet";
import { formatCurrency, calcChangePercent, getCombinedHistory, TimeRange } from "@/lib/utils";

type TabType = "Debit Card" | "Credit Card" | "Investments" | "Real State" | "Loans" | "Others";

const GROUPS: { label: string; type: AccountType; tab: TabType }[] = [
  { label: "Debit Cards", type: "debit", tab: "Debit Card" },
  { label: "Credit Cards", type: "credit", tab: "Credit Card" },
  { label: "Investments", type: "investment", tab: "Investments" },
  { label: "Real State", type: "real_estate", tab: "Real State" },
  { label: "Loans", type: "loan", tab: "Loans" },
  { label: "Others", type: "other", tab: "Others" },
];

const MONO = { fontFamily: "var(--font-geist-mono)" };

export default function AccountsPage() {
  const { accounts, standAloneHoldings, deleteStandAloneHolding } = useApp();
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [range, setRange] = useState<TimeRange>("1M");
  const [menuOpen, setMenuOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addDefaultType, setAddDefaultType] = useState<TabType>("Debit Card");
  const [infoOpen, setInfoOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addTxOpen, setAddTxOpen] = useState(false);
  const [holdingOpen, setHoldingOpen] = useState(false);
  const [editHoldingOpen, setEditHoldingOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  // Net worth = (debit + investment + real_estate + other + standAloneHoldings) - (credit + loans)
  const calcNetWorth = () => {
    let positive = 0, negative = 0;
    accounts.forEach(a => {
      if (["debit", "investment", "real_estate", "other"].includes(a.type)) positive += a.balance;
      else if (["credit", "loan"].includes(a.type)) negative += a.balance;
    });
    // Add standalone holdings value
    standAloneHoldings.forEach(h => { positive += h.currentValue || h.quantity * h.buyPrice; });
    return positive - negative;
  };

  const netWorth = calcNetWorth();
  const allHistory = getCombinedHistory(accounts);
  const change = calcChangePercent(allHistory, range);
  const isPositive = change >= 0;
  const currency = profile?.currency === "PEN" ? "S/." : "$";

  // Investments total = account balances + standalone holdings
  const investAccountsTotal = accounts.filter(a => a.type === "investment").reduce((s, a) => s + a.balance, 0);
  const holdingsTotal = standAloneHoldings.reduce((s, h) => s + (h.currentValue || h.quantity * h.buyPrice), 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <Header title="Accounts" onMenuOpen={() => setMenuOpen(true)} />
      <div className="px-4 pt-2 space-y-3">

        {/* Net worth card */}
        <div className="bg-white rounded-3xl p-5">
          <div className="flex justify-center mb-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isPositive ? "bg-green-400 text-white" : "bg-red-400 text-white"}`}>
              {isPositive ? "↗" : "↘"}{Math.abs(change)}%
            </span>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold tracking-tight text-gray-900" style={MONO}>
              {currency}{Math.abs(netWorth).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-400 mt-1">Net worth</div>
          </div>
          <div className="mt-4"><Sparkline history={allHistory} range={range} height={120} /></div>
          <div className="mt-3"><RangeSelector value={range} onChange={setRange} /></div>
        </div>

        {/* Account groups */}
        {GROUPS.map(({ label, type, tab }) => {
          const items = accounts.filter(a => a.type === type);
          const isInvestments = type === "investment";
          const groupTotal = isInvestments
            ? investAccountsTotal + holdingsTotal
            : items.reduce((s, a) => s + a.balance, 0);
          const isCollapsed = collapsed[type] ?? false;

          // Show investments group if there are accounts OR standalone holdings
          if (isInvestments && items.length === 0 && standAloneHoldings.length === 0) {
            return (
              <div key={type} className="bg-white rounded-3xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">▶</span>
                    <span className="text-sm font-semibold text-gray-700">{label}</span>
                    <span className="text-sm text-gray-400" style={MONO}>{currency}0.00</span>
                  </div>
                  <button onClick={() => { setAddDefaultType(tab); setAddOpen(true); }}
                    className="text-sm text-gray-400 underline">Add</button>
                </div>
              </div>
            );
          }

          if (!isInvestments && items.length === 0) {
            return (
              <div key={type} className="bg-white rounded-3xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">▶</span>
                    <span className="text-sm font-semibold text-gray-700">{label}</span>
                    <span className="text-sm text-gray-400" style={MONO}>{currency}0.00</span>
                  </div>
                  <button onClick={() => { setAddDefaultType(tab); setAddOpen(true); }}
                    className="text-sm text-gray-400 underline">Add</button>
                </div>
              </div>
            );
          }

          return (
            <div key={type} className="bg-white rounded-3xl p-4">
              <div className="flex items-center justify-between mb-2">
                <button onClick={() => setCollapsed(c => ({ ...c, [type]: !c[type] }))}
                  className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{isCollapsed ? "▶" : "▼"}</span>
                  <span className="text-sm font-semibold text-gray-700">{label}</span>
                  <span className="text-sm text-gray-400" style={MONO}>
                    {currency}{groupTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </button>
                <button onClick={() => { setAddDefaultType(tab); setAddOpen(true); }}
                  className="text-sm text-gray-400 underline">Add</button>
              </div>

              {!isCollapsed && (
                <div className="space-y-3 mt-3">
                  {/* Standalone holdings (investments only) — horizontal scroll */}
                  {isInvestments && standAloneHoldings.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                      {standAloneHoldings.map(h => (
                        <HoldingCard
                          key={h.id}
                          holding={h}
                          onClick={() => { setSelectedHolding(h); setEditHoldingOpen(true); }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Investment accounts — normal row */}
                  {items.map(acc => {
                    const accChange = calcChangePercent(acc.history, range);
                    const accPositive = accChange >= 0;
                    const isCredit = acc.type === "credit";
                    const isLoan = acc.type === "loan";
                    const isRealEstate = acc.type === "real_estate";
                    const utilized = isCredit && acc.limit ? ((acc.balance / acc.limit) * 100).toFixed(2) : null;

                    return (
                      <button key={acc.id}
                        onClick={() => { setSelectedAccount(acc); setInfoOpen(true); }}
                        className="flex items-center gap-3 w-full">
                        <AccountCard account={acc} size="sm" />
                        <div className="flex-1 text-left">
                          <div className="text-xs text-gray-400">{isRealEstate ? "Estimated value" : isLoan ? "Current" : "Balance"}</div>
                          <div className="text-sm font-semibold" style={MONO}>{formatCurrency(acc.balance)}</div>
                          {isCredit && acc.limit && <div className="text-xs text-gray-400">Limit {formatCurrency(acc.limit)}</div>}
                        </div>
                        {isCredit && utilized ? (
                          <div className="text-right">
                            <div className="text-xs text-gray-400">Utilized</div>
                            <div className="text-sm font-semibold text-green-500">{utilized}%</div>
                          </div>
                        ) : (
                          <div className="text-right">
                            <div className="text-xs text-gray-400">Change</div>
                            <div className={`text-sm font-semibold ${accPositive ? "text-green-500" : "text-red-500"}`}>
                              {accPositive ? "↗" : "↘"} {Math.abs(accChange)}%
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <BottomNav onAddPress={() => setAddTxOpen(true)} />
      <MenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} />
      <AccountSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        defaultType={addDefaultType}
        onAddHolding={() => setHoldingOpen(true)}
      />
      <AccountSheet open={editOpen} onClose={() => setEditOpen(false)} editAccount={selectedAccount} />
      <AccountInfoSheet
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        account={selectedAccount}
        onEdit={(a) => { setSelectedAccount(a); setInfoOpen(false); setTimeout(() => setEditOpen(true), 150); }}
      />
      {/* Standalone holding — add */}
      <HoldingSheet open={holdingOpen} onClose={() => setHoldingOpen(false)} />
      {/* Standalone holding — edit */}
      <HoldingSheet
        open={editHoldingOpen}
        onClose={() => setEditHoldingOpen(false)}
        editHolding={selectedHolding}
      />
      <TransactionSheet open={addTxOpen} onClose={() => setAddTxOpen(false)} />
    </div>
  );
}
