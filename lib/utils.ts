import { Transaction, Account } from "@/store/AppContext";

export const formatCurrency = (amount: number, showSign = false): string => {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: 2,
  }).format(Math.abs(amount));
  if (showSign) return amount >= 0 ? `+${formatted}` : `-${formatted}`;
  return formatted;
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
};

export const formatDateLong = (dateStr: string): string => {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });
};

export const getMonthLabel = (dateStr: string): string => {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

export const getMonthKey = (dateStr: string): string => dateStr.slice(0, 7);
export const getCurrentMonthKey = (): string => new Date().toISOString().slice(0, 7);

export type TimeRange = "1D" | "1W" | "1M" | "1Y" | "YTD";

export const filterHistoryByRange = (
  history: { date: string; balance: number }[],
  range: TimeRange
): { date: string; balance: number }[] => {
  const now = new Date();
  let cutoff: Date;
  switch (range) {
    case "1D": cutoff = new Date(now.getTime() - 86400000); break;
    case "1W": cutoff = new Date(now.getTime() - 7 * 86400000); break;
    case "1M": cutoff = new Date(now.getTime() - 30 * 86400000); break;
    case "1Y": cutoff = new Date(now.getTime() - 365 * 86400000); break;
    case "YTD": cutoff = new Date(now.getFullYear(), 0, 1); break;
  }
  const filtered = history.filter(h => new Date(h.date) >= cutoff);
  return filtered.length >= 2 ? filtered : history.slice(-2);
};

export const calcChangePercent = (history: { date: string; balance: number }[], range: TimeRange): number => {
  const filtered = filterHistoryByRange(history, range);
  if (filtered.length < 2) return 0;
  const first = filtered[0].balance;
  const last = filtered[filtered.length - 1].balance;
  if (first === 0) return 0;
  return parseFloat(((last - first) / first * 100).toFixed(2));
};

export const getTotalBalance = (accounts: Account[]): number =>
  accounts.reduce((sum, a) => sum + a.balance, 0);

export const getCombinedHistory = (accounts: Account[]): { date: string; balance: number }[] => {
  const map = new Map<string, number>();
  accounts.forEach(acc => {
    acc.history.forEach(h => {
      map.set(h.date, (map.get(h.date) || 0) + h.balance);
    });
  });
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, balance]) => ({ date, balance: parseFloat(balance.toFixed(2)) }));
};

export const getMonthlyIncomeSpend = (transactions: Transaction[], monthKey: string) => {
  const paid = transactions.filter(t => {
    const mk = getMonthKey(t.date);
    return mk === monthKey && (t.status === "paid" || t.status === "received");
  });
  const income = paid.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const spend = paid.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  return { income: parseFloat(income.toFixed(2)), spend: parseFloat(spend.toFixed(2)) };
};

export const groupTransactionsByDate = (transactions: Transaction[]) => {
  const todayStr = new Date().toISOString().split("T")[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  // Only show paid/received transactions in the list (not upcoming)
  const paid = transactions.filter(t => t.status === "paid" || t.status === "received");
  const sorted = [...paid].sort((a, b) => b.date.localeCompare(a.date));

  const groups: { label: string; monthKey?: string; transactions: Transaction[]; isSummary?: boolean }[] = [];
  const monthsSeen = new Set<string>();
  const dateGroups = new Map<string, Transaction[]>();

  sorted.forEach(t => {
    if (!dateGroups.has(t.date)) dateGroups.set(t.date, []);
    dateGroups.get(t.date)!.push(t);
  });

  const dates = Array.from(dateGroups.keys()).sort((a, b) => b.localeCompare(a));
  const currentMk = getCurrentMonthKey();

  dates.forEach(date => {
    const mk = getMonthKey(date);
    if (!monthsSeen.has(mk)) {
      if (mk !== currentMk) {
        groups.push({ label: getMonthLabel(date), monthKey: mk, transactions: [], isSummary: true });
      }
      monthsSeen.add(mk);
    }
    let label = date;
    if (date === todayStr) label = "Today";
    else if (date === yesterdayStr) label = "Yesterday";
    else label = new Date(date + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    groups.push({ label, transactions: dateGroups.get(date)! });
  });

  return groups;
};
