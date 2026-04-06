"use client";
import { useState, useEffect } from "react";
import Sheet from "@/components/ui/Sheet";
import Toggle from "@/components/ui/Toggle";
import ColorPicker from "@/components/ui/ColorPicker";
import { useApp, Account, AccountType } from "@/store/AppContext";

interface AccountSheetProps {
  open: boolean;
  onClose: () => void;
  editAccount?: Account | null;
}

export default function AccountSheet({ open, onClose, editAccount }: AccountSheetProps) {
  const { addAccount, updateAccount } = useApp();
  const [type, setType] = useState<"Credit Card" | "Debit Card">("Credit Card");
  const [name, setName] = useState("");
  const [last4, setLast4] = useState("");
  const [balance, setBalance] = useState("");
  const [limit, setLimit] = useState("");
  const [color, setColor] = useState("#3b82f6");

  useEffect(() => {
    if (editAccount) {
      setType(editAccount.type === "credit" ? "Credit Card" : "Debit Card");
      setName(editAccount.name);
      setLast4(editAccount.last4);
      setBalance(editAccount.balance.toString());
      setLimit(editAccount.limit?.toString() || "");
      setColor(editAccount.color);
    } else {
      setType("Credit Card");
      setName("");
      setLast4("");
      setBalance("");
      setLimit("");
      setColor("#3b82f6");
    }
  }, [editAccount, open]);

  const accountType: AccountType = type === "Credit Card" ? "credit" : "debit";

  const handleSubmit = () => {
    if (!name || !last4 || !balance) return;
    const data = {
      name, last4, balance: parseFloat(balance),
      type: accountType, color,
      ...(accountType === "credit" && limit ? { limit: parseFloat(limit) } : {}),
      createdAt: editAccount?.createdAt || new Date().toISOString(),
    };
    if (editAccount) updateAccount(editAccount.id, data);
    else addAccount(data);
    onClose();
  };

  const field = (label: string, value: string, onChange: (v: string) => void, opts?: { numeric?: boolean; placeholder?: string; maxLength?: number }) => (
    <div className="mb-5">
      <div className="text-sm font-semibold text-gray-800 text-center mb-1">{label}</div>
      <input
        type={opts?.numeric ? "number" : "text"}
        inputMode={opts?.numeric ? "decimal" : undefined}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={opts?.placeholder}
        maxLength={opts?.maxLength}
        className="w-full text-center text-gray-400 text-sm border-0 border-b border-gray-100 pb-1 focus:outline-none focus:border-blue-400 bg-transparent"
      />
    </div>
  );

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="mb-5">
        <Toggle options={["Credit Card", "Debit Card"]} value={type} onChange={v => setType(v as "Credit Card" | "Debit Card")} />
      </div>

      {field("Institution Name", name, setName, { placeholder: "Chase Bank" })}
      {field("Last 4 digits", last4, setLast4, { placeholder: "1234", maxLength: 4 })}

      {accountType === "credit" ? (
        <div className="flex gap-6 mb-5">
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-800 text-center mb-1">Balance</div>
            <input type="number" inputMode="decimal" value={balance} onChange={e => setBalance(e.target.value)}
              placeholder="$0.00" className="w-full text-center text-gray-400 text-sm border-0 border-b border-gray-100 pb-1 focus:outline-none focus:border-blue-400 bg-transparent" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-800 text-center mb-1">Limit</div>
            <input type="number" inputMode="decimal" value={limit} onChange={e => setLimit(e.target.value)}
              placeholder="$0.00" className="w-full text-center text-gray-400 text-sm border-0 border-b border-gray-100 pb-1 focus:outline-none focus:border-blue-400 bg-transparent" />
          </div>
        </div>
      ) : (
        field("Balance", balance, setBalance, { numeric: true, placeholder: "$0.00" })
      )}

      <div className="mb-6">
        <ColorPicker value={color} onChange={setColor} />
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-3.5 bg-gray-100 rounded-2xl text-gray-800 font-semibold text-sm"
      >
        {editAccount ? "Save changes" : "Add account"}
      </button>
    </Sheet>
  );
}
