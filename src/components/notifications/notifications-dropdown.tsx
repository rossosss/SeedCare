"use client";

import { useEffect, useState } from "react";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  async function loadNotifications() {
    setIsLoading(true);
    const response = await fetch("/api/notifications");

    if (response.ok) {
      const data = (await response.json()) as {
        notifications: NotificationItem[];
        unreadCount: number;
      };
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    }

    setIsLoading(false);
  }

  useEffect(() => {
    void loadNotifications();
  }, []);

  async function markAllAsRead() {
    await fetch("/api/notifications/read-all", { method: "PATCH" });
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
  }

  async function markAsRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );
    setUnreadCount((current) => Math.max(0, current - 1));
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="relative min-h-10 rounded-md border border-leaf-100 bg-white px-3 py-2 text-sm font-semibold text-leaf-700 transition hover:border-leaf-500"
        onClick={() => {
          setIsOpen((current) => !current);
          if (!isOpen) {
            void loadNotifications();
          }
        }}
        aria-label="Уведомления"
      >
        🔔
        {unreadCount > 0 ? (
          <span className="absolute -right-2 -top-2 rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-bold text-stone-900">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-30 mt-2 w-[min(360px,calc(100vw-2rem))] rounded-lg border border-leaf-100 bg-white p-4 shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <p className="font-bold text-leaf-700">Уведомления</p>
            <button
              type="button"
              className="text-sm font-semibold text-leaf-700 hover:text-leaf-500"
              onClick={markAllAsRead}
            >
              Прочитать все
            </button>
          </div>

          <div className="mt-4 max-h-96 space-y-3 overflow-y-auto">
            {isLoading ? (
              <p className="text-sm text-stone-500">Загружаем...</p>
            ) : notifications.length === 0 ? (
              <p className="text-sm leading-6 text-stone-600">Пока уведомлений нет.</p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  className={`block w-full rounded-md p-3 text-left transition ${
                    notification.isRead ? "bg-stone-50" : "bg-leaf-50"
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <p className="font-semibold text-leaf-700">{notification.title}</p>
                  <p className="mt-1 text-sm leading-6 text-stone-600">{notification.message}</p>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
