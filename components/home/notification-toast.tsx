"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

interface NotificationToastProps {
  notification: any | null
  show: boolean
  onDismiss: () => void
}

export function NotificationToast({ notification, show, onDismiss }: NotificationToastProps) {
  useEffect(() => {
    if (!show) return
    const timer = setTimeout(onDismiss, 5000)
    return () => clearTimeout(timer)
  }, [show, onDismiss])

  if (!show || !notification) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-5 duration-300">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-lg shadow-2xl shadow-cyan-500/20 p-4 max-w-sm backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 flex-shrink-0 mt-0.5">
            <Bell className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-white">{notification.title}</h4>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              {notification.message}
            </p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-slate-500">Just now</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={onDismiss}
                className="h-6 text-xs text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
