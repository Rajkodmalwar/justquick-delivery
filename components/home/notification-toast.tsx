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
      <div className="bg-white border border-slate-200 rounded-lg p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 flex-shrink-0 mt-0.5">
            <Bell className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-slate-900">{notification.title}</h4>
            <p className="text-xs text-slate-600 mt-1 line-clamp-2">
              {notification.message}
            </p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-slate-500">Just now</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={onDismiss}
                className="h-6 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100"
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
