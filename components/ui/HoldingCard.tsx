"use client";
import { Holding } from "@/store/AppContext";
import { formatCurrency } from "@/lib/utils";

interface HoldingCardProps {
  holding: Holding;
  onClick?: () => void;
}

const MONO = { fontFamily: "var(--font-geist-mono)" };

export default function HoldingCard({ holding, onClick }: HoldingCardProps) {
  const change = holding.changePercent || 0;
  const isPositive = change >= 0;
  const currentVal = holding.currentValue || holding.quantity * holding.buyPrice;

  // Mini sparkline using SVG (simple line from buy to current)
  const points = [
    { x: 0, y: 60 },
    { x: 20, y: 50 },
    { x: 40, y: 55 },
    { x: 60, y: 40 },
    { x: 80, y: 45 },
    { x: 100, y: isPositive ? 20 : 65 },
  ];
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L 100 80 L 0 80 Z`;

  return (
    <button
      onClick={onClick}
      className="min-w-[150px] bg-white border border-gray-100 rounded-2xl p-3 flex-shrink-0 shadow-sm text-left w-full"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-baseline gap-1">
          <span className="text-xs text-gray-400" style={MONO}>{holding.quantity}</span>
          <span className="text-sm font-bold text-gray-900" style={MONO}>{holding.symbol}</span>
        </div>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isPositive ? "bg-green-400 text-white" : "bg-red-400 text-white"}`}>
          {isPositive ? "↗" : "↘"}{Math.abs(change).toFixed(2)}%
        </span>
      </div>

      {/* Description */}
      <div className="text-[10px] text-gray-400 truncate mb-2 max-w-[130px]">{holding.description}</div>

      {/* Mini sparkline SVG */}
      <div className="mb-2">
        <svg viewBox="0 0 100 80" className="w-full h-10" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`grad-${holding.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity="0.2" />
              <stop offset="100%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill={`url(#grad-${holding.id})`} />
          <path d={pathD} stroke={isPositive ? "#22c55e" : "#ef4444"} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="100" cy={isPositive ? 20 : 65} r="3" fill={isPositive ? "#22c55e" : "#ef4444"} />
        </svg>
      </div>

      {/* Value */}
      <div className="text-sm font-bold text-gray-900" style={MONO}>
        {formatCurrency(currentVal)}
      </div>
    </button>
  );
}
