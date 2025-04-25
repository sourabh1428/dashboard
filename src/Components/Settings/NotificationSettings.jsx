import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Loader2, Bell, Mail, Globe, MessageSquare, Info, CheckCircle2 } from "lucide-react"
import toast from "react-hot-toast"
import { Card } from "@/components/ui/card"

const NotificationSettings = ({ data, onSave }) => {
  const [settings, setSettings] = useState({
    email: true,
    push: true,
    updates: true,
    marketing: false,
    ...data
  })
  const [isLoading, setIsLoading] = useState(false)
  const [savedStatus, setSavedStatus] = useState(null)

  const handleToggle = async (key) => {
    setIsLoading(true)
    setSavedStatus(null)
    
    try {
      const newSettings = {
        ...settings,
        [key]: !settings[key]
      }
      
      const success = await onSave(newSettings)
      
      if (success) {
        setSettings(newSettings)
        setSavedStatus({ key, status: 'success' })
        setTimeout(() => setSavedStatus(null), 2000)
      }
    } catch (error) {
      toast.error(error.message || "Failed to update notification preferences")
      setSavedStatus({ key, status: 'error' })
      setTimeout(() => setSavedStatus(null), 2000)
    } finally {
      setIsLoading(false)
    }
  }

  const getToggleButton = (key, icon, label, description) => {
    const Icon = icon
    const isToggling = isLoading && savedStatus?.key === key
    const isSuccess = savedStatus?.key === key && savedStatus?.status === 'success'
    
    return (
      <div className="flex items-center justify-between py-3">
        <div className="space-y-0.5">
          <Label htmlFor={`${key}-notifications`} className="flex items-center text-sm">
            <Icon className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            {label}
          </Label>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center">
          {isSuccess && (
            <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-green-500" />
          )}
          {isToggling && (
            <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
          )}
          <Switch
            id={`${key}-notifications`}
            checked={settings[key]}
            onCheckedChange={() => handleToggle(key)}
            disabled={isLoading}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-4 border shadow-sm">
        <h3 className="text-sm font-medium flex items-center mb-4">
          <Bell className="h-4 w-4 mr-2 text-primary" />
          Notification Channels
        </h3>
        <div className="space-y-3 divide-y">
          {getToggleButton(
            'email', 
            Mail, 
            'Email Notifications', 
            'Receive notifications via email'
          )}
          
          {getToggleButton(
            'push', 
            Bell, 
            'Push Notifications', 
            'Receive push notifications in your browser'
          )}
        </div>
      </Card>

      <Card className="p-4 border shadow-sm">
        <h3 className="text-sm font-medium flex items-center mb-4">
          <Info className="h-4 w-4 mr-2 text-primary" />
          Notification Types
        </h3>
        
        <div className="space-y-3 divide-y">
          <div className="flex items-center justify-between py-3">
            <div className="space-y-0.5">
              <Label htmlFor="campaign-notifications" className="flex items-center text-sm">
                <MessageSquare className="h-3.5 w-3.5 mr-2 text-green-500" />
                Campaign Updates
              </Label>
              <p className="text-xs text-muted-foreground">
                Get notified about campaign performance and status changes
              </p>
            </div>
            <Switch
              id="campaign-notifications"
              checked={true}
              disabled={true}
            />
          </div>

          {getToggleButton(
            'updates', 
            Globe, 
            'Product Updates', 
            'Get notified about new features and improvements'
          )}
          
          {getToggleButton(
            'marketing', 
            Mail, 
            'Marketing & Promotional', 
            'Receive marketing and promotional messages'
          )}
        </div>
      </Card>
    </div>
  )
}

export default NotificationSettings 