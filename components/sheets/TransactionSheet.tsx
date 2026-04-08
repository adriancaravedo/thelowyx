"use client";
import { useState, useEffect } from "react";
import Sheet from "@/components/ui/Sheet";
import Toggle from "@/components/ui/Toggle";
import Badge from "@/components/ui/Badge";
import { useApp, Transaction, TransactionType } from "@/store/AppContext";

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
  const [status, setStatus] = useState<"paid" | "not_paid" | "received" | "not_received">("paid");
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
      setStatus(editTransaction.status);
    } else {
      setType("Expense");
      setName("");
      setAmount("");
      setDate(new Date().toISOString().split("T")[0]);
      setCategoryId("");
      setAccountId(accounts[0]?.id || "");
      setStatus("paid"); // default = paid so it shows in list
    }
    setShowCategoryPicker(false);
    setShowAccountPicker(false);
  }, [editTransaction, open, accounts]);

  // When type changes, update status to match
  const handleTypeChange = (v: string) => {
    const t = v as "Income" | "Expense";
    setType(t);
    setCategoryId("");
    setStatus(t === "Income" ? "received" : "paid");
  };

  const isPaid = status === "paid" || status === "received";

  const toggleStatus = (paid: boolean) => {
    if (type === "Income") setStatus(paid ? "received" : "not_received");
    else setStatus(paid ? "paid" : "not_paid");
  };

  const handleSubmit = async () => {
    if (!name || !amount || !accountId) return;
    const txType: TransactionType = type === "Income" ? "income" : "expense";
    const data = {
      name, amount: parseFloat(amount), date, type: txType,
      categoryId: categoryId || filteredCats[0]?.id || "",
      accountId, status,
    };
    if (editTransaction) await updateTransaction(editTransaction.id, data);
    else await addTransaction(data);
    onClose();
  };

  const inputClass = "w-full text-center text-gray-400 text-sm border-b border-gray-100 pb-1 focus:outline-none focus:border-blue-400 bg-transparent";

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
        <Toggle options={["Income", "Expense"]} value={type} onChange={handleTypeChange} />
      </div>

      <div className="mb-4 text-center">
        <div className="text-sm font-semibold text-gray-800 mb-1">Name</div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Transaction name" className={inputClass} />
      </div>

      <div className="mb-4 text-center">
        <div className="text-sm font-semibold text-gray-800 mb-1">Amount</div>
        <input type="number" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} placeholder="$0.00" className={inputClass} />
      </div>

      <div className="mb-4 text-center">
        <div className="text-sm font-semibold text-gray-800 mb-1">Date</div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
      </div>

      <div className="mb-4 text-center">
        <div className="text-sm font-semibold text-gray-800 mb-1">Category</div>
        <button onClick={() => setShowCategoryPicker(true)} className="inline-block">
          {selectedCat
            ? <Badge label={selectedCat.name} color={selectedCat.color} size="sm" />
            : <span className="text-gray-400 text-sm border-b border-gray-100 pb-1">Select category</span>
          }
        </button>
      </div>

      <div className="mb-5 text-center">
        <div className="text-sm font-semibold text-gray-800 mb-1">Account</div>
        <button onClick={() => setShowAccountPicker(true)}>
          <span className="text-gray-400 text-sm border-b border-gray-100 pb-1">
            {selectedAcc ? `${selectedAcc.name} ${selectedAcc.last4}` : "Select account"}
          </span>
        </button>
      </div>

      {/* Status toggle */}
      <div className="flex justify-center gap-3 mb-6">
        <button onClick={() => toggleStatus(true)}
          className={`px-5 py-2 rounded-full border text-sm font-medium transition-all ${isPaid ? "border-gray-800 text-gray-800" : "border-gray-200 text-gray-400"}`}>
          {type === "Income" ? "Received" : "Paid"}
        </button>
        <button onClick={() => toggleStatus(false)}
          className={`px-5 py-2 rounded-full border text-sm font-medium transition-all ${!isPaid ? "border-gray-800 text-gray-800" : "border-gray-200 text-gray-400"}`}>
          {type === "Income" ? "Not Received" : "Not Paid"}
        </button>
      </div>

      <button onClick={handleSubmit} disabled={!name || !amount || !accountId}
        className="w-full py-3.5 bg-gray-100 rounded-2xl text-gray-800 font-semibold text-sm disabled:opacity-40">
        {editTransaction ? "Save changes" : "Add transaction"}
      </button>
    </Sheet>
  );
}
