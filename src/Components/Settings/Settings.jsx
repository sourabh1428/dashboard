"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Users, 
  Mail, 
  LayoutDashboard, 
  MessageSquare, 
  Shield, 
  Bell, 
  UserCog,
  CreditCard,
  ChevronRight,
  AlertTriangle
} from "lucide-react"
import toast, { Toaster } from 'react-hot-toast'
import SettingsDisplay from "./SettingsDisplay "
import { getApiKey } from "@/configApi"
import EditDialog from "./EditDialog"
import UserProfileSettings from "./UserProfileSettings"
import SecuritySettings from "./SecuritySettings"
import TeamSettings from "./TeamSettings"
import BillingSettings from "./BillingSettings"
import NotificationSettings from "./NotificationSettings"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MOCK_SETTINGS } from "./MockData"

const API_BASE = import.meta.env.VITE_API_URL + "/dbroute"
const API_HEADERS = {
  "Content-Type": "application/json",
  "x-api-key": getApiKey(),
}

const SETTINGS_SECTIONS = [
  { id: "profile", label: "Profile", icon: UserCog },
  { id: "team", label: "Team Members", icon: Users },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "email", label: "Email", icon: Mail },
  { id: "whatsapp", label: "WhatsApp", icon: MessageSquare },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard }
]

// Default/fallback settings data
const DEFAULT_SETTINGS = {
  email: { 
    provider: "SMTP",
    host: "",
    port: "",
    username: "",
    password: "",
    fromEmail: "",
    fromName: ""
  }, 
  whatsapp: { 
    enabled: false,
    apiKey: "",
    phoneNumber: "",
    businessName: ""
  }, 
  team: { 
    members: [] 
  }, 
  dashboard: {
    widgets: [],
    layout: "grid"
  },
  profile: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
    address: "",
    bio: "",
    avatarUrl: ""
  },
  security: { 
    twoFactorEnabled: false, 
    lastPasswordChange: null,
    notifyOnNewLogin: true
  },
  notifications: { 
    email: true, 
    push: true, 
    updates: true, 
    marketing: false 
  },
  billing: { 
    plan: 'Free', 
    nextBilling: '2023-12-31' 
  }
}

