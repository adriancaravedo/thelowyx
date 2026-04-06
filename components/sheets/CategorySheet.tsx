"use client";
import { useState, useEffect } from "react";
import Sheet from "@/components/ui/Sheet";
import Toggle from "@/components/ui/Toggle";
import ColorPicker from "@/components/ui/ColorPicker";
import { useApp, Category } from "@/store/AppContext";

interface CategorySheetProps {
  open: boolean;
  onClose: () => void;
  editCategory?: Category | null;
  defaultType?: "income" | "expense";
}

export default function CategorySheet({ open, onClose, editCategory, defaultType = "expense" }: CategorySheetProps) {
  const { addCategory, updateCategory } = useApp();
  const [type, setType] = useState<"Income" | "Expenses">(defaultType === "income" ? "Income" : "Expenses");
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("💰");
  const [color, setColor] = useState("#3b82f6");

  useEffect(() => {
    if (editCategory) {
      setType(editCategory.type === "income" ? "Income" : "Expenses");
      setName(editCategory.name);
      setEmoji(editCategory.emoji);
      setColor(editCategory.color);
    } else {
      setType(defaultType === "income" ? "Income" : "Expenses");
      setName("");
      setEmoji("💰");
      setColor("#3b82f6");
    }
  }, [editCategory, open, defaultType]);

  const handleSubmit = () => {
    if (!name) return;
    const data = { name, emoji, color, type: type === "Income" ? "income" as const : "expense" as const };
    if (editCategory) updateCategory(editCategory.id, data);
    else addCategory(data);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="mb-5">
        <Toggle options={["Income", "Expenses"]} value={type} onChange={v => setType(v as "Income" | "Expenses")} />
      </div>

      <div className="mb-5 text-center">
        <div className="text-sm font-semibold text-gray-800 mb-1">Name</div>
        <input
          value={name} onChange={e => setName(e.target.value)} placeholder="Category name"
          className="w-full text-center text-gray-400 text-sm border-0 border-b border-gray-100 pb-1 focus:outline-none focus:border-blue-400 bg-transparent"
        />
      </div>

      <div className="mb-5 text-center">
        <div className="text-sm font-semibold text-gray-800 mb-2">Emoji</div>
        <input
          value={emoji} onChange={e => setEmoji(e.target.value)} placeholder="💰"
          className="w-16 text-center text-2xl border-0 border-b border-gray-100 pb-1 focus:outline-none bg-transparent mx-auto block"
        />
      </div>

      <div className="mb-6">
        <ColorPicker value={color} onChange={setColor} />
      </div>

      <button onClick={handleSubmit} className="w-full py-3.5 bg-gray-100 rounded-2xl text-gray-800 font-semibold text-sm">
        {editCategory ? "Save changes" : "Add category"}
      </button>
    </Sheet>
  );
}
