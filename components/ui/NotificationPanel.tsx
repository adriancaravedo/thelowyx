"use client";
import { useState } from "react";
import { Bell, X, CheckCheck } from "lucide-react";
import { useApp } from "@/store/AppContext";

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const { notifications, markNotificationRead, clearNotifications } = useApp();
  const unread = notifications.filter(n => !n.read).length;

  const typeColor = { success: "#22c55e", error: "#ef4444", info: "#3b82f6" };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen(o => !o);
          notifications.forEach(n => markNotificationRead(n.id));
        }}
        className="relative p-1"
      >
        <Bell size={20} className="text-gray-500" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 w-72 bg-white rounded-2xl shadow-xl z-50 overflow-hidden border border-gray-100">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="font-semibold text-sm">Notifications</span>
              <div className="flex gap-2">
                {notifications.length > 0 && (
                  <button onClick={clearNotifications} className="text-gray-400 hover:text-gray-600">
                    <CheckCheck size={15} />
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={15} />
                </button>
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">No notifications</div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: typeColor[n.type] }} />
                    <span className="text-sm text-gray-700">{n.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
