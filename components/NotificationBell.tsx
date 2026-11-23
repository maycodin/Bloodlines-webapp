"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BellRing, Bell, CheckCheck, X, Loader2 } from "lucide-react";
import { notifications, AppNotification } from "@/lib/api";
import { timeAgo } from "@/lib/requests";

const REFRESH_MS = 60000;

type Tab = "unread" | "all";

export default function NotificationBell() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("unread");
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(
    () =>
      notifications
        .list(1, 30)
        .then((result) => {
          setItems(result.data);
          setUnreadCount(result.unreadCount || result.data.filter((n) => !n.read).length);
          setFailed(false);
        })
        .catch(() => setFailed(true)),
    []
  );

  useEffect(() => {
    const first = setTimeout(load, 0);
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, REFRESH_MS);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [load]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const openPanel = async () => {
    setOpen((o) => !o);
    if (!open) {
      setLoading(true);
      await load();
      setLoading(false);
    }
  };

  const markRead = async (item: AppNotification) => {
    if (item.read) return;
    setItems((all) => all.map((n) => (n._id === item._id ? { ...n, read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    await notifications.markRead(item._id).catch(load);
  };

  const markAllRead = async () => {
    setItems((all) => all.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    await notifications.markAllRead().catch(load);
  };

  const shown = tab === "unread" ? items.filter((n) => !n.read) : items;

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={openPanel}
        aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"}
        className="relative p-2 rounded-lg text-[#1E7B3A] dark:text-[#34C759] hover:bg-green-50 dark:hover:bg-white/10"
      >
        <BellRing className="w-6 h-6" fill="currentColor" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#D32F2F] text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 md:absolute md:inset-auto md:right-0 md:mt-2 md:w-96 md:max-h-[70vh] bg-white md:border md:border-gray-200 md:rounded-xl md:shadow-xl z-[60] flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="flex items-center gap-1 text-xs font-medium text-[#C91E1E] px-2 py-1 rounded hover:bg-red-50">
                  <CheckCheck className="w-4 h-4" /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} aria-label="Close notifications" className="p-1 text-gray-500 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 text-sm font-semibold border-b border-gray-200">
            {(["unread", "all"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`py-3 border-b-2 ${tab === t ? "border-[#C91E1E] text-[#C91E1E]" : "border-transparent text-gray-500"}`}
              >
                {t === "unread" ? `Unread${unreadCount ? ` (${unreadCount})` : ""}` : "All"}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading && items.length === 0 ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-[#C91E1E]" />
              </div>
            ) : failed && items.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-12 px-6">Could not load notifications. Please try again later.</p>
            ) : shown.length === 0 ? (
              <div className="text-center py-12 px-6">
                <Bell className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="font-semibold text-gray-900">{tab === "unread" ? "No unread notifications" : "No notifications yet"}</p>
                <p className="text-sm text-gray-500 mt-1">We&apos;ll notify you when urgent blood requests or updates match your profile.</p>
              </div>
            ) : (
              shown.map((item) => (
                <button
                  key={item._id}
                  onClick={() => markRead(item)}
                  className={`w-full text-left flex gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${item.read ? "" : "bg-green-50"}`}
                >
                  <span className="shrink-0 w-9 h-9 rounded-full bg-green-100 text-[#1E7B3A] flex items-center justify-center">
                    <BellRing className="w-4 h-4" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="flex items-start justify-between gap-2">
                      <span className={`text-sm text-gray-900 ${item.read ? "" : "font-semibold"}`}>{item.title}</span>
                      <span className="shrink-0 text-xs text-gray-500">{timeAgo(item.createdAt)}</span>
                    </span>
                    {item.body && <span className="block text-sm text-gray-600 mt-0.5 line-clamp-2">{item.body}</span>}
                  </span>
                  {!item.read && <span className="shrink-0 w-2 h-2 mt-2 rounded-full bg-[#D32F2F]" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
