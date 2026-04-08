"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import Sheet from "@/components/ui/Sheet";
import { useApp } from "@/store/AppContext";
import { searchSymbol, getQuote, POPULAR } from "@/lib/finnhub";
import { formatCurrency } from "@/lib/utils";

interface HoldingSheetProps {
  open: boolean;
  onClose: () => void;
  accountId: string;
}

type Step = "search" | "quantity";

const MONO = { fontFamily: "var(--font-geist-mono)" };

interface TickerItem {
  symbol: string;
  description: string;
  price?: number;
  type?: string;
}

export default function HoldingSheet({ open, onClose, accountId }: HoldingSheetProps) {
  const { addHolding } = useApp();
  const [step, setStep] = useState<Step>("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TickerItem[]>([]);
  const [popularWithPrices, setPopularWithPrices] = useState<TickerItem[]>([]);
  const [selected, setSelected] = useState<TickerItem | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [loadingPopular, setLoadingPopular] = useState(false);
  const [quantity, setQuantity] = useState("1");
  const [buyPrice, setBuyPrice] = useState("");
  const [buyDate, setBuyDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Load popular tickers with prices on open
  useEffect(() => {
    if (!open) {
      setStep("search"); setQuery(""); setSelected(null);
      setQuantity("1"); setBuyPrice(""); setResults([]);
      return;
    }
    // Load prices for popular tickers
    setLoadingPopular(true);
    Promise.all(
      POPULAR.map(async p => {
        const quote = await getQuote(p.symbol);
        return { symbol: p.symbol, description: p.description, price: quote?.c };
      })
    ).then(items => {
      setPopularWithPrices(items);
      setLoadingPopular(false);
    });
  }, [open]);

  // Search debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      const res = await searchSymbol(query);
      // Fetch prices for search results
      const withPrices = await Promise.all(
        res.slice(0, 8).map(async r => {
          const quote = await getQuote(r.symbol);
          return { symbol: r.symbol, description: r.description, price: quote?.c, type: r.type };
        })
      );
      setResults(withPrices);
    }, 500);
  }, [query]);

  const handleSelect = async (item: TickerItem) => {
    setSelected(item);
    setStep("quantity");
    if (item.price) {
      setCurrentPrice(item.price);
      setBuyPrice(item.price.toFixed(2));
    } else {
      setLoadingPrice(true);
      const quote = await getQuote(item.symbol);
      if (quote) {
        setCurrentPrice(quote.c);
        setBuyPrice(quote.c.toFixed(2));
      }
      setLoadingPrice(false);
    }
  };

  const handleSave = async () => {
    if (!selected || !quantity || !buyPrice) return;
    setSaving(true);
    const cp = currentPrice || parseFloat(buyPrice);
    const qty = parseFloat(quantity);
    const bp = parseFloat(buyPrice);
    await addHolding(accountId, {
      symbol: selected.symbol,
      description: selected.description,
      quantity: qty,
      buyPrice: bp,
      buyDate,
      currentPrice: cp,
      currentValue: qty * cp,
      changePercent: bp > 0 ? ((cp - bp) / bp) * 100 : 0,
    });
    setSaving(false);
    onClose();
  };

  const displayList = query.trim() ? results : popularWithPrices;
  const inputClass = "w-full text-center text-gray-400 text-sm border-b border-gray-100 pb-1 focus:outline-none focus:border-blue-400 bg-transparent";

  // Step 2 — How much do you hold?
  if (step === "quantity" && selected) {
    return (
      <Sheet open={open} onClose={onClose}>
        <div className="flex items-center mb-5">
          <button onClick={() => setStep("search")} className="p-1 -ml-1 mr-3">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <span className="text-sm text-gray-400 flex-1 text-center pr-6">Investments</span>
        </div>

        <div className="text-center mb-6">
          <div className="text-lg font-semibold text-gray-900 mb-3">How much do you hold?</div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-bold text-gray-900" style={MONO}>{quantity || "0"}</span>
            <span className="text-xl font-semibold text-gray-500" style={MONO}>{selected.symbol}</span>
          </div>
        </div>

        <div className="space-y-4 mb-5">
          {/* Quantity stepper */}
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-800 mb-2">Quantity</div>
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => setQuantity(q => String(Math.max(0.01, parseFloat(q || "1") - 1)))}
                className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 text-xl font-bold flex items-center justify-center">−</button>
              <input type="number" inputMode="decimal" value={quantity} onChange={e => setQuantity(e.target.value)}
                className="w-20 text-center text-gray-800 text-lg font-bold border-b border-gray-200 pb-1 focus:outline-none bg-transparent" style={MONO} />
              <button onClick={() => setQuantity(q => String(parseFloat(q || "0") + 1))}
                className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 text-xl font-bold flex items-center justify-center">+</button>
            </div>
          </div>

          <div className="text-center">
            <div className="text-sm font-semibold text-gray-800 mb-1">Price</div>
            {loadingPrice
              ? <div className="text-gray-300 text-sm py-1">Loading price...</div>
              : <input type="number" inputMode="decimal" value={buyPrice} onChange={e => setBuyPrice(e.target.value)}
                  placeholder="$0.00" className={inputClass} style={MONO} />
            }
            {currentPrice && (
              <div className="text-[10px] text-gray-400 mt-1">
                Current market: <span style={MONO}>{formatCurrency(currentPrice)}</span>
              </div>
            )}
          </div>

          <div className="text-center">
            <div className="text-sm font-semibold text-gray-800 mb-1">Date</div>
            <input type="date" value={buyDate} onChange={e => setBuyDate(e.target.value)} className={inputClass} />
          </div>
        </div>

        {/* Total preview */}
        {quantity && buyPrice && parseFloat(quantity) > 0 && parseFloat(buyPrice) > 0 && (
          <div className="bg-gray-50 rounded-2xl p-3 mb-4 text-center">
            <div className="text-xs text-gray-400 mb-1">Total value</div>
            <div className="text-lg font-bold text-gray-900" style={MONO}>
              {formatCurrency(parseFloat(quantity) * parseFloat(buyPrice))}
            </div>
          </div>
        )}

        <button onClick={handleSave} disabled={!quantity || !buyPrice || saving}
          className="w-full py-3.5 bg-gray-100 rounded-2xl text-gray-800 font-semibold text-sm disabled:opacity-40">
          {saving ? "Saving..." : "Save"}
        </button>
      </Sheet>
    );
  }

  // Step 1 — Search / Popular list
  return (
    <Sheet open={open} onClose={onClose}>
      <div className="text-center text-sm text-gray-400 mb-4">Investments</div>
      <div className="text-center font-semibold text-gray-900 mb-1">What do you hold today?</div>

      {/* Search input styled like the mockup */}
      <div className="text-center mb-4">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name or ticker"
          className="w-full text-center text-gray-400 text-sm border-b border-gray-100 pb-1 focus:outline-none focus:border-blue-400 bg-transparent"
          style={MONO}
        />
      </div>

      {/* Ticker list */}
      <div className="bg-gray-50 rounded-2xl overflow-hidden">
        {loadingPopular && !query ? (
          <div className="text-center py-8 text-gray-300 text-sm">Loading prices...</div>
        ) : displayList.length === 0 && query ? (
          <div className="text-center py-8 text-gray-300 text-sm">No results for "{query}"</div>
        ) : (
          displayList.map((item, i) => (
            <button key={`${item.symbol}-${i}`} onClick={() => handleSelect(item)}
              className={`w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-100 transition-colors ${i < displayList.length - 1 ? "border-b border-gray-100" : ""}`}>
              <div className="flex-1">
                <div className="text-sm font-bold text-gray-900" style={MONO}>{item.symbol}</div>
                <div className="text-xs text-gray-400 truncate max-w-52">{item.description}</div>
              </div>
              {item.price !== undefined && item.price > 0 && (
                <div className="text-sm font-semibold text-gray-800 ml-3" style={MONO}>
                  {formatCurrency(item.price)}
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </Sheet>
  );
}
