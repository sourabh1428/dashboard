// src/Components/Settings/TeamSettings.js
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Edit, 
  Trash, 
  User, 
  Shield, 
  ShieldCheck, 
  Mail, 
  Camera,
  Loader2, 
  Search,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  XCircle,
  UserPlus,
  Pencil,
  Trash2,
  Clock,
  Phone,
  UserCheck,
  BadgeCheck,
  ChevronDown,
  Building,
  Briefcase
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Card,
  
  CardContent,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import toast from 'react-hot-toast';
import { Separator } from "@/components/ui/separator";

const ROLES = {
  admin: { label: "Admin", color: "bg-blue-100 text-blue-800" },
  manager: { label: "Manager", color: "bg-purple-100 text-purple-800" },
  marketer: { label: "Marketer", color: "bg-green-100 text-green-800" },
  viewer: { label: "Viewer", color: "bg-gray-100 text-gray-800" }
};

const getRoleIcon = (roleId) => {
  switch (roleId) {
    case "admin": return <ShieldCheck className="h-3 w-3 text-primary" />;
    case "manager": return <Shield className="h-3 w-3 text-blue-500" />;
    case "marketer": return <User className="h-3 w-3 text-green-500" />;
    case "viewer": return <Eye className="h-3 w-3 text-amber-500" />;
    default: return <User className="h-3 w-3" />;
  }
};

const getInitials = (name) => {
  if (!name) return "U";
  return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
};

const getRoleBg = (roleId) => {
  switch (roleId) {
    case "admin": return "bg-primary/10";
    case "manager": return "bg-blue-500/10";
    case "marketer": return "bg-green-500/10";
    case "viewer": return "bg-amber-500/10";
    default: return "bg-gray-100";
  }
};

