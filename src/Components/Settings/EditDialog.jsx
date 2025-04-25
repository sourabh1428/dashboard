import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

const EditDialog = ({ open, onOpenChange, type, initialData, onSave }) => {
  const [formData, setFormData] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setFormData(initialData || {})
    setError('')
  }, [initialData, open])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      const cleanData = { ...formData }
      if (cleanData.password === '••••••••' || cleanData.password === '') {
        delete cleanData.password
      }

      if (type === 'whatsapp' && (!cleanData.apiKey || !cleanData.appId)) {
        throw new Error('API Key and App ID are required')
      }

      if (type === 'email' && !cleanData.resendApiKey) {
        throw new Error('Resend API Key is required')
      }

      await onSave(cleanData)
      onOpenChange(false)
    } catch (error) {
      setError(error.message || 'Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit {type === 'whatsapp' ? 'WhatsApp' : 'Email'} Settings</DialogTitle>
          <DialogDescription>
            Update your integration details. Leave password empty to keep current value.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-500 text-sm p-2 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={formData.email || ''}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Leave blank to keep current"
              value={formData.password || ''}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {type === 'whatsapp' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  value={formData.apiKey || ''}
                  onChange={e => setFormData({ ...formData, apiKey: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appId">App ID</Label>
                  <Input
                    id="appId"
                    value={formData.appId || ''}
                    onChange={e => setFormData({ ...formData, appId: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sourcePhone">Source Phone</Label>
                  <Input
                    id="sourcePhone"
                    value={formData.sourcePhoneNumber || ''}
                    onChange={e => setFormData({ ...formData, sourcePhoneNumber: e.target.value })}
                    required
                  />
                </div>
              </div>
            </>
          )}

          {type === 'email' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="resendApiKey">Resend API Key</Label>
                <Input
                  id="resendApiKey"
                  value={formData.resendApiKey || ''}
                  onChange={e => setFormData({ ...formData, resendApiKey: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromEmail">From Email Address</Label>
                <Input
                  id="fromEmail"
                  value={formData.fromEmail || ''}
                  onChange={e => setFormData({ ...formData, fromEmail: e.target.value })}
                  required
                />
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditDialog
