"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { useToast } from "@/hooks/use-toast"
import { logger } from "@/lib/logger"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { IndianRupee, Settings, Bell, Shield, Globe } from "lucide-react"

const fetcher = (u: string) => fetch(u).then((r) => r.json())

export default function AdminSettings() {
  const { toast } = useToast()
  const { data, error, isLoading, mutate: mutateSettings } = useSWR("/api/settings", fetcher)
  
  // All settings state
  const [deliveryFee, setDeliveryFee] = useState("30")
  const [platformFee, setPlatformFee] = useState("10")
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [autoAssign, setAutoAssign] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [twoFactorAuth, setTwoFactorAuth] = useState(false)
  const [ipRestriction, setIpRestriction] = useState(false)
  
  const [saving, setSaving] = useState(false)
  const [savingField, setSavingField] = useState<string | null>(null)

  // Initialize state from API data
  useEffect(() => {
    if (data) {
      logger.log("Settings data loaded:", data)
      
      // Set all settings from API response
      setDeliveryFee(data.delivery_fee?.toString() || "30")
      setPlatformFee(data.platform_fee?.toString() || "10")
      setMaintenanceMode(data.maintenance_mode === true)
      setAutoAssign(data.auto_assign === true)
      setEmailNotifications(data.email_notifications === true)
      setPushNotifications(data.push_notifications === true)
      setTwoFactorAuth(data.two_factor_auth === true)
      setIpRestriction(data.ip_restriction === true)
    }
  }, [data])

  // Save a single setting
  async function saveSetting(key: string, value: string | boolean | number) {
    setSaving(true)
    setSavingField(key)
    
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value })
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || `Failed to save ${key}`)
      }
      
      logger.log(`✅ Saved ${key}:`, value)
      
      // Refresh settings data
      mutateSettings()
      
      // Show success message
      toast({
        title: "Settings Updated",
        description: `${key.replace(/_/g, ' ')} saved successfully`,
        duration: 2000
      })
      
    } catch (error: any) {
      logger.error(`❌ Save error for ${key}:`, error)
      alert(`Failed to save ${key.replace('_', ' ')}: ${error.message}`)
    } finally {
      setSaving(false)
      setSavingField(null)
    }
  }

  // Handle switch changes with immediate save
  const handleSwitchChange = (key: string, value: boolean, setter: (val: boolean) => void) => {
    setter(value)
    saveSetting(key, value)
  }

  // Handle input changes with save button
  const handleInputSave = (key: string, value: string) => {
    saveSetting(key, value)
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Loading Settings...
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-muted-foreground mt-4">Loading settings...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Error Loading Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8 text-red-500">
              <p>Failed to load settings</p>
              <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => mutateSettings()}
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Pricing Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5" />
            Pricing Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="delivery-fee">Delivery Fee (₹)</Label>
              <p className="text-xs text-muted-foreground mb-2">
                This amount will be added to every order
              </p>
              <div className="flex gap-2">
                <Input
                  id="delivery-fee"
                  type="number"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  placeholder="30"
                  className="bg-secondary"
                  min="0"
                  step="1"
                />
                <Button 
                  onClick={() => handleInputSave("delivery_fee", deliveryFee)}
                  disabled={saving && savingField === "delivery_fee"}
                >
                  {saving && savingField === "delivery_fee" ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="platform-fee">Platform Fee (%)</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Percentage commission on each order
              </p>
              <div className="flex gap-2">
                <Input
                  id="platform-fee"
                  type="number"
                  value={platformFee}
                  onChange={(e) => setPlatformFee(e.target.value)}
                  placeholder="10"
                  className="bg-secondary"
                  min="0"
                  max="50"
                  step="0.5"
                />
                <Button 
                  onClick={() => handleInputSave("platform_fee", platformFee)}
                  disabled={saving && savingField === "platform_fee"}
                >
                  {saving && savingField === "platform_fee" ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="auto-assign">Auto-Assign Orders</Label>
              <p className="text-xs text-muted-foreground">
                Automatically assign delivery boys to accepted orders
              </p>
            </div>
            <Switch
              id="auto-assign"
              checked={autoAssign}
              onCheckedChange={(checked) => 
                handleSwitchChange("auto_assign", checked, setAutoAssign)
              }
              disabled={saving && savingField === "auto_assign"}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
              <p className="text-xs text-muted-foreground">
                Temporarily disable the platform for maintenance
              </p>
            </div>
            <Switch
              id="maintenance-mode"
              checked={maintenanceMode}
              onCheckedChange={(checked) => 
                handleSwitchChange("maintenance_mode", checked, setMaintenanceMode)
              }
              disabled={saving && savingField === "maintenance_mode"}
            />
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notification Settings
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive order updates via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={(checked) => 
                    handleSwitchChange("email_notifications", checked, setEmailNotifications)
                  }
                  disabled={saving && savingField === "email_notifications"}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive browser push notifications
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={pushNotifications}
                  onCheckedChange={(checked) => 
                    handleSwitchChange("push_notifications", checked, setPushNotifications)
                  }
                  disabled={saving && savingField === "push_notifications"}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security Settings
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="two-factor-auth">Two-Factor Authentication</Label>
                  <p className="text-xs text-muted-foreground">
                    Require 2FA for admin access
                  </p>
                </div>
                <Switch
                  id="two-factor-auth"
                  checked={twoFactorAuth}
                  onCheckedChange={(checked) => 
                    handleSwitchChange("two_factor_auth", checked, setTwoFactorAuth)
                  }
                  disabled={saving && savingField === "two_factor_auth"}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="ip-restriction">IP Restriction</Label>
                  <p className="text-xs text-muted-foreground">
                    Restrict admin access to specific IPs
                  </p>
                </div>
                <Switch
                  id="ip-restriction"
                  checked={ipRestriction}
                  onCheckedChange={(checked) => 
                    handleSwitchChange("ip_restriction", checked, setIpRestriction)
                  }
                  disabled={saving && savingField === "ip_restriction"}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Information */}
      <Card className="lg:col-span-2 bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Platform Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-secondary/30">
              <p className="text-sm text-muted-foreground">Current Version</p>
              <p className="text-xl font-bold">v1.2.0</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/30">
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="text-xl font-bold">Dec 12, 2024</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/30">
              <p className="text-sm text-muted-foreground">Support Contact</p>
              <p className="text-xl font-bold">support@justquick.com</p>
            </div>
          </div>
          
          <div className="mt-6">
            <Button variant="outline" className="mr-3" onClick={() => mutateSettings()}>
              Refresh Settings
            </Button>
            <Button variant="outline" onClick={() => {
              // Reset to defaults
              if (confirm("Reset all settings to defaults?")) {
                const defaults = {
                  delivery_fee: "30",
                  platform_fee: "10",
                  auto_assign: false,
                  maintenance_mode: false,
                  email_notifications: true,
                  push_notifications: true,
                  two_factor_auth: false,
                  ip_restriction: false
                }
                
                // Save all defaults
                Promise.all(
                  Object.entries(defaults).map(([key, value]) => 
                    saveSetting(key, value)
                  )
                ).then(() => {
                  mutateSettings()
                  alert("Settings reset to defaults")
                })
              }
            }}>
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
