"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/store/AppContext";
import { useAuth } from "@/store/AuthContext";
import Header from "@/components/ui/Header";
import BottomNav from "@/components/ui/BottomNav";
import Sparkline from "@/components/ui/Sparkline";
import RangeSelector from "@/components/ui/RangeSelector";
import MenuSheet from "@/components/sheets/MenuSheet";
import TransactionSheet from "@/components/sheets/TransactionSheet";
import OnboardingSheet from "@/components/sheets/OnboardingSheet";
import { formatCurrency, calcChangePercent, getCombinedHistory, getMonthlyIncomeSpend, getCurrentMonthKey, TimeRange } from "@/lib/utils";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler);

const MONO = { fontFamily: "var(--font-geist-mono)" };

export default function DashboardPage() {
  const { accounts, transactions } = useApp();
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [range, setRange] = useState<TimeRange>("1M");
  const [menuOpen, setMenuOpen] = useState(false);
  const [addTxOpen, setAddTxOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    if (profile && !profile.onboardingComplete) setShowOnboarding(true);
  }, [user, profile, loading, router]);

  const combinedHistory = getCombinedHistory(accounts);

  // Net worth = (debit + investment + real_estate + other) - (credit + loan)
  const totalBalance = accounts.reduce((s, a) => {
    if (["debit", "investment", "real_estate", "other"].includes(a.type)) return s + a.balance;
    if (["credit", "loan"].includes(a.type)) return s - a.balance;
    return s;
  }, 0);

  const change = calcChangePercent(combinedHistory, range);
  const isPositive = change >= 0;

  // Upcoming = only not_paid / not_received
  const upcoming = transactions.filter(t => t.status === "not_paid" || t.status === "not_received").slice(0, 3);

  const monthKey = getCurrentMonthKey();
  const monthName = new Date().toLocaleDateString("en-US", { month: "long" });
  const { income, spend } = getMonthlyIncomeSpend(transactions, monthKey);
  const netMonth = income - spend;

  // Monthly income/spend chart
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const currentMonthTxs = transactions.filter(t =>
    t.date.startsWith(monthKey) && (t.status === "paid" || t.status === "received")
  );
  const incomeData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = String(i + 1).padStart(2, "0");
    const dateStr = `${monthKey}-${day}`;
    return currentMonthTxs.filter(t => t.date <= dateStr && t.type === "income").reduce((s, t) => s + t.amount, 0);
  });
  const spendData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = String(i + 1).padStart(2, "0");
    const dateStr = `${monthKey}-${day}`;
    return currentMonthTxs.filter(t => t.date <= dateStr && t.type === "expense").reduce((s, t) => s + t.amount, 0);
  });
  const dayLabels = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));
  const currency = profile?.currency === "PEN" ? "S/." : "$";

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <Header title="Dashboard" onMenuOpen={() => setMenuOpen(true)} />
      <div className="px-4 pt-2 space-y-4">

        {/* Balance card */}
        <div className="bg-white rounded-3xl p-5">
          <div className="flex justify-center mb-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isPositive ? "bg-green-400 text-white" : "bg-red-400 text-white"}`}>
              {isPositive ? "↗" : "↘"}{Math.abs(change)}%
            </span>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold tracking-tight text-gray-900" style={MONO}>
              {currency}{Math.abs(totalBalance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-400 mt-1">Total balance</div>
          </div>
          <div className="mt-4">
            <Sparkline history={combinedHistory} range={range} height={120} />
          </div>
          <div className="mt-3">
            <RangeSelector value={range} onChange={setRange} />
          </div>
        </div>

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <div className="bg-white rounded-3xl p-5">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-400 font-medium">Upcoming</span>
              <span className="text-sm text-gray-400 underline cursor-pointer">See all</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {upcoming.map(tx => (
                <div key={tx.id} className="min-w-[110px] border border-gray-100 rounded-2xl p-3 flex-shrink-0">
                  <div className="text-sm font-semibold text-gray-800">{tx.name}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {new Date(tx.date + "T12:00:00").toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}
                  </div>
                  <div className={`text-sm font-bold mt-3 ${tx.type === "income" ? "text-green-500" : "text-red-500"}`} style={MONO}>
                    {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Net this month */}
        <div className="bg-white rounded-3xl p-5">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-400">{monthName}</span>
            <span className="text-sm text-gray-400">Net this month</span>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl font-bold text-gray-900" style={MONO}>
              {netMonth >= 0 ? "+" : ""}{formatCurrency(netMonth)}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${netMonth >= 0 ? "bg-green-400 text-white" : "bg-red-400 text-white"}`}>
              ↗{Math.abs(change)}%
            </span>
          </div>
          <div style={{ height: 150 }}>
            <Line
              data={{
                labels: dayLabels,
                datasets: [
                  { data: incomeData, borderColor: "#3b82f6", borderWidth: 2, fill: false, tension: 0.4, pointRadius: 0 },
                  { data: spendData, borderColor: "#93c5fd", borderWidth: 2, fill: false, tension: 0.4, pointRadius: 0 },
                ],
              }}
              options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                scales: { x: { display: false }, y: { display: false } },
              }}
            />
          </div>
          <div className="flex gap-6 mt-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <div className="w-2 h-2 rounded-full bg-green-500" /> Income
              </div>
              <div className="text-sm font-bold text-green-500" style={MONO}>{formatCurrency(income)}</div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <div className="w-2 h-2 rounded-full bg-blue-400" /> Spend
              </div>
              <div className="text-sm font-bold text-red-500" style={MONO}>{formatCurrency(spend)}</div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav onAddPress={() => setAddTxOpen(true)} />
      <MenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} />
      <TransactionSheet open={addTxOpen} onClose={() => setAddTxOpen(false)} />
      <OnboardingSheet open={showOnboarding} onComplete={() => setShowOnboarding(false)} />
    </div>
  );
}
