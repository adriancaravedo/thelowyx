"use client";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";
import { filterHistoryByRange, TimeRange } from "@/lib/utils";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

interface SparklineProps {
  history: { date: string; balance: number }[];
  range: TimeRange;
  color?: string;
  height?: number;
  showDot?: boolean;
}

export default function Sparkline({ history, range, color = "#22c55e", height = 120, showDot = true }: SparklineProps) {
  const filtered = filterHistoryByRange(history, range);
  const labels = filtered.map(h => h.date);
  const data = filtered.map(h => h.balance);

  const isGreen = color === "#22c55e" || color.includes("22c55e");
  const gradientColor = isGreen ? "rgba(34,197,94," : "rgba(59,130,246,";

  return (
    <div style={{ height, position: "relative" }}>
      <Line
        data={{
          labels,
          datasets: [{
            data,
            borderColor: color,
            borderWidth: 2.5,
            fill: true,
            backgroundColor: (ctx) => {
              const chart = ctx.chart;
              const { ctx: c, chartArea } = chart;
              if (!chartArea) return gradientColor + "0.1)";
              const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
              gradient.addColorStop(0, gradientColor + "0.2)");
              gradient.addColorStop(1, gradientColor + "0)");
              return gradient;
            },
            tension: 0.4,
            pointRadius: (ctx) => {
              if (!showDot) return 0;
              return ctx.dataIndex === data.length - 1 ? 6 : 0;
            },
            pointBackgroundColor: color,
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
          }],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          scales: {
            x: { display: false },
            y: { display: false },
          },
          elements: { line: { capBezierPoints: true } },
        }}
      />
    </div>
  );
}
