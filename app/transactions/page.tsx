"use client";
import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useApp, Transaction } from "@/store/AppContext";
import Header from "@/components/ui/Header";
import BottomNav from "@/components/ui/BottomNav";
import Badge from "@/components/ui/Badge";
import MenuSheet from "@/components/sheets/MenuSheet";
import SettingsSheet from "@/components/sheets/SettingsSheet";
import TransactionSheet from "@/components/sheets/TransactionSheet";
import TransactionInfoSheet from "@/components/sheets/TransactionInfoSheet";
import { formatCurrency, groupTransactionsByDate, isUpcoming, getMonthlyIncomeSpend, getMonthKey } from "@/lib/utils";

export default function TransactionsPage() {
  const { transactions, categories } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [search, setSearch] = useState("");

  const upcoming = transactions.filter(t => isUpcoming(t.date));
  const groups = groupTransactionsByDate(transactions);

  const filtered = search
    ? groups.map(g => ({ ...g, transactions: g.transactions.filter(t => t.name.toLowerCase().includes(search.toLowerCase())) })).filter(g => g.transactions.length > 0 || g.isSummary)
    : groups;

  const getCat = (id: string) => categories.find(c => c.id === id);

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <Header title="Transactions" onMenuOpen={() => setMenuOpen(true)} />

      {/* Search bar */}
      <div className="px-4 pt-3 pb-2 flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5 shadow-sm">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search" className="flex-1 text-sm bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-300"
          />
        </div>
        <button className="bg-white rounded-2xl px-3 shadow-sm flex items-center">
          <SlidersHorizontal size={16} className="text-gray-400" />
        </button>
        <button onClick={() => setAddOpen(true)} className="bg-white rounded-2xl px-4 shadow-sm flex items-center">
          <span className="text-sm font-bold text-gray-800">Add</span>
        </button>
      </div>

      <div className="px-4 space-y-3">
        {/* Upcoming */}
        {upcoming.length > 0 && (
          <div className="bg-gray-100 rounded-2xl p-4">
            <div className="text-xs text-gray-400 font-medium mb-2">Upcoming</div>
            <div className="space-y-2">
              {upcoming.map(tx => {
                const cat = getCat(tx.categoryId);
                return (
                  <div key={tx.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800">{tx.name}</span>
                      {cat && <Badge label={cat.name} color={cat.color} />}
                      {tx.recurring && <Badge label="Recurring" color="#6b7280" />}
                    </div>
                    <span className={`text-sm font-semibold font-mono ${tx.type === "income" ? "text-green-600" : "text-red-500"}`}>
                      {tx.type === "income" ? "" : "-"}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Grouped transactions */}
        {filtered.map((group, idx) => {
          if (group.isSummary && group.monthKey) {
            const { income, spend } = getMonthlyIncomeSpend(transactions, group.monthKey);
            return (
              <div key={`summary-${idx}`} className="bg-white rounded-2xl p-4 text-center">
                <div className="text-sm font-bold text-gray-800 mb-3">{group.label}</div>
                <div className="flex justify-around">
                  <div>
                    <div className="text-base font-bold text-green-500 font-mono">{formatCurrency(income)}</div>
                    <div className="text-xs text-gray-400">Total Income</div>
                  </div>
                  <div>
                    <div className="text-base font-bold text-red-500 font-mono">{formatCurrency(spend)}</div>
                    <div className="text-xs text-gray-400">Total Spent</div>
                  </div>
                  <div>
                    <div className="text-base font-bold text-gray-900 font-mono">{formatCurrency(income - spend)}</div>
                    <div className="text-xs text-gray-400">Savings</div>
                  </div>
                </div>
              </div>
            );
          }

          if (group.transactions.length === 0) return null;

          return (
            <div key={`group-${idx}`} className="bg-white rounded-2xl overflow-hidden">
              <div className="px-4 pt-3 pb-1">
                <span className="text-xs text-gray-400 font-medium">{group.label}</span>
              </div>
              <div>
                {group.transactions.map((tx, ti) => {
                  const cat = getCat(tx.categoryId);
                  return (
                    <button
                      key={tx.id}
                      onClick={() => { setSelected(tx); setInfoOpen(true); }}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 ${ti < group.transactions.length - 1 ? "border-b border-gray-50" : ""}`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-800 truncate">{tx.name}</span>
                        {cat && <Badge label={cat.name} color={cat.color} />}
                        {tx.recurring && <Badge label="Recurring" color="#6b7280" />}
                      </div>
                      <span className={`text-sm font-semibold font-mono flex-shrink-0 ml-2 ${tx.type === "income" ? "text-gray-900" : "text-gray-900"}`}>
                        {tx.type === "income" ? "" : "-"}{formatCurrency(tx.amount)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <BottomNav onAddPress={() => setAddOpen(true)} />
      <MenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} onSettingsOpen={() => setSettingsOpen(true)} />
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <TransactionSheet open={addOpen} onClose={() => setAddOpen(false)} />
      <TransactionSheet open={editOpen} onClose={() => setEditOpen(false)} editTransaction={selected} />
      <TransactionInfoSheet open={infoOpen} onClose={() => setInfoOpen(false)} transaction={selected}
        onEdit={(t) => { setSelected(t); setEditOpen(true); }} />
    </div>
  );
}
