import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { X, Bell, CheckCircle2, AlertCircle, Clock, DollarSign, Share2, AlertTriangle } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { useState } from "react";

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "payment",
      title: "Payment Successful",
      message: "Your payment of ₹179 for Spotify Family was processed successfully.",
      time: "2 hours ago",
      read: false,
      icon: CheckCircle2,
      color: "green",
    },
    {
      id: 2,
      type: "alert",
      title: "Auto-pay Enabled",
      message: "Auto-pay has been enabled for your Disney+ Hotstar subscription.",
      time: "3 hours ago",
      read: false,
      icon: Bell,
      color: "blue",
    },
    {
      id: 3,
      type: "reminder",
      title: "Upcoming Renewal",
      message: "Netflix Premium will renew in 4 days for ₹649.",
      time: "5 hours ago",
      read: false,
      icon: Clock,
      color: "orange",
    },
    {
      id: 4,
      type: "share",
      title: "Shared Subscription Invite",
      message: "Priya Sharma has invited you to share a subscription for Amazon Prime.",
      time: "1 day ago",
      read: true,
      icon: Share2,
      color: "blue",
    },
    {
      id: 5,
      type: "warning",
      title: "Payment Failed",
      message: "Your payment for YouTube Premium failed. Please update your payment method.",
      time: "1 day ago",
      read: true,
      icon: AlertTriangle,
      color: "red",
    },
    {
      id: 6,
      type: "refund",
      title: "Refund Processed",
      message: "A refund of ₹489 for Microsoft 365 has been processed to your account.",
      time: "2 days ago",
      read: true,
      icon: DollarSign,
      color: "green",
    },
    {
      id: 7,
      type: "payment",
      title: "Payment Successful",
      message: "Your payment of ₹299 for Disney+ Hotstar was processed successfully.",
      time: "3 days ago",
      read: true,
      icon: CheckCircle2,
      color: "green",
    },
  ]);

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
              {notifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer`}
                    style={!notification.read ? { backgroundColor: 'rgba(95, 125, 110, 0.05)' } : {}}
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
            <Button variant="outline" className="w-full text-sm" style={{ borderColor: 'rgba(95, 125, 110, 0.3)', color: '#5F7D6E' }}>
              Mark All as Read
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}