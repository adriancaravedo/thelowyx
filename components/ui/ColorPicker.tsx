"use client";
import { COLORS } from "@/store/AppContext";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {COLORS.map(color => (
        <button
          key={color}
          onClick={() => onChange(color)}
          className="w-7 h-7 rounded-full transition-transform"
          style={{
            backgroundColor: color,
            transform: value === color ? "scale(1.2)" : "scale(1)",
            outline: value === color ? `2px solid ${color}` : "none",
            outlineOffset: "2px",
          }}
        />
      ))}
    </div>
  );
}
