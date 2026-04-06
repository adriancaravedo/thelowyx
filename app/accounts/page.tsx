"use client";
import { useState } from "react";
import { useApp, Account } from "@/store/AppContext";
import Header from "@/components/ui/Header";
import BottomNav from "@/components/ui/BottomNav";
import Sparkline from "@/components/ui/Sparkline";
import RangeSelector from "@/components/ui/RangeSelector";
import AccountCard from "@/components/ui/AccountCard";
import MenuSheet from "@/components/sheets/MenuSheet";
import SettingsSheet from "@/components/sheets/SettingsSheet";
import AccountSheet from "@/components/sheets/AccountSheet";
import AccountInfoSheet from "@/components/sheets/AccountInfoSheet";
import TransactionSheet from "@/components/sheets/TransactionSheet";
import { formatCurrency, calcChangePercent, getCombinedHistory, TimeRange } from "@/lib/utils";

export default function AccountsPage() {
  const { accounts } = useApp();
  const [range, setRange] = useState<TimeRange>("1M");
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addTxOpen, setAddTxOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const combinedHistory = getCombinedHistory(accounts);
  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const change = calcChangePercent(combinedHistory, range);
  const isPositive = change >= 0;

  const debitAccounts = accounts.filter(a => a.type === "debit");
  const creditAccounts = accounts.filter(a => a.type === "credit");
  const investAccounts = accounts.filter(a => a.type === "investment");

  const debitTotal = debitAccounts.reduce((s, a) => s + a.balance, 0);
  const creditTotal = creditAccounts.reduce((s, a) => s + a.balance, 0);
  const investTotal = investAccounts.reduce((s, a) => s + a.balance, 0);

  const [debitOpen, setDebitOpen] = useState(true);
  const [creditOpen, setCreditOpen] = useState(false);
  const [investOpen, setInvestOpen] = useState(false);

  const AccountGroup = ({
    title, total, open, onToggle, items, onAdd
  }: { title: string; total: number; open: boolean; onToggle: () => void; items: Account[]; onAdd: () => void }) => (
    <div className="bg-white rounded-3xl p-4 mb-3">
      <div className="flex items-center justify-between mb-2">
        <button onClick={onToggle} className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{open ? "▼" : "▶"}</span>
          <span className="text-sm font-semibold text-gray-700">{title}</span>
          <span className="text-sm text-gray-400">{formatCurrency(total)}</span>
        </button>
        <button onClick={onAdd} className="text-sm text-gray-400 underline">Add</button>
      </div>
      {open && (
        <div className="space-y-3 mt-3">
          {items.map(acc => {
            const accChange = calcChangePercent(acc.history, range);
            const accPositive = accChange >= 0;
            return (
              <button
                key={acc.id}
                onClick={() => { setSelectedAccount(acc); setInfoOpen(true); }}
                className="flex items-center gap-4 w-full"
              >
                <AccountCard account={acc} size="sm" />
                <div className="flex-1 text-left">
                  <div className="text-xs text-gray-400">Balance</div>
                  <div className="text-sm font-semibold">{formatCurrency(acc.balance)}</div>
                  {acc.limit && <div className="text-xs text-gray-400">{formatCurrency(acc.limit)} limit</div>}
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">Change</div>
                  <div className={`text-sm font-semibold ${accPositive ? "text-green-500" : "text-red-500"}`}>
                    {accPositive ? "↗" : "↘"} {Math.abs(accChange)}%
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <Header title="Accounts" onMenuOpen={() => setMenuOpen(true)} />

      <div className="px-4 pt-2 space-y-4">
        {/* Net worth card */}
        <div className="bg-white rounded-3xl p-5">
          <div className="flex justify-center mb-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isPositive ? "bg-green-400 text-white" : "bg-red-400 text-white"}`}>
              {isPositive ? "↗" : "↘"}{Math.abs(change)}%
            </span>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold tracking-tight text-gray-900">{formatCurrency(totalBalance)}</div>
            <div className="text-sm text-gray-400 mt-1">Net worth</div>
          </div>
          <div className="mt-4">
            <Sparkline history={combinedHistory} range={range} height={120} />
          </div>
          <div className="mt-3">
            <RangeSelector value={range} onChange={setRange} />
          </div>
        </div>

        <AccountGroup title="Debit Cards" total={debitTotal} open={debitOpen} onToggle={() => setDebitOpen(o => !o)} items={debitAccounts} onAdd={() => setAddOpen(true)} />
        <AccountGroup title="Credit Cards" total={creditTotal} open={creditOpen} onToggle={() => setCreditOpen(o => !o)} items={creditAccounts} onAdd={() => setAddOpen(true)} />
        <AccountGroup title="Investments" total={investTotal} open={investOpen} onToggle={() => setInvestOpen(o => !o)} items={investAccounts} onAdd={() => setAddOpen(true)} />
      </div>

      <BottomNav onAddPress={() => setAddTxOpen(true)} />
      <MenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} onSettingsOpen={() => setSettingsOpen(true)} />
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <AccountSheet open={addOpen} onClose={() => setAddOpen(false)} />
      <AccountSheet open={editOpen} onClose={() => setEditOpen(false)} editAccount={selectedAccount} />
      <AccountInfoSheet open={infoOpen} onClose={() => setInfoOpen(false)} account={selectedAccount}
        onEdit={(a) => { setSelectedAccount(a); setEditOpen(true); }} />
      <TransactionSheet open={addTxOpen} onClose={() => setAddTxOpen(false)} />
    </div>
  );
}
