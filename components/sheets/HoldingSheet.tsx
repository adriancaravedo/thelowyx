"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Search } from "lucide-react";
import Sheet from "@/components/ui/Sheet";
import { useApp } from "@/store/AppContext";
import { searchSymbol, getQuote, POPULAR, SearchResult } from "@/lib/finnhub";
import { formatCurrency } from "@/lib/utils";

interface HoldingSheetProps {
  open: boolean;
  onClose: () => void;
  accountId: string;
}

type Step = "search" | "quantity";

export default function HoldingSheet({ open, onClose, accountId }: HoldingSheetProps) {
  const { addHolding } = useApp();
  const [step, setStep] = useState<Step>("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [buyDate, setBuyDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!open) { setStep("search"); setQuery(""); setSelected(null); setQuantity(""); setBuyPrice(""); setResults([]); }
  }, [open]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      const res = await searchSymbol(query);
      setResults(res);
    }, 400);
  }, [query]);

  const handleSelect = async (r: SearchResult) => {
    setSelected(r);
    setStep("quantity");
    setLoadingPrice(true);
    const quote = await getQuote(r.symbol);
    if (quote) {
      setCurrentPrice(quote.c);
      setBuyPrice(quote.c.toString());
    }
    setLoadingPrice(false);
  };

  const handleSave = async () => {
    if (!selected || !quantity || !buyPrice) return;
    setSaving(true);
    const cp = currentPrice || parseFloat(buyPrice);
    await addHolding(accountId, {
      symbol: selected.symbol,
      description: selected.description,
      quantity: parseFloat(quantity),
      buyPrice: parseFloat(buyPrice),
      buyDate,
      currentPrice: cp,
      currentValue: parseFloat(quantity) * cp,
      changePercent: buyPrice ? ((cp - parseFloat(buyPrice)) / parseFloat(buyPrice)) * 100 : 0,
    });
    setSaving(false);
    onClose();
  };

  const displayList = query.trim() ? results : POPULAR.map(p => ({ symbol: p.symbol, description: p.description, type: "Common Stock" }));

  if (step === "quantity" && selected) {
    return (
      <Sheet open={open} onClose={onClose}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setStep("search")} className="p-1 -ml-1">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <span className="text-sm text-gray-400 text-center flex-1">Investments</span>
        </div>

        <div className="text-center mb-6">
          <div className="text-lg font-bold text-gray-900 mb-1">How much do you hold?</div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl font-bold text-gray-900">{quantity || "0"}</span>
            <span className="text-lg font-semibold text-gray-500">{selected.symbol}</span>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-800 mb-1">Quantity</div>
            <input type="number" inputMode="decimal" value={quantity} onChange={e => setQuantity(e.target.value)}
              placeholder="0" className="w-full text-center text-gray-400 text-sm border-b border-gray-100 pb-1 focus:outline-none focus:border-blue-400 bg-transparent" />
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-800 mb-1">Price</div>
            {loadingPrice
              ? <div className="text-gray-300 text-sm">Loading price...</div>
              : <input type="number" inputMode="decimal" value={buyPrice} onChange={e => setBuyPrice(e.target.value)}
                  placeholder={currentPrice ? `$${currentPrice}` : "$0.00"}
                  className="w-full text-center text-gray-400 text-sm border-b border-gray-100 pb-1 focus:outline-none focus:border-blue-400 bg-transparent" />
            }
            {currentPrice && (
              <div className="text-xs text-gray-400 mt-1">Current market price: {formatCurrency(currentPrice)}</div>
            )}
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-800 mb-1">Date</div>
            <input type="date" value={buyDate} onChange={e => setBuyDate(e.target.value)}
              className="w-full text-center text-gray-400 text-sm border-b border-gray-100 pb-1 focus:outline-none focus:border-blue-400 bg-transparent" />
          </div>
        </div>

        {quantity && buyPrice && (
          <div className="bg-gray-50 rounded-2xl p-3 mb-4 text-center">
            <div className="text-xs text-gray-400">Total value</div>
            <div className="text-lg font-bold text-gray-900">{formatCurrency(parseFloat(quantity) * parseFloat(buyPrice))}</div>
          </div>
        )}

        <button onClick={handleSave} disabled={!quantity || !buyPrice || saving}
          className="w-full py-3.5 bg-gray-100 rounded-2xl text-gray-800 font-semibold text-sm disabled:opacity-40">
          {saving ? "Saving..." : "Save"}
        </button>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="text-center text-sm text-gray-400 mb-4">Investments</div>
      <div className="text-center font-semibold text-gray-900 mb-1">What do you hold today?</div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2.5 mb-4">
        <Search size={14} className="text-gray-400" />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name or ticker"
          className="flex-1 text-sm bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-300 font-mono" />
      </div>

      {/* Results */}
      <div className="bg-gray-50 rounded-2xl overflow-hidden max-h-80 overflow-y-auto">
        {displayList.length === 0 && query ? (
          <div className="text-center py-8 text-gray-300 text-sm">No results</div>
        ) : (
          displayList.map((r, i) => (
            <button key={`${r.symbol}-${i}`} onClick={() => handleSelect(r)}
              className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-100 ${i < displayList.length - 1 ? "border-b border-gray-100" : ""}`}>
              <div>
                <div className="text-sm font-bold text-gray-900 font-mono">{r.symbol}</div>
                <div className="text-xs text-gray-400 truncate max-w-48">{r.description}</div>
              </div>
            </button>
          ))
        )}
      </div>
    </Sheet>
  );
}
