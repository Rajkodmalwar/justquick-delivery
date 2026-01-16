import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic'

// =====================================
// GET — Logged-in Users Only
// Returns notifications based on user role
// =====================================
export async function GET(req: Request) {
  try {
    const supabase = await getSupabaseServer();
    const { searchParams } = new URL(req.url);
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userRole = user.user_metadata?.role || 'buyer';
    const userId = user.id;
    
    // Build query based on user role
    let query = supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });
    
    // Apply filters based on role
    if (userRole === 'admin') {
      query = query.or(`receiver_id.eq.${userId},receiver_role.eq.all,receiver_role.eq.admin`);
    } else {
      query = query.or(`and(receiver_role.eq.${userRole},receiver_id.eq.${userId}),and(receiver_role.eq.${userRole},receiver_id.is.null),receiver_id.eq.${userId}`);
    }
    
    // Optional filters
    const isRead = searchParams.get("is_read");
    const limit = searchParams.get("limit") || "50";
    
    if (isRead) {
      query = query.eq("is_read", isRead === "true");
    }
    
    query = query.limit(parseInt(limit));
    
    const { data: notifications, error } = await query;
    
    if (error) {
      console.error("Error fetching notifications:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Get unread count
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false)
      .or(`receiver_id.eq.${userId},receiver_role.eq.${userRole},receiver_role.eq.all`);
    
    return NextResponse.json({
      notifications: notifications || [],
      unread_count: count || 0,
      user_role: userRole
    });
    
  } catch (error: any) {
    console.error("GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// =====================================
// POST — Send Notification (Admin Only)
// =====================================
export async function POST(req: Request) {
  try {
    const supabaseAdmin = await getSupabaseAdmin();
    const supabaseServer = await getSupabaseServer();
    
    // Verify admin
    const { data: { user } } = await supabaseServer.auth.getUser();
    const userRole = user?.user_metadata?.role;
    
    if (userRole !== 'admin') {
      return NextResponse.json({ error: "Access denied. Admin only." }, { status: 403 });
    }
    
    const payload = await req.json();
    
    // Validate payload
    const { receiver_role, receiver_id, title, message, metadata = {} } = payload;
    
    if (!receiver_role || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields: receiver_role, title, message" },
        { status: 400 }
      );
    }
    
    // Validate receiver role
    const validRoles = ['buyer', 'vendor', 'delivery', 'admin', 'all'];
    if (!validRoles.includes(receiver_role)) {
      return NextResponse.json(
        { error: "Invalid receiver_role. Must be: buyer, vendor, delivery, admin, or all" },
        { status: 400 }
      );
    }
    
    // If receiver_id is provided, verify the user exists for that role
    if (receiver_id && receiver_role !== 'all') {
      const { data: targetUser } = await supabaseAdmin.auth.admin.getUserById(receiver_id);
      if (!targetUser) {
        return NextResponse.json({ error: "Receiver user not found" }, { status: 404 });
      }
    }
    
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
      console.error("Error inserting notification:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Broadcast realtime event
    const broadcastChannel = receiver_role === 'all' 
      ? 'notifications-all' 
      : receiver_id 
        ? `notifications-user-${receiver_id}`
        : `notifications-${receiver_role}`;
    
    const channel = supabaseAdmin.channel(broadcastChannel);
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'new-notification',
          payload: notification
        });
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      notification,
      message: "Notification sent and broadcasted"
    });
    
  } catch (error: any) {
    console.error("POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// =====================================
// PATCH — Mark Notifications as Read
// =====================================
export async function PATCH(req: Request) {
  try {
    const supabase = await getSupabaseServer();
    const { searchParams } = new URL(req.url);
    const body = await req.json();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = user.id;
    const userRole = user.user_metadata?.role || 'buyer';
    
    const { notification_id, mark_all } = body;
    
    let updateQuery;
    
    if (mark_all) {
      // Mark all user's notifications as read
      updateQuery = supabase
        .from("notifications")
        .update({ is_read: true })
        .or(`receiver_id.eq.${userId},and(receiver_role.eq.${userRole},receiver_id.is.null)`)
        .eq("is_read", false);
    } else if (notification_id) {
      // Mark single notification as read
      // First verify user has access to this notification
      const { data: notification } = await supabase
        .from("notifications")
        .select("*")
        .eq("id", notification_id)
        .single();
      
      if (!notification) {
        return NextResponse.json({ error: "Notification not found" }, { status: 404 });
      }
      
      // Check permission
      const hasPermission = 
        notification.receiver_id === userId ||
        (notification.receiver_role === userRole && !notification.receiver_id) ||
        userRole === 'admin';
      
      if (!hasPermission) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
      
      updateQuery = supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notification_id);
    } else {
      return NextResponse.json(
        { error: "Either notification_id or mark_all must be provided" },
        { status: 400 }
      );
    }
    
    const { error } = await updateQuery;
    
    if (error) {
      console.error("Error updating notification:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: mark_all ? "All notifications marked as read" : "Notification marked as read" 
    });
    
  } catch (error: any) {
    console.error("PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// =====================================
// OPTIONS — CORS support
// =====================================
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}