import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, CheckCircle2, Loader2, KeyRound, Shield, Bell, Smartphone } from "lucide-react"
import toast from "react-hot-toast"

const SecuritySettings = ({ data, onSave }) => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
    notifyOnNewLogin: true,
    ...data
  })
  const [isSaving, setIsSaving] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState({})

  useEffect(() => {
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      twoFactorEnabled: false,
      notifyOnNewLogin: true,
      ...data
    })
  }, [data])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear validation errors when typing
    if (name === "newPassword" || name === "confirmPassword") {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: null,
        passwordMismatch: null
      }))
    }
  }

  const handleSwitchChange = (name, checked) => {
    setFormData(prev => ({ ...prev, [name]: checked }))
  }

  const validatePassword = () => {
    const errors = {}
    
    if (formData.newPassword) {
      if (formData.newPassword.length < 8) {
        errors.newPassword = "Password must be at least 8 characters"
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        errors.passwordMismatch = "Passwords do not match"
      }
    }
    
    setPasswordErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Skip password validation if no new password is being set
    if (formData.newPassword && !validatePassword()) {
      return
    }
    
    setIsSaving(true)
    
    try {
      const success = await onSave(formData)
      if (success) {
        toast.success("Security settings updated")
        // Clear password fields after successful save
        setFormData(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }))
      }
    } catch (error) {
      toast.error(error.message || "Failed to update security settings")
    } finally {
      setIsSaving(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-sm font-medium flex items-center gap-1.5">
          <KeyRound className="h-3.5 w-3.5" />
          Password
        </h3>
        <div className="grid grid-cols-1 gap-2 mt-2">
          <div className="space-y-1">
            <Label htmlFor="currentPassword" className="text-xs">Current Password</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={handleInputChange}
              className="h-7 text-xs"
              placeholder="Enter current password"
              required={Boolean(formData.newPassword)}
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="newPassword" className="text-xs">New Password</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleInputChange}
              className="h-7 text-xs"
              placeholder="Enter new password"
            />
            {passwordErrors.newPassword && (
              <p className="text-[10px] text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {passwordErrors.newPassword}
              </p>
            )}
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="confirmPassword" className="text-xs">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="h-7 text-xs"
              placeholder="Confirm new password"
              disabled={!formData.newPassword}
            />
            {passwordErrors.passwordMismatch && (
              <p className="text-[10px] text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {passwordErrors.passwordMismatch}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <Separator className="my-3" />
      
      <div>
        <h3 className="text-sm font-medium flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5" />
          Two-Factor Authentication
        </h3>
        <div className="flex items-center justify-between mt-2">
          <div className="space-y-0.5">
            <Label htmlFor="twoFactorEnabled" className="text-xs">Enable 2FA</Label>
            <p className="text-[10px] text-muted-foreground">
              Add an extra layer of security to your account
            </p>
          </div>
          <Switch
            id="twoFactorEnabled"
            checked={formData.twoFactorEnabled}
            onCheckedChange={(checked) => handleSwitchChange("twoFactorEnabled", checked)}
          />
        </div>
        
        {formData.twoFactorEnabled && (
          <div className="p-2 bg-muted/50 rounded-md mt-2 text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Smartphone className="h-3 w-3" />
              <span>Verification method: Authenticator app</span>
            </div>
            <Button
              type="button" 
              variant="link" 
              className="text-[10px] h-6 p-0 mt-1"
              onClick={() => toast.success("Setup 2FA wizard would open here")}
            >
              Configure authenticator app
            </Button>
          </div>
        )}
      </div>
      
      <Separator className="my-3" />
      
      <div>
        <h3 className="text-sm font-medium flex items-center gap-1.5">
          <Bell className="h-3.5 w-3.5" />
          Login Notifications
        </h3>
        <div className="flex items-center justify-between mt-2">
          <div className="space-y-0.5">
            <Label htmlFor="notifyOnNewLogin" className="text-xs">New login alerts</Label>
            <p className="text-[10px] text-muted-foreground">
              Get notified when someone logs into your account from a new device
            </p>
          </div>
          <Switch
            id="notifyOnNewLogin"
            checked={formData.notifyOnNewLogin}
            onCheckedChange={(checked) => handleSwitchChange("notifyOnNewLogin", checked)}
          />
        </div>
      </div>
      
      <div className="flex justify-end mt-4">
        <Button
          type="submit"
          size="sm"
          className="h-7 text-xs"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
              Saving...
            </>
          ) : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}

export default SecuritySettings 