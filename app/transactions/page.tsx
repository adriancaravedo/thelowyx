"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { useApp, Transaction } from "@/store/AppContext";
import { useAuth } from "@/store/AuthContext";
import Header from "@/components/ui/Header";
import BottomNav from "@/components/ui/BottomNav";
import Badge from "@/components/ui/Badge";
import MenuSheet from "@/components/sheets/MenuSheet";
import TransactionSheet from "@/components/sheets/TransactionSheet";
import TransactionInfoSheet from "@/components/sheets/TransactionInfoSheet";
import { formatCurrency, getMonthlyIncomeSpend, getMonthKey, getMonthLabel, getCurrentMonthKey } from "@/lib/utils";

const MONO = { fontFamily: "var(--font-geist-mono)" };

function groupByDate(transactions: Transaction[]) {
  const todayStr = new Date().toISOString().split("T")[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const currentMk = getCurrentMonthKey();

  // Only paid/received go in the list
  const paid = transactions.filter(t => t.status === "paid" || t.status === "received");
  const sorted = [...paid].sort((a, b) => b.date.localeCompare(a.date));

  const groups: { label: string; monthKey?: string; transactions: Transaction[]; isSummary?: boolean }[] = [];
  const monthsSeen = new Set<string>();
  const dateMap = new Map<string, Transaction[]>();

  sorted.forEach(t => {
    if (!dateMap.has(t.date)) dateMap.set(t.date, []);
    dateMap.get(t.date)!.push(t);
  });

  Array.from(dateMap.keys()).sort((a, b) => b.localeCompare(a)).forEach(date => {
    const mk = getMonthKey(date);
    if (!monthsSeen.has(mk)) {
      if (mk !== currentMk) {
        const label = new Date(date + "T12:00:00").toLocaleDateString("en-US", { month: "long", year: "numeric" });
        groups.push({ label, monthKey: mk, transactions: [], isSummary: true });
      }
      monthsSeen.add(mk);
    }
    let label = date;
    if (date === todayStr) label = "Today";
    else if (date === yesterdayStr) label = "Yesterday";
    else label = new Date(date + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    groups.push({ label, transactions: dateMap.get(date)! });
  });

  return groups;
}

export default function TransactionsPage() {
  const { transactions, categories } = useApp();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  // Upcoming = not_paid or not_received only
  const upcoming = transactions.filter(t => t.status === "not_paid" || t.status === "not_received");
  const groups = groupByDate(transactions);

  // Search filters only paid transactions, no summaries
  const searchFiltered = search
    ? groups
        .filter(g => !g.isSummary)
        .map(g => ({ ...g, transactions: g.transactions.filter(t => t.name.toLowerCase().includes(search.toLowerCase())) }))
        .filter(g => g.transactions.length > 0)
    : groups;

  const getCat = (id: string) => categories.find(c => c.id === id);

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <Header title="Transactions" onMenuOpen={() => setMenuOpen(true)} />

      <div className="px-4 pt-3 pb-2 flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5 shadow-sm">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search"
            className="flex-1 text-sm bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-300" />
        </div>
        <button className="bg-white rounded-2xl px-3 shadow-sm flex items-center">
          <SlidersHorizontal size={16} className="text-gray-400" />
        </button>
        <button onClick={() => setAddOpen(true)} className="bg-white rounded-2xl px-4 shadow-sm flex items-center">
          <span className="text-sm font-bold text-gray-800">Add</span>
        </button>
      </div>

      <div className="px-4 space-y-3">
        {/* Upcoming — not_paid / not_received only, hidden during search */}
        {!search && upcoming.length > 0 && (
          <div className="bg-gray-100 rounded-2xl p-4">
            <div className="text-xs text-gray-400 font-medium mb-2">Upcoming</div>
            <div className="space-y-2">
              {upcoming.map(tx => {
                const cat = getCat(tx.categoryId);
                return (
                  <button key={tx.id} onClick={() => { setSelected(tx); setInfoOpen(true); }}
                    className="flex items-center justify-between w-full text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-800">{tx.name}</span>
                      {cat && <Badge label={cat.name} color={cat.color} />}
                      {tx.recurring && <Badge label="Recurring" color="#6b7280" />}
                    </div>
                    <span className={`text-sm font-semibold flex-shrink-0 ml-2 ${tx.type === "income" ? "text-green-600" : "text-red-500"}`} style={MONO}>
                      {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Grouped paid transactions */}
        {searchFiltered.map((group, idx) => {
          // Monthly summary separator — not shown during search
          if (group.isSummary && group.monthKey && !search) {
            const { income, spend } = getMonthlyIncomeSpend(transactions, group.monthKey);
            return (
              <div key={`summary-${idx}`} className="bg-white rounded-2xl p-4 text-center">
                <div className="text-sm font-bold text-gray-800 mb-3">{group.label}</div>
                <div className="flex justify-around">
                  <div>
                    <div className="text-base font-bold text-green-500" style={MONO}>{formatCurrency(income)}</div>
                    <div className="text-xs text-gray-400">Total Income</div>
                  </div>
                  <div>
                    <div className="text-base font-bold text-red-500" style={MONO}>{formatCurrency(spend)}</div>
                    <div className="text-xs text-gray-400">Total Spent</div>
                  </div>
                  <div>
                    <div className="text-base font-bold text-gray-900" style={MONO}>{formatCurrency(income - spend)}</div>
                    <div className="text-xs text-gray-400">Savings</div>
                  </div>
                </div>
              </div>
            );
          }

          if (group.isSummary || group.transactions.length === 0) return null;

          return (
            <div key={`group-${idx}`} className="bg-white rounded-2xl overflow-hidden">
              <div className="px-4 pt-3 pb-1">
                <span className="text-xs text-gray-400 font-medium">{group.label}</span>
              </div>
              {group.transactions.map((tx, ti) => {
                const cat = getCat(tx.categoryId);
                return (
                  <button key={tx.id} onClick={() => { setSelected(tx); setInfoOpen(true); }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 ${ti < group.transactions.length - 1 ? "border-b border-gray-50" : ""}`}>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-800 truncate">{tx.name}</span>
                      {cat && <Badge label={cat.name} color={cat.color} />}
                      {tx.recurring && <Badge label="Recurring" color="#6b7280" />}
                    </div>
                    <span className="text-sm font-semibold flex-shrink-0 ml-2 text-gray-900" style={MONO}>
                      {tx.type === "income" ? "" : "-"}{formatCurrency(tx.amount)}
                    </span>
                  </button>
                );
              })}
            </div>
          );
        })}

        {searchFiltered.filter(g => !g.isSummary && g.transactions.length > 0).length === 0 && !upcoming.length && (
          <div className="text-center py-16 text-gray-300 text-sm">No transactions yet</div>
        )}
      </div>

      <BottomNav onAddPress={() => setAddOpen(true)} />
      <MenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} />
      <TransactionSheet open={addOpen} onClose={() => setAddOpen(false)} />
      <TransactionSheet open={editOpen} onClose={() => setEditOpen(false)} editTransaction={selected} />
      <TransactionInfoSheet open={infoOpen} onClose={() => setInfoOpen(false)} transaction={selected}
        onEdit={(t) => { setSelected(t); setInfoOpen(false); setTimeout(() => setEditOpen(true), 150); }} />
    </div>
  );
}
