import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { X, Bell, CheckCircle2, AlertCircle, Clock, DollarSign, Share2, AlertTriangle } from "lucide-react";
import { ScrollArea } from "./ui/ScrollArea";
import { useState, useEffect } from "react";
import { api } from "../../lib/api";

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  color: string;
}

export default function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await api.get<{ notifications: Notification[] }>('/api/notifications');
      setNotifications(data.notifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/api/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const markAsRead = async (id: number) => {
    const notif = notifications.find(n => n.id === id);
    if (!notif || notif.read) return;

    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "payment": return CheckCircle2;
      case "alert": return Bell;
      case "reminder": return Clock;
      case "share": return Share2;
      case "warning": return AlertTriangle;
      case "refund": return DollarSign;
      default: return AlertCircle;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 right-6 z-50 w-96">
      <Card className="shadow-2xl border-2" style={{ borderColor: 'rgba(95, 125, 110, 0.15)' }}>
        <CardHeader className="pb-3 border-b" style={{ backgroundColor: '#F7F6F3', borderColor: 'rgba(95, 125, 110, 0.15)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" style={{ color: '#5F7D6E' }} />
              <CardTitle className="text-base" style={{ color: '#1F2933' }}>Notifications</CardTitle>
              {unreadCount > 0 && (
                <Badge className="border-0" style={{ backgroundColor: '#E3B587', color: '#1F2933' }}>{unreadCount}</Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <div className="divide-y" style={{ borderColor: 'rgba(95, 125, 110, 0.1)' }}>
              {loading && <div className="p-4 text-center text-sm text-gray-500">Loading notifications...</div>}
              {!loading && notifications.length === 0 && (
                <div className="p-4 text-center text-sm text-gray-500">No notifications yet.</div>
              )}
              {!loading && notifications.map((notification) => {
                const Icon = getIcon(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer`}
                    style={!notification.read ? { backgroundColor: 'rgba(95, 125, 110, 0.05)' } : {}}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: notification.color === "green"
                            ? "rgba(95, 125, 110, 0.1)"
                            : notification.color === "orange"
                            ? "rgba(227, 181, 135, 0.15)"
                            : notification.color === "red"
                            ? "rgba(220, 38, 38, 0.1)"
                            : "rgba(95, 125, 110, 0.1)"
                        }}
                      >
                        <Icon
                          className="w-5 h-5"
                          style={{
                            color: notification.color === "green"
                              ? "#5F7D6E"
                              : notification.color === "orange"
                              ? "#E3B587"
                              : notification.color === "red"
                              ? "#DC2626"
                              : "#5F7D6E"
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-medium text-sm" style={{ color: '#1F2933' }}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: '#E3B587' }} />
                          )}
                        </div>
                        <p className="text-sm" style={{ color: '#6B7280' }}>{notification.message}</p>
                        <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>{notification.time}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          <div className="p-3 border-t" style={{ backgroundColor: '#F7F6F3', borderColor: 'rgba(95, 125, 110, 0.15)' }}>
            <Button variant="outline" className="w-full text-sm" onClick={markAllAsRead} style={{ borderColor: 'rgba(95, 125, 110, 0.3)', color: '#5F7D6E' }}>
              Mark All as Read
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

