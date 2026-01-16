import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "./supabase/server";

export type NotificationRole = 'buyer' | 'vendor' | 'delivery' | 'admin' | 'all';

export interface NotificationPayload {
  receiver_role: NotificationRole;
  receiver_id?: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface OrderNotificationData {
  order_id: string;
  shop_id?: string;
  shop_name?: string;
  buyer_name?: string;
  delivery_boy_id?: string;
  delivery_boy_name?: string;
  amount?: number;
}

/**
 * Send a notification and broadcast it via realtime
 */
export async function sendNotification(payload: NotificationPayload) {
  try {
    const supabaseAdmin = await getSupabaseAdmin();
    
    const { receiver_role, receiver_id, title, message, metadata = {} } = payload;
    
    // Insert notification
    const { data: notification, error } = await supabaseAdmin
      .from("notifications")
      .insert({
        receiver_role,
        receiver_id: receiver_role === 'all' ? null : receiver_id,
        title,
        message,
        metadata,
        is_read: false
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error sending notification:", error);
      throw error;
    }
    
    // Broadcast via realtime
    await broadcastNotification(notification);
    
    return notification;
  } catch (error) {
    console.error("Failed to send notification:", error);
    throw error;
  }
}

/**
 * Broadcast notification via appropriate Supabase channel
 */
async function broadcastNotification(notification: any) {
  try {
    const supabaseAdmin = await getSupabaseAdmin();
    
    let channelName: string;
    
    if (notification.receiver_role === 'all') {
      channelName = 'notifications-all';
    } else if (notification.receiver_id) {
      channelName = `notifications-user-${notification.receiver_id}`;
    } else {
      channelName = `notifications-${notification.receiver_role}`;
    }
    
    const channel = supabaseAdmin.channel(channelName);
    
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'new-notification',
          payload: notification
        });
        
        // Unsubscribe after sending
        setTimeout(() => {
          supabaseAdmin.removeChannel(channel);
        }, 1000);
      }
    });
  } catch (error) {
    console.error("Failed to broadcast notification:", error);
  }
}

// =====================================
// HELPER FUNCTIONS FOR SPECIFIC EVENTS
// =====================================

export async function orderPlaced(data: OrderNotificationData) {
  const { order_id, shop_id, buyer_name } = data;
  
  // Notify admin
  await sendNotification({
    receiver_role: 'admin',
    title: "New Order Placed",
    message: `New order #${order_id.slice(0, 8)} from ${buyer_name || 'a customer'}`,
    metadata: {
      type: 'order_placed',
      order_id,
      shop_id,
      action: `/admin/dashboard?tab=orders&order=${order_id}`
    }
  });
  
  // Notify vendor (shop owner)
  if (shop_id) {
    await sendNotification({
      receiver_role: 'vendor',
      receiver_id: shop_id,
      title: "New Order Received",
      message: `You have a new order #${order_id.slice(0, 8)}`,
      metadata: {
        type: 'order_placed',
        order_id,
        action: `/vendor/dashboard?order=${order_id}`
      }
    });
  }
}

export async function orderAccepted(data: OrderNotificationData) {
  const { order_id, shop_name, buyer_name } = data;
  
  // Notify buyer
  await sendNotification({
    receiver_role: 'buyer',
    receiver_id: data.order_id?.split('_')[0], // Assuming order ID contains buyer ID
    title: "Order Accepted",
    message: `Your order #${order_id.slice(0, 8)} has been accepted by ${shop_name || 'the shop'}`,
    metadata: {
      type: 'order_accepted',
      order_id,
      action: `/orders/${order_id}`
    }
  });
  
  // Notify admin
  await sendNotification({
    receiver_role: 'admin',
    title: "Order Accepted",
    message: `Order #${order_id.slice(0, 8)} accepted by vendor`,
    metadata: {
      type: 'order_accepted',
      order_id,
      action: `/admin/dashboard?tab=orders&order=${order_id}`
    }
  });
}

export async function orderRejected(data: OrderNotificationData) {
  const { order_id, shop_name } = data;
  
  // Notify buyer
  await sendNotification({
    receiver_role: 'buyer',
    receiver_id: data.order_id?.split('_')[0],
    title: "Order Rejected",
    message: `Your order #${order_id.slice(0, 8)} was rejected by ${shop_name || 'the shop'}`,
    metadata: {
      type: 'order_rejected',
      order_id,
      action: `/orders/${order_id}`
    }
  });
  
  // Notify admin
  await sendNotification({
    receiver_role: 'admin',
    title: "Order Rejected",
    message: `Order #${order_id.slice(0, 8)} rejected by vendor`,
    metadata: {
      type: 'order_rejected',
      order_id,
      action: `/admin/dashboard?tab=orders&order=${order_id}`
    }
  });
}

