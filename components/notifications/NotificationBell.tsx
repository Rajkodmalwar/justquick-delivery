"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCircle, Package, Truck, Store, ShoppingCart, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  receiver_id: string | null;  // Add this
  receiver_role: string;
  title: string;
  message: string;
  metadata: any;
  is_read: boolean;
  created_at: string;
}

interface NotificationBellProps {
  userId: string;
  userRole: string;
}

export default function NotificationBell({ userId, userRole }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  // Fetch initial notifications
  useEffect(() => {
    fetchNotifications();
    setupRealtimeSubscription();
  }, [userId, userRole]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/notifications?limit=10`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!userId) return;

    // Subscribe to role-specific channel
    const roleChannel = supabase.channel(`notifications-${userRole}`);
    
    // Subscribe to user-specific channel
    const userChannel = supabase.channel(`notifications-user-${userId}`);
    
    // Subscribe to 'all' channel for admins
    const allChannel = userRole === 'admin' 
      ? supabase.channel('notifications-all')
      : null;

    // Role channel subscription
    roleChannel
      .on('broadcast', { event: 'new-notification' }, (payload) => {
        if (!payload.payload.receiver_id || payload.payload.receiver_id === userId) {
          handleNewNotification(payload.payload);
        }
      })
      .subscribe();

    // User channel subscription
    userChannel
      .on('broadcast', { event: 'new-notification' }, (payload) => {
        handleNewNotification(payload.payload);
      })
      .subscribe();

    // All channel subscription (admin only)
    if (allChannel) {
      allChannel
        .on('broadcast', { event: 'new-notification' }, (payload) => {
          handleNewNotification(payload.payload);
        })
        .subscribe();
    }

    // Subscribe to database changes (fallback)
    const dbChannel = supabase
      .channel('db-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: userRole === 'admin' 
            ? `receiver_role=in.(${userRole},all)` 
            : `receiver_role=eq.${userRole}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          if (!newNotification.receiver_id || newNotification.receiver_id === userId) {
            handleNewNotification(newNotification);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roleChannel);
      supabase.removeChannel(userChannel);
      if (allChannel) supabase.removeChannel(allChannel);
      supabase.removeChannel(dbChannel);
    };
  };

  const handleNewNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Show desktop notification if browser supports it
    if (Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.message,
        icon: "/logo.png"
      });
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_id: notificationId })
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mark_all: true })
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, is_read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Navigate based on metadata
    if (notification.metadata?.action) {
      router.push(notification.metadata.action);
    } else if (notification.metadata?.order_id) {
      if (userRole === 'admin') {
        router.push(`/admin/dashboard?tab=orders&order=${notification.metadata.order_id}`);
      } else if (userRole === 'vendor') {
        router.push(`/vendor/dashboard?order=${notification.metadata.order_id}`);
      } else if (userRole === 'delivery') {
        router.push(`/delivery/orders/${notification.metadata.order_id}`);
      } else {
        router.push(`/orders/${notification.metadata.order_id}`);
      }
    }

    setDropdownOpen(false);
  };

  const getNotificationIcon = (notification: Notification) => {
    const type = notification.metadata?.type;
    
    switch (type) {
      case 'order_placed':
      case 'order_accepted':
      case 'order_ready':
      case 'order_delivered':
        return <ShoppingCart className="h-4 w-4" />;
      case 'delivery_assigned':
      case 'order_picked_up':
        return <Truck className="h-4 w-4" />;
      case 'low_stock':
        return <Package className="h-4 w-4" />;
      case 'new_user':
        return <User className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[400px] overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-auto p-0 text-xs"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        ) : (
          <>
            {notifications.slice(0, 10).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start p-3 cursor-pointer ${!notification.is_read ? 'bg-accent/10' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start w-full gap-2">
                  <div className="mt-0.5">
                    {getNotificationIcon(notification)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-sm font-medium truncate ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </p>
                      {!notification.is_read && (
                        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </span>
                      {notification.metadata?.type && (
                        <Badge variant="outline" className="text-xs capitalize">
                          {notification.metadata.type.replace(/_/g, ' ')}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}

            {notifications.length > 10 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    router.push("/notifications");
                    setDropdownOpen(false);
                  }}
                  className="justify-center text-center cursor-pointer"
                >
                  View all notifications
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}