export default function Settings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [activeSection, setActiveSection] = useState("profile")
  const [editDialog, setEditDialog] = useState({ open: false, type: null })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [apiKeyStatus, setApiKeyStatus] = useState("unknown") // "valid", "invalid", "unknown"

  // Check if API key exists and is valid
  useEffect(() => {
    const apiKey = getApiKey()
    if (!apiKey) {
      setApiKeyStatus("invalid")
      setError("API key is missing. Please log in again.")
      setIsLoading(false)
    } else {
      setApiKeyStatus("unknown")
    }
  }, [])

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true)
      setError("")
      
      // Log API details for debugging
      console.log("Fetching settings from:", API_BASE)
      console.log("API Key present:", Boolean(getApiKey()))
      
      const response = await fetch(`${API_BASE}`, {
        headers: API_HEADERS,
      })

      // Log response status for debugging
      console.log("Settings API response status:", response.status)
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setApiKeyStatus("invalid")
          throw new Error("Authentication failed. Please log in again.")
        }
        throw new Error(`Failed to fetch settings: ${response.status}`)
      }

      const responseData = await response.json()
      console.log("Parsed settings data:", responseData)
      
      // Handle different response formats
      const settingsData = responseData.data || responseData

      // Merge with default settings to ensure all required fields exist
      setSettings(prevSettings => ({
        ...DEFAULT_SETTINGS,
        ...settingsData
      }))
      
      setApiKeyStatus("valid")
      setError("")
    } catch (error) {
      console.error("Error fetching settings:", error)
      
      // Use mock data in development environment
      if (import.meta.env.DEV) {
        console.log("Using mock settings data for development");
        setSettings(prev => ({
          ...prev,
          ...MOCK_SETTINGS
        }));
        setError(null);
      } else {
        setError(error.message || "Failed to load settings")
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (apiKeyStatus !== "invalid") {
      fetchSettings()
    }
  }, [fetchSettings, apiKeyStatus])

  const handleDialogClose = () => {
    setEditDialog({ open: false, type: null })
  }

  const handleSave = async (type, data) => {
    try {
      // Log what we're trying to save
      console.log(`Saving ${type} settings:`, data)
      
      // Use different endpoint for profile updates
      let endpoint = `${API_BASE}/${type}`;
      let method = "POST";
      let body = data;
      
      // For profile updates, use the user API endpoint instead
      if (type === "profile") {
        endpoint = `${API_BASE}/user/profile`;
        console.log("Using profile endpoint:", endpoint);
      }
      
      // For team updates, ensure proper format
      if (type === "team") {
        console.log("Formatting team data for API");
        // Make sure we're sending the format the API expects
        if (!data.members && Array.isArray(data)) {
          body = { members: data };
        }
      }
      
      const response = await fetch(endpoint, {
        method: method, 
        headers: API_HEADERS,
        body: JSON.stringify(body),
      })

      // Log response status
      console.log(`${type} settings update response:`, response.status)

      if (!response.ok) {
        throw new Error(`Failed to update ${type} settings: ${response.status}`)
      }

      // Update local state
      setSettings(prev => ({
        ...prev,
        [type]: data
      }))
      
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} settings updated`)
      return true
    } catch (error) {
      console.error(`Error saving ${type} settings:`, error)
      
      // In development mode, simulate success
      if (import.meta.env.DEV) {
        console.log(`Mock save successful for ${type} settings`)
        
        // Update local state with the changes
        setSettings(prev => ({
          ...prev,
          [type]: data
        }))
        
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} settings updated`)
        return true
      }
      
      toast.error(`Failed to update ${type} settings: ${error.message}`)
      return false
    }
  }

  const handleDialogSave = async (type, data) => {
    try {
      const success = await handleSave(type, data)
      
      if (success) {
        setEditDialog({ open: false, type: null })
      }
    } catch (error) {
      console.error(error)
      toast.error(error.message || `Failed to update ${type} settings`)
    }
  }

  const renderContent = () => {
    // If we're loading, show skeleton loaders
    if (isLoading) {
      return (
        <div className="space-y-4 p-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )
    }

    // If there's an error and no API key, show a special message
    if (error && apiKeyStatus === "invalid") {
      return (
        <div className="p-4">
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => window.location.href = "/login"}>
            Go to Login
          </Button>
        </div>
      )
    }
    
    // If there's another type of error but we have settings data, show the error but continue
    if (error) {
      return (
        <div className="p-4">
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={fetchSettings} className="mb-4">
            Retry
          </Button>
          
          {/* Still render the content if we have it */}
          {renderSection()}
        </div>
      )
    }

    // No errors or loading, render the selected section
    return renderSection()
  }

  // Helper function to render the active section content
  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return (
          <UserProfileSettings 
            data={settings.profile} 
            onSave={(data) => handleSave("profile", data)} 
          />
        )
      case "team":
        return (
          <TeamSettings 
            data={settings.team || { members: [] }} 
            onSave={(data) => handleSave("team", data)}
            onDelete={(index) => {
              // Ensure members array exists
              const members = settings.team?.members || [];
              if (index >= 0 && index < members.length) {
                const newMembers = [...members];
                newMembers.splice(index, 1);
                return handleSave("team", { members: newMembers });
              }
              return false;
            }}
          />
        )
      case "security":
        return (
          <SecuritySettings 
            data={settings.security}
            onSave={(data) => handleSave("security", data)}
          />
        )
      case "notifications":
        return (
          <NotificationSettings 
            data={settings.notifications}
            onSave={(data) => handleSave("notifications", data)}
          />
        )
      case "billing":
        return (
          <BillingSettings 
            data={settings.billing}
            onSave={(data) => handleSave("billing", data)}
          />
        )
      case "email":
        return (
          <SettingsDisplay
            title=""
            data={settings.email}
            type="email"
            onEdit={() => setEditDialog({ open: true, type: "email" })}
          />
        )
      case "whatsapp":
        return (
          <SettingsDisplay
            title=""
            data={settings.whatsapp}
            type="whatsapp"
            onEdit={() => setEditDialog({ open: true, type: "whatsapp" })}
          />
        )
      case "dashboard":
        return (
          <SettingsDisplay
            title=""
            data={settings.dashboard}
            type="dashboard"
            onEdit={() => setEditDialog({ open: true, type: "dashboard" })}
          />
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full">
        <div className="hidden md:flex w-60 flex-shrink-0 border-r">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-[500px] w-full" />
        </div>
      </div>
    )
  }

  if (apiKeyStatus === "invalid") {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertDescription className="ml-2">
            Authentication failed. Your session may have expired. Please log in again.
          </AlertDescription>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.href = "/login"}
            className="mt-4"
          >
            Go to Login
          </Button>
        </Alert>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchSettings} 
            className="mt-2"
          >
            Retry
          </Button>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-[calc(100vh-4rem)]">
      <Toaster position="top-right" />

      <EditDialog 
        open={editDialog.open} 
        type={editDialog.type}
        data={settings[editDialog.type]} 
        onClose={handleDialogClose}
        onSave={data => handleDialogSave(editDialog.type, data)}
      />

      {/* Sidebar Navigation */}
      <div className="hidden md:block w-60 flex-shrink-0 border-r bg-background">
        <div className="py-2">
          <h2 className="px-4 py-2 text-sm font-medium text-muted-foreground">Settings</h2>
          <nav className="space-y-1 px-2">
            {SETTINGS_SECTIONS.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  className={cn(
                    "flex items-center w-full rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition-colors",
                    activeSection === section.id ? "bg-muted text-foreground" : "text-muted-foreground"
                  )}
                  onClick={() => setActiveSection(section.id)}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  <span>{section.label}</span>
                  <ChevronRight className={cn(
                    "ml-auto h-4 w-4 transition-opacity",
                    activeSection === section.id ? "opacity-100" : "opacity-0"
                  )} />
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden w-full overflow-auto border-b bg-background">
        <div className="flex overflow-x-auto py-2 px-4 space-x-2">
          {SETTINGS_SECTIONS.map((section) => {
            const Icon = section.icon
            return (
              <button
                key={section.id}
                className={cn(
                  "flex items-center shrink-0 rounded-md px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors",
                  activeSection === section.id ? "bg-muted text-foreground" : "text-muted-foreground"
                )}
                onClick={() => setActiveSection(section.id)}
              >
                <Icon className="mr-1.5 h-3.5 w-3.5" />
                <span>{section.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        <Card className="h-full border-0 rounded-none shadow-none">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-xl font-semibold">
                {SETTINGS_SECTIONS.find(s => s.id === activeSection)?.label}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {activeSection === "profile" && "Manage your personal profile information"}
                {activeSection === "team" && "Add and manage team members and permissions"}
                {activeSection === "security" && "Secure your account and manage login settings"}
                {activeSection === "notifications" && "Control how and when you receive notifications"}
                {activeSection === "billing" && "Manage your subscription plans and payment methods"}
                {activeSection === "email" && "Configure email service provider settings"}
                {activeSection === "whatsapp" && "Set up WhatsApp Business API integration"}
                {activeSection === "dashboard" && "Customize your dashboard experience"}
              </p>
            </div>
            
            {renderContent()}
          </div>
        </Card>
      </div>
    </div>
  )
}
