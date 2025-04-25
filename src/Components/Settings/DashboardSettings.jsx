import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const DashboardSettings = ({ data, onEdit, onSave }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [formData, setFormData] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      await onSave(formData)
      onEdit(false)
    } catch (error) {
      setError(error.message || 'Failed to save dashboard settings')
    } finally {
      setIsSaving(false)
    }
  }

  const formatValue = (key, value) => {
    switch (key) {
      case 'dueDate':
        return new Date(value).toLocaleDateString()
      case 'billingCycle':
        return `${value} Days`
      case 'storageUsage':
        return <Progress value={value} className="w-2/3" />
      case 'twoFactorEnabled':
        return value ? <Badge variant="success">Enabled</Badge> : <Badge variant="destructive">Disabled</Badge>
      case 'subscriptionStatus':
        return <Badge variant={value === 'active' ? 'success' : 'destructive'}>{value}</Badge>
      case 'plan':
        return <Badge variant="premium">{value}</Badge>
      default:
        return value
    }
  }

  const sections = [
    {
      title: "Account Information",
      fields: ['plan', 'subscriptionStatus', 'dueDate', 'billingCycle']
    },
    {
      title: "Usage Statistics",
      fields: ['storageUsage', 'activeUsers', 'apiCalls', 'storageLimit']
    },
    {
      title: "Security & Preferences",
      fields: ['twoFactorEnabled', 'region', 'notificationPref', 'backupSchedule']
    }
  ]

  return (
    <div
      className="bg-card rounded-lg border p-4 mb-4 shadow-sm transition-all hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Dashboard Settings</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(true)}
          className={`text-muted-foreground hover:text-primary ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity`}
        >
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.title} className="space-y-3">
            <h4 className="font-medium text-muted-foreground">{section.title}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.fields.map((field) => (
                <div key={field} className="flex flex-col space-y-1 p-3 bg-muted/50 rounded-lg">
                  <Label className="text-sm text-muted-foreground capitalize">
                    {field.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <div className="text-sm font-medium">
                    {formatValue(field, data[field])}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={data.isEditing} onOpenChange={onEdit}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Dashboard Settings</DialogTitle>
            <DialogDescription>
              Update your dashboard configuration
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-red-500 text-sm p-2 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="dashboardName">Dashboard Name</Label>
              <Input
                id="dashboardName"
                value={formData.dashboardName || ''}
                onChange={e => setFormData({ ...formData, dashboardName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notificationPref">Notification Preferences</Label>
              <select
                id="notificationPref"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.notificationPref || data.notificationPref}
                onChange={e => setFormData({ ...formData, notificationPref: e.target.value })}
              >
                <option value="instant">Instant Notifications</option>
                <option value="daily">Daily Digest</option>
                <option value="weekly">Weekly Summary</option>
              </select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onEdit(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default DashboardSettings