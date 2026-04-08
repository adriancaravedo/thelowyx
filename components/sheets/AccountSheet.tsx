"use client";
import { useState, useEffect } from "react";
import Sheet from "@/components/ui/Sheet";
import ColorPicker from "@/components/ui/ColorPicker";
import { useApp, Account, AccountType } from "@/store/AppContext";

type TabType = "Debit Card" | "Credit Card" | "Investments" | "Real State" | "Loans" | "Others";

interface AccountSheetProps {
  open: boolean;
  onClose: () => void;
  editAccount?: Account | null;
  defaultType?: TabType;
}

const TABS: TabType[] = ["Debit Card", "Credit Card", "Investments", "Real State", "Loans", "Others"];

const TAB_TO_TYPE: Record<TabType, AccountType> = {
  "Debit Card": "debit", "Credit Card": "credit", "Investments": "investment",
  "Real State": "real_estate", "Loans": "loan", "Others": "other",
};

export default function AccountSheet({ open, onClose, editAccount, defaultType }: AccountSheetProps) {
  const { addAccount, updateAccount } = useApp();
  const [tab, setTab] = useState<TabType>(defaultType || "Debit Card");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [last4, setLast4] = useState("");
  const [balance, setBalance] = useState("");
  const [limit, setLimit] = useState("");
  const [color, setColor] = useState("#3b82f6");

  useEffect(() => {
    if (editAccount) {
      const t = Object.entries(TAB_TO_TYPE).find(([, v]) => v === editAccount.type)?.[0] as TabType || "Debit Card";
      setTab(t);
      setName(editAccount.name);
      setDescription(editAccount.description || "");
      setLast4(editAccount.last4);
      setBalance(editAccount.balance.toString());
      setLimit(editAccount.limit?.toString() || "");
      setColor(editAccount.color);
    } else {
      setTab(defaultType || "Debit Card");
      setName(""); setDescription(""); setLast4(""); setBalance(""); setLimit(""); setColor("#3b82f6");
    }
  }, [editAccount, open, defaultType]);

  const accountType = TAB_TO_TYPE[tab];

  // Live preview card using a fake Account object
  const previewAccount: Account = {
    id: "preview", name: name || "Account Name", type: accountType,
    description: description || tab, last4: last4 || "----",
    balance: parseFloat(balance) || 0, color,
    createdAt: "", history: [],
  };

  const balanceLabel = tab === "Real State" ? "Estimated value" : tab === "Others" ? "Current" : tab === "Loans" ? "Current" : "Balance";
  const nameLabel = tab === "Others" ? "Where do you have it?" : "Institution Name";
  const namePlaceholder = tab === "Others" ? "Under my bed" : tab === "Real State" ? "Home Brooklyn" : "Chase Bank";

  const handleSubmit = async () => {
    if (!name || !balance) return;
    const data = {
      name, description, last4, balance: parseFloat(balance),
      type: accountType, color,
      ...(tab === "Credit Card" && limit ? { limit: parseFloat(limit) } : {}),
      createdAt: editAccount?.createdAt || new Date().toISOString(),
    };
    if (editAccount) await updateAccount(editAccount.id, data);
    else await addAccount(data);
    onClose();
  };

  const inputClass = "w-full text-center text-gray-400 text-sm border-b border-gray-100 pb-1 focus:outline-none focus:border-blue-400 bg-transparent";

  return (
    <Sheet open={open} onClose={onClose}>
      {/* Title */}
      <div className="text-center text-sm text-gray-400 mb-4">{tab}</div>

      {/* Tab selector — horizontal scroll */}
      {!editAccount && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all ${
                tab === t ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"
              }`}>
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Live preview card */}
      <div className="flex justify-center mb-5">
        <div className="rounded-2xl p-4 w-56 h-32 flex flex-col justify-between relative overflow-hidden" style={{ backgroundColor: color }}>
          <div className="absolute inset-0 opacity-10" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 60%)" }} />
          <div className="text-white font-bold text-base">{name || "Account Name"}</div>
          <div className="flex justify-between items-end">
            <div className="text-white/70 text-xs">{description || tab}</div>
            <div className="text-white/90 text-xs font-mono">{last4 ? `•••• ${last4}` : "•••• ----"}</div>
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="mb-4 text-center">
        <div className="text-sm font-semibold text-gray-800 mb-1">{nameLabel}</div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder={namePlaceholder} className={inputClass} />
      </div>

      {tab !== "Others" && (
        <div className="mb-4 text-center">
          <div className="text-sm font-semibold text-gray-800 mb-1">Description</div>
          <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Checking" className={inputClass} />
        </div>
      )}

      <div className="mb-4 text-center">
        <div className="text-sm font-semibold text-gray-800 mb-1">Last 4 digits</div>
        <input value={last4} onChange={e => setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
          placeholder="1234" inputMode="numeric" className={inputClass} />
      </div>

      {tab === "Credit Card" ? (
        <div className="flex gap-6 mb-4">
          <div className="flex-1 text-center">
            <div className="text-sm font-semibold text-gray-800 mb-1">Balance</div>
            <input type="number" inputMode="decimal" value={balance} onChange={e => setBalance(e.target.value)}
              placeholder="$0.00" className={inputClass} />
          </div>
          <div className="flex-1 text-center">
            <div className="text-sm font-semibold text-gray-800 mb-1">Limit</div>
            <input type="number" inputMode="decimal" value={limit} onChange={e => setLimit(e.target.value)}
              placeholder="$0.00" className={inputClass} />
          </div>
        </div>
      ) : (
        <div className="mb-4 text-center">
          <div className="text-sm font-semibold text-gray-800 mb-1">{balanceLabel}</div>
          <input type="number" inputMode="decimal" value={balance} onChange={e => setBalance(e.target.value)}
            placeholder="$0.00" className={inputClass} />
        </div>
      )}

      <div className="mb-6">
        <ColorPicker value={color} onChange={setColor} />
      </div>

      <button onClick={handleSubmit} disabled={!name || !balance}
        className="w-full py-3.5 bg-gray-100 rounded-2xl text-gray-800 font-semibold text-sm disabled:opacity-40">
        {editAccount ? "Save" : "Add account"}
      </button>
    </Sheet>
  );
}
