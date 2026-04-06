"use client";
import { TimeRange } from "@/lib/utils";

const RANGES: TimeRange[] = ["1D", "1W", "1M", "1Y", "YTD"];

interface RangeSelectorProps {
  value: TimeRange;
  onChange: (r: TimeRange) => void;
}

export default function RangeSelector({ value, onChange }: RangeSelectorProps) {
  return (
    <div className="flex justify-between px-2">
      {RANGES.map(r => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
            value === r
              ? "bg-gray-100 text-black font-semibold"
              : "text-gray-400"
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
