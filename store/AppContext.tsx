"use client";
import React, { createContext, useContext, useState, useCallback } from "react";

export type AccountType = "debit" | "credit" | "investment";
export type TransactionType = "income" | "expense";
export type TransactionStatus = "paid" | "not_paid" | "received" | "not_received";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  last4: string;
  balance: number;
  limit?: number;
  color: string;
  createdAt: string;
  history: { date: string; balance: number }[];
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  name: string;
  amount: number;
  date: string;
  type: TransactionType;
  categoryId: string;
  accountId: string;
  status: TransactionStatus;
  recurring?: boolean;
}

export interface Notification {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  createdAt: string;
  read: boolean;
}

export interface UserProfile {
  name: string;
  username: string;
  email: string;
  avatar?: string;
}

interface AppState {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  notifications: Notification[];
  profile: UserProfile;
  addAccount: (a: Omit<Account, "id" | "history">) => void;
  updateAccount: (id: string, a: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  addCategory: (c: Omit<Category, "id">) => void;
  updateCategory: (id: string, c: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addTransaction: (t: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addNotification: (msg: string, type?: "success" | "error" | "info") => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  updateProfile: (p: Partial<UserProfile>) => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

const today = new Date();
const fmt = (d: Date) => d.toISOString().split("T")[0];
const daysAgo = (n: number) => fmt(new Date(today.getTime() - n * 86400000));
const daysAhead = (n: number) => fmt(new Date(today.getTime() + n * 86400000));

const buildHistory = (baseBalance: number, days: number = 30) => {
  const history = [];
  let bal = baseBalance * 0.6;
  // Use deterministic increments instead of Math.random()
  const increments = [45, -20, 60, -15, 80, 30, -25, 55, 40, -10, 70, 25, -30, 65, 35, -5, 85, 20, -40, 75, 50, -15, 60, 30, -20, 90, 45, -10, 55, 25, 10];
  for (let i = days; i >= 0; i--) {
    bal += increments[i % increments.length];
    if (bal < 0) bal = 50;
    history.push({ date: daysAgo(i), balance: parseFloat(bal.toFixed(2)) });
  }
  history[history.length - 1].balance = baseBalance;
  return history;
};

const COLORS = ["#ef4444","#f97316","#eab308","#22c55e","#06b6d4","#3b82f6","#8b5cf6","#ec4899","#000000","#6b7280","#94a3b8","#60a5fa","#b45309","#f59e0b"];

const initAccounts: Account[] = [
  { id: "acc1", name: "Chase Bank", type: "debit", last4: "9942", balance: 2323.22, color: "#3b82f6", createdAt: daysAgo(60), history: buildHistory(2323.22) },
  { id: "acc2", name: "CashApp", type: "debit", last4: "2323", balance: 1323.22, color: "#f97316", createdAt: daysAgo(45), history: buildHistory(1323.22) },
  { id: "acc3", name: "JP Morgan", type: "credit", last4: "2323", balance: 2323.22, limit: 5244.99, color: "#3b82f6", createdAt: daysAgo(30), history: buildHistory(2323.22) },
];

const initCategories: Category[] = [
  { id: "cat1", name: "Paychecks", emoji: "💸", color: "#22c55e", type: "income" },
  { id: "cat2", name: "Interest", emoji: "💰", color: "#eab308", type: "income" },
  { id: "cat3", name: "Business Income", emoji: "💼", color: "#3b82f6", type: "income" },
  { id: "cat4", name: "Gigs", emoji: "🎯", color: "#8b5cf6", type: "income" },
  { id: "cat5", name: "Other Income", emoji: "💵", color: "#06b6d4", type: "income" },
  { id: "cat6", name: "Restaurants", emoji: "🍽️", color: "#f97316", type: "expense" },
  { id: "cat7", name: "Services", emoji: "🔧", color: "#3b82f6", type: "expense" },
  { id: "cat8", name: "Gym", emoji: "💪", color: "#22c55e", type: "expense" },
  { id: "cat9", name: "Charity", emoji: "🤲", color: "#ec4899", type: "expense" },
  { id: "cat10", name: "Food", emoji: "🛒", color: "#eab308", type: "expense" },
  { id: "cat11", name: "Gas", emoji: "⛽", color: "#6b7280", type: "expense" },
  { id: "cat12", name: "Recurring", emoji: "🔄", color: "#6b7280", type: "expense" },
];

const initTransactions: Transaction[] = [
  // Upcoming
  { id: "t1", name: "Payout E8", amount: 1231.89, date: daysAhead(3), type: "income", categoryId: "cat1", accountId: "acc1", status: "not_received" },
  { id: "t2", name: "Storage", amount: 112.44, date: daysAhead(5), type: "expense", categoryId: "cat12", accountId: "acc1", status: "not_paid", recurring: true },
  { id: "t3", name: "Netflix", amount: 450.30, date: daysAhead(2), type: "income", categoryId: "cat5", accountId: "acc1", status: "not_received" },
  { id: "t4", name: "Rent", amount: 900.95, date: daysAhead(4), type: "expense", categoryId: "cat7", accountId: "acc1", status: "not_paid" },
  // Today
  { id: "t5", name: "Artichoke Pizza", amount: 21.89, date: fmt(today), type: "expense", categoryId: "cat6", accountId: "acc1", status: "paid" },
  { id: "t6", name: "Chipotle", amount: 12.44, date: fmt(today), type: "expense", categoryId: "cat6", accountId: "acc1", status: "paid" },
  { id: "t7", name: "Gym membership", amount: 31.44, date: fmt(today), type: "expense", categoryId: "cat8", accountId: "acc2", status: "paid", recurring: true },
  // Yesterday
  { id: "t8", name: "Artichoke Pizza", amount: 21.89, date: daysAgo(1), type: "expense", categoryId: "cat6", accountId: "acc1", status: "paid" },
  { id: "t9", name: "Chipotle", amount: 12.44, date: daysAgo(1), type: "expense", categoryId: "cat6", accountId: "acc2", status: "paid" },
  { id: "t10", name: "Payout E8", amount: 3221.44, date: daysAgo(1), type: "income", categoryId: "cat1", accountId: "acc1", status: "received" },
  // Older this month
  { id: "t11", name: "Grocery Run", amount: 87.20, date: daysAgo(3), type: "expense", categoryId: "cat10", accountId: "acc1", status: "paid" },
  { id: "t12", name: "Business Payment", amount: 2350.30, date: daysAgo(5), type: "income", categoryId: "cat3", accountId: "acc3", status: "received" },
  { id: "t13", name: "Gas Station", amount: 45.00, date: daysAgo(7), type: "expense", categoryId: "cat11", accountId: "acc2", status: "paid" },
  { id: "t14", name: "Gym membership", amount: 31.44, date: daysAgo(8), type: "expense", categoryId: "cat8", accountId: "acc1", status: "paid", recurring: true },
  // Last month
  { id: "t15", name: "Artichoke Pizza", amount: 21.89, date: daysAgo(32), type: "expense", categoryId: "cat6", accountId: "acc1", status: "paid" },
  { id: "t16", name: "Chipotle", amount: 12.44, date: daysAgo(32), type: "expense", categoryId: "cat6", accountId: "acc1", status: "paid" },
  { id: "t17", name: "Gym membership", amount: 31.44, date: daysAgo(33), type: "expense", categoryId: "cat8", accountId: "acc2", status: "paid", recurring: true },
  { id: "t18", name: "Paychecks", amount: 4392.90, date: daysAgo(35), type: "income", categoryId: "cat1", accountId: "acc1", status: "received" },
  { id: "t19", name: "Electric Bill", amount: 118.31, date: daysAgo(38), type: "expense", categoryId: "cat7", accountId: "acc1", status: "paid" },
  { id: "t20", name: "Restaurant", amount: 55.00, date: daysAgo(40), type: "expense", categoryId: "cat6", accountId: "acc2", status: "paid" },
];

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>(initAccounts);
  const [categories, setCategories] = useState<Category[]>(initCategories);
  const [transactions, setTransactions] = useState<Transaction[]>(initTransactions);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    name: "Adrian Caravedo",
    username: "andrelowyx",
    email: "adriancaravedo@outlook.com",
  });

  const addNotification = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    const notif: Notification = { id: uid(), message, type, createdAt: new Date().toISOString(), read: false };
    setNotifications(prev => [notif, ...prev]);
  }, []);

  const addAccount = useCallback((a: Omit<Account, "id" | "history">) => {
    const newAcc: Account = { ...a, id: uid(), history: [{ date: fmt(today), balance: a.balance }] };
    setAccounts(prev => [...prev, newAcc]);
    addNotification(`Account "${a.name}" added`);
  }, [addNotification]);

  const updateAccount = useCallback((id: string, updates: Partial<Account>) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    addNotification("Account updated");
  }, [addNotification]);

  const deleteAccount = useCallback((id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
    addNotification("Account deleted", "info");
  }, [addNotification]);

  const addCategory = useCallback((c: Omit<Category, "id">) => {
    setCategories(prev => [...prev, { ...c, id: uid() }]);
    addNotification(`Category "${c.name}" added`);
  }, [addNotification]);

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    addNotification("Category updated");
  }, [addNotification]);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    addNotification("Category deleted", "info");
  }, [addNotification]);

  const addTransaction = useCallback((t: Omit<Transaction, "id">) => {
    const newT: Transaction = { ...t, id: uid() };
    setTransactions(prev => [newT, ...prev]);
    // Update account balance if paid/received
    if (t.status === "paid" || t.status === "received") {
      setAccounts(prev => prev.map(a => {
        if (a.id !== t.accountId) return a;
        const newBalance = t.type === "income" ? a.balance + t.amount : a.balance - t.amount;
        const newHistory = [...a.history, { date: fmt(today), balance: parseFloat(newBalance.toFixed(2)) }];
        return { ...a, balance: parseFloat(newBalance.toFixed(2)), history: newHistory };
      }));
    }
    addNotification(`Transaction "${t.name}" added`);
  }, [addNotification]);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => {
      if (t.id !== id) return t;
      const old = t;
      const updated = { ...t, ...updates };
      // If status changed to paid/received, update balance
      const wasUnpaid = old.status === "not_paid" || old.status === "not_received";
      const nowPaid = updated.status === "paid" || updated.status === "received";
      if (wasUnpaid && nowPaid) {
        setAccounts(prev2 => prev2.map(a => {
          if (a.id !== updated.accountId) return a;
          const newBalance = updated.type === "income" ? a.balance + updated.amount : a.balance - updated.amount;
          const newHistory = [...a.history, { date: fmt(today), balance: parseFloat(newBalance.toFixed(2)) }];
          return { ...a, balance: parseFloat(newBalance.toFixed(2)), history: newHistory };
        }));
      }
      return updated;
    }));
    addNotification("Transaction updated");
  }, [addNotification]);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    addNotification("Transaction deleted", "info");
  }, [addNotification]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearNotifications = useCallback(() => setNotifications([]), []);

  const updateProfile = useCallback((p: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...p }));
    addNotification("Profile updated");
  }, [addNotification]);

  return (
    <AppContext.Provider value={{
      accounts, categories, transactions, notifications, profile,
      addAccount, updateAccount, deleteAccount,
      addCategory, updateCategory, deleteCategory,
      addTransaction, updateTransaction, deleteTransaction,
      addNotification, markNotificationRead, clearNotifications,
      updateProfile,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}

export { COLORS };
