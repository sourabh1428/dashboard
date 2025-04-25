import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Pencil, MessageSquare, Mail } from "lucide-react"

const SettingsDisplay = ({ title, data, type, onEdit }) => {
  const [isHovered, setIsHovered] = useState(false)

  // Show 'Add Configuration' card when no data exists
  if (!data || Object.keys(data).length === 0) {
    return (
      <div
        className="bg-card rounded-lg border p-4 mb-4 shadow-sm transition-all hover:shadow-md"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {type === "whatsapp" ? (
              <MessageSquare className="h-5 w-5 text-green-600" />
            ) : (
              <Mail className="h-5 w-5 text-blue-600" />
            )}
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit({})}
            className={`text-muted-foreground hover:text-primary ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity`}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Add Configuration
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">No configuration added yet.</p>
      </div>
    )
  }

  return (
    <div
      className="bg-card rounded-lg border p-4 mb-4 shadow-sm transition-all hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {type === "whatsapp" ? (
            <MessageSquare className="h-5 w-5 text-green-600" />
          ) : (
            <Mail className="h-5 w-5 text-blue-600" />
          )}
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(data)}
          className={`text-muted-foreground hover:text-primary ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity`}
        >
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex flex-col space-y-1">
            <Label className="text-sm text-muted-foreground capitalize">{key}</Label>
            <div className="text-sm font-medium truncate">
              {key === 'password' ? '••••••••' : value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SettingsDisplay
