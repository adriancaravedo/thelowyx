"use client";
import Sheet from "@/components/ui/Sheet";
import AccountCard from "@/components/ui/AccountCard";
import Badge from "@/components/ui/Badge";
import { useApp, Transaction } from "@/store/AppContext";
import { formatCurrency, formatDateLong } from "@/lib/utils";

interface TransactionInfoSheetProps {
  open: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onEdit: (t: Transaction) => void;
}

export default function TransactionInfoSheet({ open, onClose, transaction, onEdit }: TransactionInfoSheetProps) {
  const { deleteTransaction, accounts, categories } = useApp();
  if (!transaction) return null;

  const account = accounts.find(a => a.id === transaction.accountId);
  const category = categories.find(c => c.id === transaction.categoryId);
  const dateLabel = (() => {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    if (transaction.date === today) return "Today";
    if (transaction.date === yesterday) return "Yesterday";
    return formatDateLong(transaction.date);
  })();

  const handleDelete = () => {
    deleteTransaction(transaction.id);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="text-center text-sm text-gray-400 mb-4">{dateLabel}</div>

      <div className="text-center mb-1">
        <div className="text-lg font-bold text-gray-900">{transaction.name}</div>
        <div className={`text-2xl font-bold mt-1 ${transaction.type === "income" ? "text-gray-900" : "text-gray-900"}`}>
          {transaction.type === "expense" ? "-" : "+"}{formatCurrency(transaction.amount)}
        </div>
      </div>

      {category && (
        <div className="flex justify-center mt-2 mb-5">
          <Badge label={category.name} color={category.color} size="sm" />
        </div>
      )}

      {account && (
        <div className="flex justify-center mb-6">
          <AccountCard account={account} size="md" />
        </div>
      )}

      <button
        onClick={() => { onClose(); setTimeout(() => onEdit(transaction), 150); }}
        className="w-full py-3.5 bg-gray-100 rounded-2xl text-gray-800 font-semibold text-sm mb-3"
      >
        Edit transaction
      </button>
      <button onClick={handleDelete} className="w-full py-2 text-red-500 font-semibold text-sm">
        Delete transaction
      </button>
    </Sheet>
  );
}
