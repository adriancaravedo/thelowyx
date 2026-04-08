"use client";
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { collection, doc, getDocs, setDoc, deleteDoc, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/store/AuthContext";

export type AccountType = "debit" | "credit" | "investment" | "real_estate" | "loan" | "other";
export type TransactionType = "income" | "expense";
export type TransactionStatus = "paid" | "not_paid" | "received" | "not_received";

export interface Holding {
  id: string;
  symbol: string;
  description: string;
  quantity: number;
  buyPrice: number;
  buyDate: string;
  currentPrice?: number;
  currentValue?: number;
  changePercent?: number;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  last4: string;
  description?: string;
  balance: number;
  limit?: number;
  color: string;
  createdAt: string;
  history: { date: string; balance: number }[];
  holdings?: Holding[];
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

interface AppState {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  notifications: Notification[];
  loading: boolean;
  addAccount: (a: Omit<Account, "id" | "history">) => Promise<void>;
  updateAccount: (id: string, a: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  addHolding: (accountId: string, h: Omit<Holding, "id">) => Promise<void>;
  deleteHolding: (accountId: string, holdingId: string) => Promise<void>;
  addCategory: (c: Omit<Category, "id">) => Promise<void>;
  updateCategory: (id: string, c: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addTransaction: (t: Omit<Transaction, "id">) => Promise<void>;
  updateTransaction: (id: string, t: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addNotification: (msg: string, type?: "success" | "error" | "info") => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);
const today = new Date().toISOString().split("T")[0];

const DEFAULT_CATEGORIES: Omit<Category, "id">[] = [
  { name: "Paychecks", emoji: "💸", color: "#22c55e", type: "income" },
  { name: "Interest", emoji: "💰", color: "#eab308", type: "income" },
  { name: "Business Income", emoji: "💼", color: "#3b82f6", type: "income" },
  { name: "Gigs", emoji: "🎯", color: "#8b5cf6", type: "income" },
  { name: "Other Income", emoji: "💵", color: "#06b6d4", type: "income" },
  { name: "Restaurants", emoji: "🍽️", color: "#f97316", type: "expense" },
  { name: "Services", emoji: "🔧", color: "#3b82f6", type: "expense" },
  { name: "Gym", emoji: "💪", color: "#22c55e", type: "expense" },
  { name: "Charity", emoji: "🤲", color: "#ec4899", type: "expense" },
  { name: "Food", emoji: "🛒", color: "#eab308", type: "expense" },
  { name: "Gas", emoji: "⛽", color: "#6b7280", type: "expense" },
  { name: "Recurring", emoji: "🔄", color: "#6b7280", type: "expense" },
];

export const COLORS = ["#ef4444","#f97316","#eab308","#22c55e","#06b6d4","#3b82f6","#8b5cf6","#ec4899","#000000","#6b7280","#94a3b8","#60a5fa","#b45309","#f59e0b"];

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const addNotification = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    const notif: Notification = { id: uid(), message, type, createdAt: new Date().toISOString(), read: false };
    setNotifications(prev => [notif, ...prev]);
  }, []);

  useEffect(() => {
    if (!user) {
      setAccounts([]); setCategories([]); setTransactions([]); setLoading(false);
      return;
    }
    setLoading(true);
    const base = `users/${user.uid}`;
    const unsubAccounts = onSnapshot(query(collection(db, `${base}/accounts`)), snap => {
      setAccounts(snap.docs.map(d => d.data() as Account));
    });
    const unsubTx = onSnapshot(query(collection(db, `${base}/transactions`)), snap => {
      setTransactions(snap.docs.map(d => d.data() as Transaction));
    });
    const loadCategories = async () => {
      const snap = await getDocs(collection(db, `${base}/categories`));
      if (snap.empty) {
        for (const cat of DEFAULT_CATEGORIES) {
          const id = uid();
          await setDoc(doc(db, `${base}/categories`, id), { ...cat, id });
        }
        const snap2 = await getDocs(collection(db, `${base}/categories`));
        setCategories(snap2.docs.map(d => d.data() as Category));
      } else {
        setCategories(snap.docs.map(d => d.data() as Category));
      }
      setLoading(false);
    };
    loadCategories();
    return () => { unsubAccounts(); unsubTx(); };
  }, [user]);

  const base = user ? `users/${user.uid}` : null;

  const addAccount = useCallback(async (a: Omit<Account, "id" | "history">) => {
    if (!base) return;
    const id = uid();
    await setDoc(doc(db, `${base}/accounts`, id), { ...a, id, history: [{ date: today, balance: a.balance }] });
    addNotification(`Account "${a.name}" added`);
  }, [base, addNotification]);

  const updateAccount = useCallback(async (id: string, updates: Partial<Account>) => {
    if (!base) return;
    const acc = accounts.find(a => a.id === id);
    if (!acc) return;
    await setDoc(doc(db, `${base}/accounts`, id), { ...acc, ...updates });
    addNotification("Account updated");
  }, [base, accounts, addNotification]);

  const deleteAccount = useCallback(async (id: string) => {
    if (!base) return;
    await deleteDoc(doc(db, `${base}/accounts`, id));
    addNotification("Account deleted", "info");
  }, [base, addNotification]);

  const addHolding = useCallback(async (accountId: string, h: Omit<Holding, "id">) => {
    if (!base) return;
    const acc = accounts.find(a => a.id === accountId);
    if (!acc) return;
    const id = uid();
    const holding: Holding = { ...h, id };
    const holdingValue = h.quantity * (h.currentPrice || h.buyPrice);
    const newBalance = acc.balance + holdingValue;
    const newHoldings = [...(acc.holdings || []), holding];
    await setDoc(doc(db, `${base}/accounts`, accountId), {
      ...acc, holdings: newHoldings, balance: parseFloat(newBalance.toFixed(2)),
      history: [...acc.history, { date: today, balance: parseFloat(newBalance.toFixed(2)) }]
    });
    addNotification(`Holding ${h.symbol} added`);
  }, [base, accounts, addNotification]);

  const deleteHolding = useCallback(async (accountId: string, holdingId: string) => {
    if (!base) return;
    const acc = accounts.find(a => a.id === accountId);
    if (!acc) return;
    const holding = (acc.holdings || []).find(h => h.id === holdingId);
    if (!holding) return;
    const holdingValue = holding.quantity * (holding.currentPrice || holding.buyPrice);
    const newBalance = acc.balance - holdingValue;
    const newHoldings = (acc.holdings || []).filter(h => h.id !== holdingId);
    await setDoc(doc(db, `${base}/accounts`, accountId), {
      ...acc, holdings: newHoldings, balance: parseFloat(Math.max(0, newBalance).toFixed(2))
    });
    addNotification("Holding removed", "info");
  }, [base, accounts, addNotification]);

  const addCategory = useCallback(async (c: Omit<Category, "id">) => {
    if (!base) return;
    const id = uid();
    await setDoc(doc(db, `${base}/categories`, id), { ...c, id });
    addNotification(`Category "${c.name}" added`);
  }, [base, addNotification]);

  const updateCategory = useCallback(async (id: string, updates: Partial<Category>) => {
    if (!base) return;
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    await setDoc(doc(db, `${base}/categories`, id), { ...cat, ...updates });
    addNotification("Category updated");
  }, [base, categories, addNotification]);

  const deleteCategory = useCallback(async (id: string) => {
    if (!base) return;
    await deleteDoc(doc(db, `${base}/categories`, id));
    addNotification("Category deleted", "info");
  }, [base, addNotification]);

  const addTransaction = useCallback(async (t: Omit<Transaction, "id">) => {
    if (!base) return;
    const id = uid();
    await setDoc(doc(db, `${base}/transactions`, id), { ...t, id });
    if (t.status === "paid" || t.status === "received") {
      const acc = accounts.find(a => a.id === t.accountId);
      if (acc) {
        const newBalance = t.type === "income" ? acc.balance + t.amount : acc.balance - t.amount;
        await setDoc(doc(db, `${base}/accounts`, acc.id), {
          ...acc, balance: parseFloat(newBalance.toFixed(2)),
          history: [...acc.history, { date: today, balance: parseFloat(newBalance.toFixed(2)) }]
        });
      }
    }
    addNotification(`Transaction "${t.name}" added`);
  }, [base, accounts, addNotification]);

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    if (!base) return;
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;
    const updated = { ...tx, ...updates };
    await setDoc(doc(db, `${base}/transactions`, id), updated);
    const wasUnpaid = tx.status === "not_paid" || tx.status === "not_received";
    const nowPaid = updated.status === "paid" || updated.status === "received";
    if (wasUnpaid && nowPaid) {
      const acc = accounts.find(a => a.id === updated.accountId);
      if (acc) {
        const newBalance = updated.type === "income" ? acc.balance + updated.amount : acc.balance - updated.amount;
        await setDoc(doc(db, `${base}/accounts`, acc.id), {
          ...acc, balance: parseFloat(newBalance.toFixed(2)),
          history: [...acc.history, { date: today, balance: parseFloat(newBalance.toFixed(2)) }]
        });
      }
    }
    addNotification("Transaction updated");
  }, [base, accounts, transactions, addNotification]);

  const deleteTransaction = useCallback(async (id: string) => {
    if (!base) return;
    await deleteDoc(doc(db, `${base}/transactions`, id));
    addNotification("Transaction deleted", "info");
  }, [base, addNotification]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearNotifications = useCallback(() => setNotifications([]), []);

  return (
    <AppContext.Provider value={{
      accounts, categories, transactions, notifications, loading,
      addAccount, updateAccount, deleteAccount, addHolding, deleteHolding,
      addCategory, updateCategory, deleteCategory,
      addTransaction, updateTransaction, deleteTransaction,
      addNotification, markNotificationRead, clearNotifications,
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
