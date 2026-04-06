"use client";
import { useState } from "react";
import Sheet from "@/components/ui/Sheet";
import Sparkline from "@/components/ui/Sparkline";
import RangeSelector from "@/components/ui/RangeSelector";
import { useApp, Category } from "@/store/AppContext";
import { formatCurrency, TimeRange, filterHistoryByRange } from "@/lib/utils";

interface CategoryInfoSheetProps {
  open: boolean;
  onClose: () => void;
  category: Category | null;
  onEdit: (c: Category) => void;
}

export default function CategoryInfoSheet({ open, onClose, category, onEdit }: CategoryInfoSheetProps) {
  const { deleteCategory, transactions } = useApp();
  const [range, setRange] = useState<TimeRange>("1M");

  if (!category) return null;

  // Build history from transactions
  const catTxs = transactions.filter(t =>
    t.categoryId === category.id && (t.status === "paid" || t.status === "received")
  );

  // Build cumulative history by date
  const dateMap = new Map<string, number>();
  catTxs.forEach(t => {
    dateMap.set(t.date, (dateMap.get(t.date) || 0) + t.amount);
  });
  let cumulative = 0;
  const history = Array.from(dateMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, amt]) => { cumulative += amt; return { date, balance: parseFloat(cumulative.toFixed(2)) }; });

  const total = catTxs.reduce((s, t) => s + t.amount, 0);
  const label = category.type === "income" ? "Earned" : "Spent";

  const handleDelete = () => {
    deleteCategory(category.id);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="text-center text-xs text-gray-400 mb-2">Category</div>
      <div className="text-center mb-4">
        <div className="text-2xl mb-1">{category.emoji}</div>
        <div className="text-lg font-bold">{category.name}</div>
        <div className="text-xs text-gray-400 mt-1">{label}</div>
        <div className="text-xl font-bold">{formatCurrency(total)}</div>
      </div>

      {history.length >= 2 ? (
        <Sparkline history={history} range={range} color={category.color} height={130} />
      ) : (
        <div className="h-32 flex items-center justify-center text-gray-300 text-sm">No data yet</div>
      )}

      <div className="mt-2 mb-6">
        <RangeSelector value={range} onChange={setRange} />
      </div>

      <button
        onClick={() => { onClose(); setTimeout(() => onEdit(category), 150); }}
        className="w-full py-3.5 bg-gray-100 rounded-2xl text-gray-800 font-semibold text-sm mb-3"
      >
        Edit category
      </button>
      <button onClick={handleDelete} className="w-full py-2 text-red-500 font-semibold text-sm">
        Delete category
      </button>
    </Sheet>
  );
}
