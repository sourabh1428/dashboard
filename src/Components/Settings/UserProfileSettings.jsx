import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Loader2, Camera, User, Mail, Phone, MapPin, Building, Briefcase } from "lucide-react"
import toast from "react-hot-toast"

const UserProfileSettings = ({ data, onSave }) => {
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
    address: "",
    bio: "",
    avatarUrl: "",
    ...data
  })
  const [isEditing, setIsEditing] = useState(false)
  const fileInputRef = useRef(null)

  // Update local state when prop data changes
  useEffect(() => {
    if (data) {
      setProfile(prev => ({ ...prev, ...data }))
    }
  }, [data])

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfile(prev => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const avatarDataUrl = event.target.result
      setProfile(prev => ({ ...prev, avatarUrl: avatarDataUrl }))
    }
    reader.readAsDataURL(file)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const success = await onSave(profile)
      if (success) {
        setIsEditing(false)
        toast.success("Profile updated")
      }
    } catch (error) {
      toast.error(error.message || "Failed to save profile")
    } finally {
      setLoading(false)
    }
  }

  const getInitials = () => {
    const first = profile.firstName?.charAt(0) || ""
    const last = profile.lastName?.charAt(0) || ""
    return (first + last).toUpperCase() || "U"
  }

  return (
    <div className="space-y-3">
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex justify-center mb-1">
            <div 
              className="relative rounded-full group cursor-pointer" 
              onClick={triggerFileInput}
            >
              <Avatar className="h-16 w-16 border border-muted">
                <AvatarImage src={profile.avatarUrl} alt={`${profile.firstName} ${profile.lastName}`} />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="h-5 w-5 text-white" />
              </div>
              <input 
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>
          </div>
          <p className="text-[10px] text-center text-muted-foreground -mt-2">Click to change picture</p>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="firstName" className="text-xs">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={profile.firstName}
                onChange={handleChange}
                className="h-7 text-xs"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lastName" className="text-xs">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={profile.lastName}
                onChange={handleChange}
                className="h-7 text-xs"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="email" className="text-xs">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                value={profile.email}
                onChange={handleChange}
                className="h-7 text-xs pl-7"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="phone" className="text-xs">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={profile.phone}
                onChange={handleChange}
                className="h-7 text-xs pl-7"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="company" className="text-xs">Company</Label>
              <div className="relative">
                <Building className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  id="company"
                  name="company"
                  value={profile.company}
                  onChange={handleChange}
                  className="h-7 text-xs pl-7"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="jobTitle" className="text-xs">Job Title</Label>
              <div className="relative">
                <Briefcase className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  id="jobTitle"
                  name="jobTitle"
                  value={profile.jobTitle}
                  onChange={handleChange}
                  className="h-7 text-xs pl-7"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="address" className="text-xs">Address</Label>
            <div className="relative">
              <MapPin className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
              <Textarea
                id="address"
                name="address"
                value={profile.address}
                onChange={handleChange}
                className="resize-none min-h-[60px] pl-7 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="bio" className="text-xs">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself"
              className="resize-none min-h-[80px] text-xs"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              className="h-7 text-xs"
              onClick={() => setIsEditing(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              size="sm"
              className="h-7 text-xs"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : "Save Changes"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile.avatarUrl} alt={`${profile.firstName} ${profile.lastName}`} />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-sm font-medium">
                  {profile.firstName} {profile.lastName}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {profile.email}
                </p>
              </div>
            </div>
            <Button 
              size="sm"
              className="h-7 text-xs"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          </div>

          <Separator className="my-2" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium">Phone</p>
                  <p className="text-xs text-muted-foreground">
                    {profile.phone || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Building className="h-3.5 w-3.5 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium">Company</p>
                  <p className="text-xs text-muted-foreground">
                    {profile.company || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium">Job Title</p>
                  <p className="text-xs text-muted-foreground">
                    {profile.jobTitle || "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-medium">Address</p>
                  <p className="text-xs text-muted-foreground whitespace-pre-line">
                    {profile.address || "Not specified"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {profile.bio && (
            <>
              <Separator className="my-2" />
              <div>
                <p className="text-xs font-medium">Bio</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {profile.bio}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default UserProfileSettings 