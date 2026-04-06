"use client";

interface BadgeProps {
  label: string;
  color?: string;
  size?: "sm" | "xs";
}

export default function Badge({ label, color = "#6b7280", size = "xs" }: BadgeProps) {
  const textSize = size === "xs" ? "text-[9px]" : "text-[10px]";
  const padding = size === "xs" ? "px-1.5 py-0.5" : "px-2 py-1";

  // Make background lighter version of color
  return (
    <span
      className={`${textSize} ${padding} rounded-full font-bold uppercase tracking-wider inline-block`}
      style={{
        backgroundColor: color + "25",
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      {label}
    </span>
  );
}