const TeamSettings = ({ data, onSave, onDelete }) => {
  const [members, setMembers] = useState(data.members || []);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editMemberIndex, setEditMemberIndex] = useState(null);
  const [viewMember, setViewMember] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "viewer",
    avatar: "",
    phone: "",
    company: "",
    jobTitle: ""
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [avatarHover, setAvatarHover] = useState(false);
  const fileInputRef = useRef(null);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [showEditMemberDialog, setShowEditMemberDialog] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    role: "viewer",
    avatar: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [editMemberId, setEditMemberId] = useState(null);

  useEffect(() => {
    setMembers(data.members || []);
  }, [data]);

  const filteredMembers = members.filter(member => {
    const searchLower = searchQuery.toLowerCase();
    return (
      member.name?.toLowerCase().includes(searchLower) ||
      member.email?.toLowerCase().includes(searchLower) ||
      member.role?.toLowerCase().includes(searchLower)
    );
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for the field being edited
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      
      // Validate required fields
      if (!formData.name || !formData.email || !formData.role) {
        throw new Error("Name, email and role are required");
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error("Please enter a valid email address");
      }
      
      // Create new member object
      const newMember = {
        id: `usr_${Date.now()}`,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        avatar: formData.avatar || "",
        joinedAt: new Date().toISOString(),
        phone: formData.phone || "",
        company: formData.company || "",
        jobTitle: formData.jobTitle || ""
      };
      
      // Add to members array
      const updatedMembers = [...members, newMember];
      
      // Save via parent component with proper format
      const success = await onSave({ members: updatedMembers });
      
      if (success) {
        setMembers(updatedMembers);
        setIsAddDialogOpen(false);
        setFormData({
          name: "",
          email: "",
          role: "viewer",
          avatar: "",
          phone: "",
          company: "",
          jobTitle: ""
        });
        toast.success("Team member added successfully");
      }
    } catch (error) {
      toast.error(error.message || "Failed to add team member");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditMember = async (e) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      
      // Validate required fields
      if (!formData.name || !formData.email || !formData.role) {
        throw new Error("Name, email and role are required");
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error("Please enter a valid email address");
      }
      
      // Create updated members array
      const updatedMembers = [...members];
      updatedMembers[editMemberIndex] = {
        ...updatedMembers[editMemberIndex],
        name: formData.name,
        email: formData.email,
        role: formData.role,
        avatar: formData.avatar || updatedMembers[editMemberIndex].avatar,
        phone: formData.phone || updatedMembers[editMemberIndex].phone,
        company: formData.company || updatedMembers[editMemberIndex].company,
        jobTitle: formData.jobTitle || updatedMembers[editMemberIndex].jobTitle
      };
      
      // Save via parent component with proper format
      const success = await onSave({ members: updatedMembers });
      
      if (success) {
        setMembers(updatedMembers);
        setIsEditDialogOpen(false);
        setEditMemberIndex(null);
        toast.success("Team member updated successfully");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update team member");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMember = async (index) => {
    try {
      setIsDeleting(true);
      
      // Get the new members list after deletion
      const updatedMembers = members.filter((_, i) => i !== index);
      
      // Call parent delete handler or use the save handler with updated list
      let success;
      if (typeof onDelete === 'function') {
        success = await onDelete(index);
      } else {
        // If onDelete not provided, use onSave with the filtered list
        success = await onSave({ members: updatedMembers });
      }
      
      if (success) {
        // Update local state
        setMembers(updatedMembers);
        toast.success("Team member removed successfully");
      }
    } catch (error) {
      toast.error(error.message || "Failed to remove team member");
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditDialog = (index) => {
    const member = members[index];
    setFormData({
      name: member.name,
      email: member.email,
      role: member.role,
      avatar: member.avatar || "",
      phone: member.phone || "",
      company: member.company || "",
      jobTitle: member.jobTitle || ""
    });
    setEditMemberIndex(index);
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (member) => {
    setViewMember(member);
    setIsViewDialogOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5000000) {
      toast.error("Image too large (max 5MB)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      // Use the avatar data directly without localStorage
      const avatarData = reader.result;
      setFormData(prev => ({ ...prev, avatar: avatarData }));
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const resetNewMember = () => {
    setNewMember({
      name: "",
      email: "",
      role: "viewer",
      avatar: ""
    });
    setFormErrors({});
  };

  const validateForm = (member) => {
    const errors = {};
    if (!member.name.trim()) errors.name = "Name is required";
    if (!member.email.trim()) errors.email = "Email is required";
    if (!member.email.includes("@")) errors.email = "Invalid email format";
    if (!member.role) errors.role = "Role is required";
    return errors;
  };

  const handleInviteMember = async () => {
    try {
      const errors = validateForm(newMember);
      
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
      
      setIsInviting(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newId = Date.now().toString();
      const memberToAdd = {
        ...newMember,
        id: newId,
        dateAdded: new Date().toISOString().split('T')[0]
      };
      
      setMembers(prev => {
        const updated = [...prev, memberToAdd];
        return updated;
      });
      
      toast.success(`${newMember.name} has been invited`);
      setShowAddMemberDialog(false);
      resetNewMember();
    } catch (error) {
      toast.error("Failed to invite member");
      console.error(error);
    } finally {
      setIsInviting(false);
    }
  };

  const handleEditMemberDialog = (memberId) => {
    const memberToEdit = members.find(m => m.id === memberId);
    if (memberToEdit) {
      setNewMember({ ...memberToEdit });
      setEditMemberId(memberId);
      setShowEditMemberDialog(true);
    }
  };

  const handleUpdateMember = async () => {
    try {
      const errors = validateForm(newMember);
      
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
      
      setIsSaving(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMembers(prev => {
        const updated = prev.map(member => 
          member.id === editMemberId ? { ...newMember, id: editMemberId } : member
        );
        return updated;
      });
      
      toast.success(`${newMember.name}'s profile updated`);
      setShowEditMemberDialog(false);
      resetNewMember();
      setEditMemberId(null);
    } catch (error) {
      toast.error("Failed to update member");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="w-full sm:w-64">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search team members"
              className="h-9 pl-8 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <Button
          size="sm"
          className="h-9 whitespace-nowrap"
          onClick={() => setShowAddMemberDialog(true)}
        >
          <UserPlus className="h-4 w-4 mr-1.5" />
          Invite Member
        </Button>
      </div>

      {/* Team Members Table */}
      <div className="overflow-x-auto border rounded-md">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted">
              <th className="text-muted-foreground font-medium p-2 text-left">User</th>
              <th className="text-muted-foreground font-medium p-2 text-left hidden md:table-cell">Role</th>
              <th className="text-muted-foreground font-medium p-2 text-left hidden sm:table-cell">Joined</th>
              <th className="text-muted-foreground font-medium p-2 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-8 text-center text-muted-foreground">
                  No team members found
                  {searchQuery && " matching your search criteria"}
                </td>
              </tr>
            ) : (
              filteredMembers.map((member, index) => {
                return (
                  <tr key={member.id || index} className="hover:bg-muted/50 cursor-pointer" onClick={() => openViewDialog(member)}>
                    <td className="p-2 pl-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{member.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{member.email}</div>
                          {(member.company || member.jobTitle) && (
                            <div className="text-xs text-muted-foreground truncate">
                              {member.jobTitle && member.company 
                                ? `${member.jobTitle}, ${member.company}` 
                                : (member.jobTitle || member.company)}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-2 hidden md:table-cell">
                      <Badge variant="outline" className={ROLES[member.role]?.color || "bg-gray-100"}>
                        {ROLES[member.role]?.label || member.role}
                      </Badge>
                    </td>
                    <td className="p-2 text-muted-foreground text-xs hidden sm:table-cell">
                      {formatDate(member.joinedAt)}
                    </td>
                    <td className="p-2 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={e => {
                            e.stopPropagation();
                            handleEditMemberDialog(member.id);
                          }}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={e => {
                              e.stopPropagation();
                              handleDeleteMember(index);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Member Dialog */}
      <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Invite a new person to join your team
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddMember} className="space-y-4 py-2">
            <div className="flex justify-center mb-4">
              <div className="relative w-20 h-20 rounded-full cursor-pointer" 
                onClick={triggerFileInput}
                onMouseEnter={() => setAvatarHover(true)}
                onMouseLeave={() => setAvatarHover(false)}
              >
                <Avatar className="h-20 w-20 border border-muted">
                  <AvatarImage src={formData.avatar} />
                  <AvatarFallback>{getInitials(formData.name)}</AvatarFallback>
                </Avatar>
                <div className={`absolute inset-0 flex items-center justify-center bg-black/40 rounded-full transition-opacity ${avatarHover ? 'opacity-100' : 'opacity-0'}`}>
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
            
            <div className="space-y-2">
              <Label htmlFor="add-name" className="text-xs">Full Name</Label>
              <Input
                id="add-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="h-8 text-sm"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="add-email" className="text-xs">Email Address</Label>
              <Input
                id="add-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="h-8 text-sm"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="add-role" className="text-xs">Role</Label>
              <select
                id="add-role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm h-8"
                required
              >
                {Object.entries(ROLES).map(([value, { label }]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="add-phone" className="text-xs">Phone Number (Optional)</Label>
              <Input
                id="add-phone"
                name="phone"
                type="tel"
                value={formData.phone || ""}
                onChange={handleInputChange}
                className="h-8 text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="add-company" className="text-xs">Company (Optional)</Label>
              <Input
                id="add-company"
                name="company"
                value={formData.company || ""}
                onChange={handleInputChange}
                className="h-8 text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="add-jobTitle" className="text-xs">Job Title (Optional)</Label>
              <Input
                id="add-jobTitle"
                name="jobTitle"
                value={formData.jobTitle || ""}
                onChange={handleInputChange}
                className="h-8 text-sm"
              />
            </div>
            
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddMemberDialog(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                size="sm"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : "Add Member"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>
              Update information for this team member
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditMember} className="space-y-4 py-2">
            <div className="flex justify-center mb-4">
              <div className="relative w-20 h-20 rounded-full cursor-pointer" 
                onClick={triggerFileInput}
                onMouseEnter={() => setAvatarHover(true)}
                onMouseLeave={() => setAvatarHover(false)}
              >
                <Avatar className="h-20 w-20 border border-muted">
                  <AvatarImage src={formData.avatar} />
                  <AvatarFallback>{getInitials(formData.name)}</AvatarFallback>
                </Avatar>
                <div className={`absolute inset-0 flex items-center justify-center bg-black/40 rounded-full transition-opacity ${avatarHover ? 'opacity-100' : 'opacity-0'}`}>
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
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="h-8 text-sm"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="h-8 text-sm"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role" className="text-xs">Role</Label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm h-8"
                required
              >
                {Object.entries(ROLES).map(([value, { label }]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs">Phone Number (Optional)</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone || ""}
                onChange={handleInputChange}
                className="h-8 text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company" className="text-xs">Company (Optional)</Label>
              <Input
                id="company"
                name="company"
                value={formData.company || ""}
                onChange={handleInputChange}
                className="h-8 text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="jobTitle" className="text-xs">Job Title (Optional)</Label>
              <Input
                id="jobTitle"
                name="jobTitle"
                value={formData.jobTitle || ""}
                onChange={handleInputChange}
                className="h-8 text-sm"
              />
            </div>
            
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                size="sm"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Member Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        {viewMember && (
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Team Member Details</DialogTitle>
              <DialogDescription>
                View detailed information about this team member
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex items-center space-x-4 py-2">
              <Avatar className="h-20 w-20 border border-muted">
                <AvatarImage src={viewMember.avatar} />
                <AvatarFallback className="text-lg">{getInitials(viewMember.name)}</AvatarFallback>
              </Avatar>
              
              <div>
                <h3 className="text-lg font-medium">{viewMember.name}</h3>
                {viewMember.jobTitle && (
                  <p className="text-sm text-muted-foreground">{viewMember.jobTitle}</p>
                )}
                {viewMember.company && (
                  <p className="text-sm text-muted-foreground">{viewMember.company}</p>
                )}
                <Badge variant="outline" className={`${ROLES[viewMember.role]?.color} mt-1`}>
                  {ROLES[viewMember.role]?.label || viewMember.role}
                </Badge>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4 py-2">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Email Address</p>
                  <p className="text-sm text-muted-foreground">{viewMember.email}</p>
                </div>
              </div>
              
              {viewMember.phone && (
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{viewMember.phone}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start space-x-3">
                <UserCheck className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Permissions</p>
                  <p className="text-sm text-muted-foreground">
                    {viewMember.role === 'admin' && 'Full access to all features and settings'}
                    {viewMember.role === 'manager' && 'Can manage team and content, but cannot modify advanced settings'}
                    {viewMember.role === 'marketer' && 'Can create and manage campaigns and view analytics'}
                    {viewMember.role === 'viewer' && 'Read-only access to campaigns and analytics'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Joined</p>
                  <p className="text-sm text-muted-foreground">{formatDate(viewMember.joinedAt)}</p>
                </div>
              </div>
              
              {viewMember.company && (
                <div className="flex items-start space-x-3">
                  <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Company</p>
                    <p className="text-sm text-muted-foreground">{viewMember.company}</p>
                  </div>
                </div>
              )}
              
              {viewMember.jobTitle && (
                <div className="flex items-start space-x-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Job Title</p>
                    <p className="text-sm text-muted-foreground">{viewMember.jobTitle}</p>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsViewDialogOpen(false)}
              >
                Close
              </Button>
              <Button 
                size="sm"
                onClick={() => {
                  setIsViewDialogOpen(false);
                  const index = members.findIndex(m => m.id === viewMember.id);
                  if (index !== -1) {
                    handleEditMemberDialog(viewMember.id);
                  }
                }}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Member
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default TeamSettings;