export async function orderReady(data: OrderNotificationData) {
  const { order_id, shop_name } = data;
  
  // Notify buyer
  await sendNotification({
    receiver_role: 'buyer',
    receiver_id: data.order_id?.split('_')[0],
    title: "Order Ready for Pickup",
    message: `Your order #${order_id.slice(0, 8)} is ready for pickup from ${shop_name || 'the shop'}`,
    metadata: {
      type: 'order_ready',
      order_id,
      action: `/orders/${order_id}`
    }
  });
  
  // Notify admin
  await sendNotification({
    receiver_role: 'admin',
    title: "Order Ready for Pickup",
    message: `Order #${order_id.slice(0, 8)} is ready for delivery`,
    metadata: {
      type: 'order_ready',
      order_id,
      action: `/admin/dashboard?tab=orders&order=${order_id}`
    }
  });
}

export async function deliveryAssigned(data: OrderNotificationData) {
  const { order_id, delivery_boy_id, delivery_boy_name } = data;
  
  if (!delivery_boy_id) return;
  
  // Notify delivery boy
  await sendNotification({
    receiver_role: 'delivery',
    receiver_id: delivery_boy_id,
    title: "New Delivery Assigned",
    message: `You have been assigned to deliver order #${order_id.slice(0, 8)}`,
    metadata: {
      type: 'delivery_assigned',
      order_id,
      action: `/delivery/orders/${order_id}`
    }
  });
  
  // Notify buyer
  await sendNotification({
    receiver_role: 'buyer',
    receiver_id: data.order_id?.split('_')[0],
    title: "Delivery Boy Assigned",
    message: `${delivery_boy_name || 'A delivery boy'} has been assigned to your order`,
    metadata: {
      type: 'delivery_assigned',
      order_id,
      action: `/orders/${order_id}`
    }
  });
  
  // Notify admin
  await sendNotification({
    receiver_role: 'admin',
    title: "Delivery Assigned",
    message: `Order #${order_id.slice(0, 8)} assigned to ${delivery_boy_name || 'delivery boy'}`,
    metadata: {
      type: 'delivery_assigned',
      order_id,
      action: `/admin/dashboard?tab=orders&order=${order_id}`
    }
  });
}

export async function orderPickedUp(data: OrderNotificationData) {
  const { order_id, delivery_boy_name } = data;
  
  // Notify buyer
  await sendNotification({
    receiver_role: 'buyer',
    receiver_id: data.order_id?.split('_')[0],
    title: "Order Picked Up",
    message: `${delivery_boy_name || 'Delivery boy'} has picked up your order #${order_id.slice(0, 8)}`,
    metadata: {
      type: 'order_picked_up',
      order_id,
      action: `/orders/${order_id}`
    }
  });
  
  // Notify admin
  await sendNotification({
    receiver_role: 'admin',
    title: "Order Picked Up",
    message: `Order #${order_id.slice(0, 8)} has been picked up for delivery`,
    metadata: {
      type: 'order_picked_up',
      order_id,
      action: `/admin/dashboard?tab=orders&order=${order_id}`
    }
  });
}

export async function orderDelivered(data: OrderNotificationData) {
  const { order_id, delivery_boy_name, amount } = data;
  
  // Notify buyer
  await sendNotification({
    receiver_role: 'buyer',
    receiver_id: data.order_id?.split('_')[0],
    title: "Order Delivered",
    message: `Your order #${order_id.slice(0, 8)} has been delivered by ${delivery_boy_name || 'delivery boy'}`,
    metadata: {
      type: 'order_delivered',
      order_id,
      amount,
      action: `/orders/${order_id}`
    }
  });
  
  // Notify admin
  await sendNotification({
    receiver_role: 'admin',
    title: "Order Delivered",
    message: `Order #${order_id.slice(0, 8)} has been delivered successfully`,
    metadata: {
      type: 'order_delivered',
      order_id,
      amount,
      action: `/admin/dashboard?tab=orders&order=${order_id}`
    }
  });
  
  // Notify vendor
  if (data.shop_id) {
    await sendNotification({
      receiver_role: 'vendor',
      receiver_id: data.shop_id,
      title: "Order Delivered",
      message: `Order #${order_id.slice(0, 8)} has been delivered to customer`,
      metadata: {
        type: 'order_delivered',
        order_id,
        amount,
        action: `/vendor/dashboard?order=${order_id}`
      }
    });
  }
}

export async function lowStockAlert(shop_id: string, product_name: string) {
  await sendNotification({
    receiver_role: 'vendor',
    receiver_id: shop_id,
    title: "Low Stock Alert",
    message: `${product_name} is running low on stock`,
    metadata: {
      type: 'low_stock',
      product_name,
      action: `/vendor/dashboard?tab=products`
    }
  });
}

export async function newUserRegistered(user_id: string, user_role: NotificationRole, user_name: string) {
  await sendNotification({
    receiver_role: 'admin',
    title: "New User Registered",
    message: `${user_name} has registered as a ${user_role}`,
    metadata: {
      type: 'new_user',
      user_id,
      user_role,
      action: `/admin/dashboard?tab=users`
    }
  });
}

/**
 * Utility function to get unread count
 */
export async function getUnreadCount(userId: string, userRole: string): Promise<number> {
  try {
    const supabaseAdmin = await getSupabaseAdmin();
    
    const { count } = await supabaseAdmin
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false)
      .or(`receiver_id.eq.${userId},and(receiver_role.eq.${userRole},receiver_id.is.null)`);
    
    return count || 0;
  } catch (error) {
    console.error("Error getting unread count:", error);
    return 0;
  }
}