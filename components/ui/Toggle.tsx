"use client";

interface ToggleProps {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}

export default function Toggle({ options, value, onChange }: ToggleProps) {
  return (
    <div className="flex bg-gray-100 rounded-full p-1 gap-1 w-fit mx-auto">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${
            value === opt
              ? "bg-white text-black shadow-sm"
              : "text-gray-500"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
