"use client";
import { useState, useEffect } from "react";
import Sheet from "@/components/ui/Sheet";
import Toggle from "@/components/ui/Toggle";
import Badge from "@/components/ui/Badge";
import { useApp, Transaction, TransactionType, TransactionStatus } from "@/store/AppContext";
import { formatDateLong } from "@/lib/utils";

interface TransactionSheetProps {
  open: boolean;
  onClose: () => void;
  editTransaction?: Transaction | null;
}

export default function TransactionSheet({ open, onClose, editTransaction }: TransactionSheetProps) {
  const { addTransaction, updateTransaction, categories, accounts } = useApp();
  const [type, setType] = useState<"Income" | "Expense">("Expense");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [status, setStatus] = useState<"left" | "right">("left"); // left = Paid/Received, right = Not Paid/Not Received
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);

  const filteredCats = categories.filter(c => c.type === (type === "Income" ? "income" : "expense"));
  const selectedCat = categories.find(c => c.id === categoryId);
  const selectedAcc = accounts.find(a => a.id === accountId);

  useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type === "income" ? "Income" : "Expense");
      setName(editTransaction.name);
      setAmount(editTransaction.amount.toString());
      setDate(editTransaction.date);
      setCategoryId(editTransaction.categoryId);
      setAccountId(editTransaction.accountId);
      setStatus(editTransaction.status === "paid" || editTransaction.status === "received" ? "left" : "right");
    } else {
      setType("Expense");
      setName("");
      setAmount("");
      setDate(new Date().toISOString().split("T")[0]);
      setCategoryId("");
      setAccountId(accounts[0]?.id || "");
      setStatus("right");
    }
    setShowCategoryPicker(false);
    setShowAccountPicker(false);
  }, [editTransaction, open, accounts]);

  const getStatus = (): TransactionStatus => {
    if (type === "Income") return status === "left" ? "received" : "not_received";
    return status === "left" ? "paid" : "not_paid";
  };

  const handleSubmit = () => {
    if (!name || !amount || !accountId) return;
    const txType: TransactionType = type === "Income" ? "income" : "expense";
    const data = {
      name, amount: parseFloat(amount), date, type: txType,
      categoryId: categoryId || filteredCats[0]?.id || "",
      accountId, status: getStatus(),
    };
    if (editTransaction) updateTransaction(editTransaction.id, data);
    else addTransaction(data);
    onClose();
  };

  const fieldRow = (label: string, content: React.ReactNode) => (
    <div className="mb-5 text-center">
      <div className="text-sm font-semibold text-gray-800 mb-1">{label}</div>
      {content}
    </div>
  );

  if (showCategoryPicker) {
    return (
      <Sheet open={open} onClose={onClose}>
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => setShowCategoryPicker(false)} className="text-sm text-blue-500 font-medium">← Back</button>
          <span className="font-semibold">Select Category</span>
        </div>
        <div className="space-y-1">
          {filteredCats.map(cat => (
            <button key={cat.id} onClick={() => { setCategoryId(cat.id); setShowCategoryPicker(false); }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl ${categoryId === cat.id ? "bg-gray-100" : "hover:bg-gray-50"}`}>
              <span className="text-xl">{cat.emoji}</span>
              <span className="text-sm font-medium text-gray-800">{cat.name}</span>
            </button>
          ))}
        </div>
      </Sheet>
    );
  }

  if (showAccountPicker) {
    return (
      <Sheet open={open} onClose={onClose}>
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => setShowAccountPicker(false)} className="text-sm text-blue-500 font-medium">← Back</button>
          <span className="font-semibold">Select Account</span>
        </div>
        <div className="space-y-1">
          {accounts.map(acc => (
            <button key={acc.id} onClick={() => { setAccountId(acc.id); setShowAccountPicker(false); }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl ${accountId === acc.id ? "bg-gray-100" : "hover:bg-gray-50"}`}>
              <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ backgroundColor: acc.color }} />
              <div className="text-left">
                <div className="text-sm font-medium text-gray-800">{acc.name}</div>
                <div className="text-xs text-gray-400">•••• {acc.last4}</div>
              </div>
            </button>
          ))}
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="mb-5">
        <Toggle options={["Income", "Expense"]} value={type} onChange={v => { setType(v as "Income" | "Expense"); setCategoryId(""); }} />
      </div>

      {fieldRow("Name",
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Transaction name"
          className="w-full text-center text-gray-400 text-sm border-0 border-b border-gray-100 pb-1 focus:outline-none focus:border-blue-400 bg-transparent" />
      )}

      {fieldRow("Amount",
        <input type="number" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} placeholder="$0.00"
          className="w-full text-center text-gray-400 text-sm border-0 border-b border-gray-100 pb-1 focus:outline-none focus:border-blue-400 bg-transparent" />
      )}

      {fieldRow("Date",
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="w-full text-center text-gray-400 text-sm border-0 border-b border-gray-100 pb-1 focus:outline-none focus:border-blue-400 bg-transparent" />
      )}

      {fieldRow("Category",
        <button onClick={() => setShowCategoryPicker(true)} className="inline-block">
          {selectedCat
            ? <Badge label={selectedCat.name} color={selectedCat.color} size="sm" />
            : <span className="text-gray-400 text-sm border-b border-gray-100 pb-1">Select category</span>
          }
        </button>
      )}

      {fieldRow("Account",
        <button onClick={() => setShowAccountPicker(true)}>
          <span className="text-gray-400 text-sm border-b border-gray-100 pb-1">
            {selectedAcc ? `${selectedAcc.name} ${selectedAcc.last4}` : "Select account"}
          </span>
        </button>
      )}

      {/* Status toggle */}
      <div className="flex justify-center gap-3 mb-6">
        <button
          onClick={() => setStatus("left")}
          className={`px-5 py-2 rounded-full border text-sm font-medium transition-all ${status === "left" ? "border-gray-800 text-gray-800" : "border-gray-200 text-gray-400"}`}
        >
          {type === "Income" ? "Received" : "Paid"}
        </button>
        <button
          onClick={() => setStatus("right")}
          className={`px-5 py-2 rounded-full border text-sm font-medium transition-all ${status === "right" ? "border-gray-800 text-gray-800" : "border-gray-200 text-gray-400"}`}
        >
          {type === "Income" ? "Not Received" : "Not Paid"}
        </button>
      </div>

      <button onClick={handleSubmit} className="w-full py-3.5 bg-gray-100 rounded-2xl text-gray-800 font-semibold text-sm">
        {editTransaction ? "Save changes" : "Add transaction"}
      </button>
    </Sheet>
  );
}
