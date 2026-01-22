"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { logger } from "@/lib/logger"
import { Bell, Send, User, Store, Truck } from "lucide-react"

const fetcher = (u: string) => fetch(u).then((r) => r.json())

export default function AdminNotifications() {
  const { data: notificationsData, mutate: mutateNotifications } = useSWR(
    "/api/notifications?receiver_role=admin&limit=10",
    fetcher,
  )
  const [targetType, setTargetType] = useState<"buyer" | "vendor" | "delivery" | "all">("buyer")
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)

  async function sendNotification() {
    if (!title || !message) {
      alert("Please enter title and message")
      return
    }
    setSending(true)
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          receiver_role: targetType === "all" ? "all" : targetType,
          title, 
          message,
          metadata: { type: 'admin_broadcast' }
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Failed to send: ${error.error}`)
        return
      }
      
      setTitle("")
      setMessage("")
      mutateNotifications()
      alert(`Notification sent to ${targetType === "all" ? "all users" : targetType + 's'}!`)
    } catch (error) {
      logger.error("Send error:", error)
      alert("Failed to send notification")
    } finally {
      setSending(false)
    }
  }

  const notifications = notificationsData?.notifications || []

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Notification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Send To</label>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => setTargetType("buyer")}
                className={`p-3 rounded-xl border-2 transition text-sm font-medium ${
                  targetType === "buyer" ? "border-primary bg-primary/10 text-primary" : "border-border"
                }`}
              >
                <User className="h-5 w-5 mx-auto mb-1" />
                Users
              </button>
              <button
                onClick={() => setTargetType("vendor")}
                className={`p-3 rounded-xl border-2 transition text-sm font-medium ${
                  targetType === "vendor" ? "border-primary bg-primary/10 text-primary" : "border-border"
                }`}
              >
                <Store className="h-5 w-5 mx-auto mb-1" />
                Vendors
              </button>
              <button
                onClick={() => setTargetType("delivery")}
                className={`p-3 rounded-xl border-2 transition text-sm font-medium ${
                  targetType === "delivery" ? "border-primary bg-primary/10 text-primary" : "border-border"
                }`}
              >
                <Truck className="h-5 w-5 mx-auto mb-1" />
                Drivers
              </button>
              <button
                onClick={() => setTargetType("all")}
                className={`p-3 rounded-xl border-2 transition text-sm font-medium ${
                  targetType === "all" ? "border-primary bg-primary/10 text-primary" : "border-border"
                }`}
              >
                <Bell className="h-5 w-5 mx-auto mb-1" />
                All
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title"
              className="bg-secondary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message..."
              className="bg-secondary min-h-24"
            />
          </div>

          <Button onClick={sendNotification} className="w-full" disabled={sending}>
            {sending ? (
              "Sending..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send to {targetType === "all" ? "all users" : targetType + 's'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recent Admin Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No notifications yet</p>
          ) : (
            notifications.map((n: any) => (
              <div key={n.id} className="p-3 rounded-xl bg-secondary/30 border border-border">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {n.receiver_role}
                      </Badge>
                      {n.metadata?.type && (
                        <Badge variant="secondary" className="text-xs">
                          {n.metadata.type}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs whitespace-nowrap">
                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}