"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import { useApp, Category } from "@/store/AppContext";
import Header from "@/components/ui/Header";
import BottomNav from "@/components/ui/BottomNav";
import MenuSheet from "@/components/sheets/MenuSheet";
import SettingsSheet from "@/components/sheets/SettingsSheet";
import CategorySheet from "@/components/sheets/CategorySheet";
import CategoryInfoSheet from "@/components/sheets/CategoryInfoSheet";
import TransactionSheet from "@/components/sheets/TransactionSheet";

export default function CategoriesPage() {
  const { categories } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addTxOpen, setAddTxOpen] = useState(false);
  const [selected, setSelected] = useState<Category | null>(null);
  const [search, setSearch] = useState("");

  const incomeCategories = categories.filter(c => c.type === "income" && c.name.toLowerCase().includes(search.toLowerCase()));
  const expenseCategories = categories.filter(c => c.type === "expense" && c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <Header title="Categories" onMenuOpen={() => setMenuOpen(true)} />

      <div className="px-4 pt-3 pb-2 flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5 shadow-sm">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search"
            className="flex-1 text-sm bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-300" />
        </div>
        <button onClick={() => setAddOpen(true)} className="bg-white rounded-2xl px-4 shadow-sm flex items-center">
          <span className="text-sm font-bold text-gray-800">Add</span>
        </button>
      </div>

      <div className="px-4 space-y-3">
        {incomeCategories.length > 0 && (
          <div className="bg-white rounded-2xl overflow-hidden">
            <div className="px-4 pt-3 pb-1 flex items-center gap-2">
              <span className="text-xs text-gray-500">▼</span>
              <span className="text-sm font-semibold text-gray-500">Income</span>
            </div>
            {incomeCategories.map((cat, i) => (
              <button key={cat.id} onClick={() => { setSelected(cat); setInfoOpen(true); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 ${i < incomeCategories.length - 1 ? "border-b border-gray-50" : ""}`}>
                <span className="text-lg">{cat.emoji}</span>
                <span className="text-sm font-medium text-gray-800">{cat.name}</span>
                <div className="ml-auto w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
              </button>
            ))}
          </div>
        )}

        {expenseCategories.length > 0 && (
          <div className="bg-white rounded-2xl overflow-hidden">
            <div className="px-4 pt-3 pb-1 flex items-center gap-2">
              <span className="text-xs text-gray-500">▼</span>
              <span className="text-sm font-semibold text-gray-500">Expenses</span>
            </div>
            {expenseCategories.map((cat, i) => (
              <button key={cat.id} onClick={() => { setSelected(cat); setInfoOpen(true); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 ${i < expenseCategories.length - 1 ? "border-b border-gray-50" : ""}`}>
                <span className="text-lg">{cat.emoji}</span>
                <span className="text-sm font-medium text-gray-800">{cat.name}</span>
                <div className="ml-auto w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomNav onAddPress={() => setAddTxOpen(true)} />
      <MenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} onSettingsOpen={() => setSettingsOpen(true)} />
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <CategorySheet open={addOpen} onClose={() => setAddOpen(false)} />
      <CategorySheet open={editOpen} onClose={() => setEditOpen(false)} editCategory={selected} />
      <CategoryInfoSheet open={infoOpen} onClose={() => setInfoOpen(false)} category={selected}
        onEdit={(c) => { setSelected(c); setEditOpen(true); }} />
      <TransactionSheet open={addTxOpen} onClose={() => setAddTxOpen(false)} />
    </div>
  );
}
