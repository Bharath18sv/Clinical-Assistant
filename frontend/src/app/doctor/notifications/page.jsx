"use client";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import {
  Bell,
  CheckCheck,
  Loader2,
  Filter,
  BellOff,
  Calendar,
  MessageSquare,
  AlertCircle,
  Check,
} from "lucide-react";
import {
  getAllNotifications,
  getUnreadNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/utils/api/notification.api";
import toast from "react-hot-toast";

export default function NotificationsPage() {
  const { user, authLoading } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await getAllNotifications();
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Error fetching notifications", err);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(id) {
    if (!id) {
      toast.error("Invalid notification ID");
      return;
    }

    try {
      console.log("Attempting to mark notification as read:", id);

      // Optimistically update UI first
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );

      const res = await markNotificationAsRead(id);
      console.log("Mark as read response:", res);

      if (res?.success) {
        toast.success("Marked as read");
      } else {
        // If backend update failed, revert the optimistic update
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: false } : n))
        );
        toast.error(res?.message || "Failed to mark as read");
      }
    } catch (err) {
      console.error("Error marking as read:", {
        error: err,
        response: err.response?.data,
        status: err.response?.status,
      });

      // Revert optimistic update on error
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: false } : n))
      );

      // Show specific error message if available
      toast.error(err.response?.data?.message || "Failed to mark as read");
    }
  }

  async function handleMarkAllRead() {
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    if (unreadCount === 0) {
      toast.error("No unread notifications");
      return;
    }

    setMarkingAllRead(true);
    try {
      await markAllNotificationsAsRead();
      // Optimistically update all to read
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success(`${unreadCount} notifications marked as read`);
    } catch (err) {
      console.error("Error marking all as read", err);
      toast.error("Failed to mark all as read");
    } finally {
      setMarkingAllRead(false);
    }
  }

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading]);

  const filtered =
    filter === "all"
      ? notifications
      : notifications.filter((n) => n.isRead === (filter === "read"));

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotificationIcon = (notification) => {
    // You can customize this based on notification type
    if (notification.type === "appointment") return Calendar;
    if (notification.type === "message") return MessageSquare;
    if (notification.type === "alert") return AlertCircle;
    return Bell;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-6 px-4 sm:px-6 lg:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Notifications
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {unreadCount > 0 ? (
                    <span className="font-medium text-blue-600">
                      {unreadCount} unread notification
                      {unreadCount !== 1 ? "s" : ""}
                    </span>
                  ) : (
                    "You're all caught up!"
                  )}
                </p>
              </div>
            </div>

            {/* Mark All Read Button */}
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markingAllRead}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {markingAllRead ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCheck className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Mark all as read</span>
                <span className="sm:hidden">Mark all</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 mr-2">
              Filter:
            </span>
            {["all", "unread", "read"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  filter === f
                    ? "bg-blue-600 text-white shadow-md scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === "unread" && unreadCount > 0 && (
                  <span className="ml-1.5 px-2 py-0.5 bg-white/30 rounded-full text-xs">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">
              Loading notifications...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <BellOff className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No notifications found
            </h3>
            <p className="text-gray-600">
              {filter === "unread"
                ? "You have no unread notifications"
                : filter === "read"
                ? "No read notifications yet"
                : "You don't have any notifications yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((notification) => {
              const Icon = getNotificationIcon(notification);
              return (
                <div
                  key={notification._id}
                  className={`bg-white rounded-xl shadow-md border transition-all hover:shadow-lg ${
                    notification.isRead
                      ? "border-gray-200 bg-gray-50/50"
                      : "border-blue-200 bg-blue-50/30"
                  }`}
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${
                          notification.isRead ? "bg-gray-200" : "bg-blue-100"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 sm:w-6 sm:h-6 ${
                            notification.isRead
                              ? "text-gray-500"
                              : "text-blue-600"
                          }`}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <p
                            className={`text-sm sm:text-base ${
                              notification.isRead
                                ? "text-gray-700"
                                : "text-gray-900 font-medium"
                            }`}
                          >
                            {notification.message}
                          </p>
                          {!notification.isRead && (
                            <div className="flex-shrink-0 w-2.5 h-2.5 bg-blue-600 rounded-full mt-1.5" />
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <p className="text-xs text-gray-500">
                            {new Date(
                              notification.createdAt
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>

                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkRead(notification._id)}
                              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats Footer (Optional) */}
        {notifications.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Showing {filtered.length} of {notifications.length} notification
              {notifications.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
