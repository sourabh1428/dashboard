import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Database, Trash2, AlertCircle, Users, RefreshCw, Loader2, ArrowRight, AlertTriangle, ArrowLeft, Info, Box, Server, Lock, Unlock, Ban, Clock, BarChart2, Activity, Calendar, CreditCard, RotateCcw, CheckCircle, XCircle, ChevronDown, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const SUPER_ADMIN_API = import.meta.env.VITE_API_URL + "/super";

const DatabaseManagement = () => {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [databases, setDatabases] = useState([]);
  const [retryCount, setRetryCount] = useState(0);
  const [apiKeyStatus, setApiKeyStatus] = useState("unknown");
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [activityLogs, setActivityLogs] = useState([]);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [statsData, setStatsData] = useState({
    totalDocuments: 0,
    totalSize: 0,
    lastAccess: null,
    createdAt: null
  });
  
  // Check if API key exists and is valid
  useEffect(() => {
    const apiKey = localStorage.getItem("superAdminToken");
    if (!apiKey) {
      setApiKeyStatus("invalid");
      setError("API key is missing. Please log in again.");
      setIsLoading(false);
    } else {
      setApiKeyStatus("unknown");
      fetchDatabases();
    }
  }, []);
  
  // Refetch when retry button is clicked or tenantId changes
  useEffect(() => {
    if (apiKeyStatus !== "invalid" && retryCount > 0) {
      fetchDatabases();
    }
  }, [retryCount, tenantId]);
  
  // Calculate stats when collections change
  useEffect(() => {
    if (collections.length > 0) {
      const totalDocs = collections.reduce((sum, col) => sum + col.count, 0);
      const totalSize = collections.reduce((sum, col) => sum + col.size, 0);
      
      setStatsData({
        ...statsData,
        totalDocuments: totalDocs,
        totalSize: totalSize
      });
    }
  }, [collections]);
  
  // Set initial status when tenant data loads
  useEffect(() => {
    if (tenant) {
      setSelectedStatus(tenant.status || 'active');
      setStatsData(prev => ({
        ...prev,
        createdAt: tenant.createdAt || null,
        lastAccess: tenant.lastAccess || null
      }));
    }
  }, [tenant]);
  
  const fetchDatabases = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("superAdminToken");
      if (!token) {
        throw new Error("Authentication token missing. Please log in again.");
      }

      const endpoint = tenantId 
        ? `${SUPER_ADMIN_API}/database/${tenantId}`
        : `${SUPER_ADMIN_API}/database`;
      
      console.log(`Fetching databases from: ${endpoint}`);
      console.log(`Using token: ${token.substring(0, 10)}...`);
      
      const response = await fetch(endpoint, {
        headers: {
          "x-api-key": token,
          "Content-Type": "application/json"
        }
      });

      console.log(`Response status: ${response.status}`);
      
      if (response.status === 401) {
        // Clear the invalid token
        localStorage.removeItem("superAdminToken");
        setApiKeyStatus("invalid");
        throw new Error("Authentication failed. Please log in again.");
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `API request failed with status ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error) {
            errorMessage = errorData.error;
            if (errorData.details) {
              console.error("Error details:", errorData.details);
            }
          }
        } catch (e) {
          console.error("Could not parse error response:", errorText);
        }
        
        throw new Error(errorMessage);
      }

      // First get the response text to check before parsing
      const responseText = await response.text();
      
      console.log("Response preview:", responseText.substring(0, 200));
      
      // Check if the response text looks like HTML (which would indicate an error page)
      if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
        console.error("Received HTML instead of JSON:", responseText.substring(0, 100));
        throw new Error("Received HTML response instead of JSON. The server may be returning an error page.");
      }
      
      // Now try to parse the JSON
      let data;
      try {
        data = JSON.parse(responseText);
        // Successfully parsed JSON, API key is valid
        setApiKeyStatus("valid");
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        console.error("Response text:", responseText.substring(0, 200) + "...");
        throw new Error(`Failed to parse server response: ${parseError.message}`);
      }
      
      if (tenantId) {
        // If we're fetching a specific tenant
        if (data.database) {
          console.log("Tenant data received:", data.database.dbName);
          setTenant(data.database);
          
          // Set collections if available in the response
          if (data.collections) {
            console.log(`Received ${data.collections.length} collections`);
            setCollections(data.collections);
          } else {
            setCollections([]);
            console.log("No collections data received");
          }
        } else {
          throw new Error("Database not found");
        }
      } else {
        // If we're fetching all databases
        console.log(`Received ${data.databases?.length || 0} databases`);
        setDatabases(data.databases || []);
      }
      
    } catch (error) {
      console.error("Error fetching databases:", error);
      setError(error.message || "Failed to fetch database information");
    } finally {
      setLoading(false);
    }
  };
  
  // Refresh collection data
  const handleRefresh = async () => {
    if (refreshing || !tenantId) return;
    
    try {
      setRefreshing(true);
      setError(null);
      
      const token = localStorage.getItem('superAdminToken');
      await fetchDatabases();
      toast.success("Collections refreshed");
      
    } catch (err) {
      console.error('Error refreshing collections:', err);
      setError(err.message);
      toast.error("Failed to refresh collections");
    } finally {
      setRefreshing(false);
    }
  };
  
  // Format bytes to human-readable format
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  // Handle database deletion
  const handleDeleteDatabase = async () => {
    if (confirmDelete !== 'DELETE' || !tenant || deleteLoading) return;
    
    try {
      setDeleteLoading(true);
      
      const token = localStorage.getItem('superAdminToken');
      if (!token) {
        throw new Error("Authentication token missing. Please log in again.");
      }
      
      const response = await fetch(`${SUPER_ADMIN_API}/database/${tenantId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': token
        },
        body: JSON.stringify({ confirmDelete })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete database');
      }
      
      toast.success("Database deleted successfully");
      // Navigate back to tenants list
      navigate('/super-admin/database');
      
    } catch (err) {
      console.error('Error deleting database:', err);
      setError(err.message);
      toast.error(err.message || "Failed to delete database");
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
    }
  };
  
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };
  
  // Handle status change
  const handleStatusChange = async () => {
    if (!selectedStatus || statusLoading) return;
    
    try {
      setStatusLoading(true);
      
      const token = localStorage.getItem('superAdminToken');
      if (!token) {
        throw new Error("Authentication token missing. Please log in again.");
      }
      
      const response = await fetch(`${SUPER_ADMIN_API}/database/${tenantId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': token
        },
        body: JSON.stringify({ 
          status: selectedStatus, 
          reason: statusReason 
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update tenant status');
      }
      
      const data = await response.json();
      
      // Update tenant status in local state
      setTenant(prev => ({
        ...prev,
        status: selectedStatus,
        statusReason: statusReason,
        statusUpdatedAt: new Date().toISOString()
      }));
      
      let successMessage = '';
      let icon = '';
      
      switch(selectedStatus) {
        case 'active':
          successMessage = "Tenant access has been activated";
          icon = '✅';
          break;
        case 'suspended':
          successMessage = "Tenant access has been temporarily suspended";
          icon = '⏸️';
          break;
        case 'blocked':
          successMessage = "Tenant access has been blocked";
          icon = '🚫';
          break;
        default:
          successMessage = "Tenant status has been updated";
          icon = '📝';
      }
      
      toast.success(`${icon} ${successMessage}`);
      setStatusDialogOpen(false);
      
    } catch (err) {
      console.error('Error updating tenant status:', err);
      toast.error(err.message || "Failed to update tenant status");
    } finally {
      setStatusLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid gap-4">
          <Skeleton className="h-[200px] w-full rounded-md" />
          <Skeleton className="h-[300px] w-full rounded-md" />
        </div>
      </div>
    );
  }
  
  if (apiKeyStatus === "invalid") {
    return (
      <div className="p-4">
        <Alert variant="destructive" className="mb-2">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertDescription>
            {error || "Authentication failed. Your session may have expired."}
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate("/login/super-admin")}
                className="mt-2"
              >
                <ArrowRight className="h-3.5 w-3.5 mr-1.5" />
                Go to Login
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive" className="mb-2">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertDescription>
            {error}
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry}
                className="mt-2"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Try Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Render tenant list when no tenantId is provided
  if (!tenantId) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Database Management</h3>
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Database className="h-4 w-4 mr-1.5" />
              Tenant Databases
            </CardTitle>
            <CardDescription className="text-xs">
              Manage all tenant databases from a central location
            </CardDescription>
          </CardHeader>
          <CardContent>
            {databases.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                <Database className="h-10 w-10 text-muted-foreground opacity-30" />
                <div className="text-sm font-medium">No tenant databases found</div>
                <p className="text-xs text-muted-foreground max-w-[200px]">
                  There are no tenant databases currently registered in the system.
                </p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2"
                  onClick={handleRetry}
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Refresh
                </Button>
              </div>
            ) : (
              <div className="-mx-2 -my-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Store Name</TableHead>
                      <TableHead>Database Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Admin Email</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {databases.map((tenant) => (
                      <TableRow key={tenant._id}>
                        <TableCell className="font-medium">{tenant.storeName}</TableCell>
                        <TableCell>{tenant.dbName}</TableCell>
                        <TableCell>
                          <Badge variant={tenant.status === 'active' ? "success" : "destructive"}>
                            {tenant.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {tenant.Users?.[0]?.user_email || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            asChild
                            className="h-7"
                          >
                            <Link to={`/super-admin/database/${tenant._id}`}>
                              Manage
                              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!tenant) {
    return (
      <div className="p-4">
        <Alert className="mb-2">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>
            The requested tenant could not be found.
            <div className="mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/super-admin/database')}
                className="mt-2"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                Back to Database Management
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Database: {tenant.dbName}</h3>
          <p className="text-sm text-muted-foreground">Tenant: {tenant.storeName}</p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                {tenant.status === 'active' ? (
                  <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                ) : tenant.status === 'suspended' ? (
                  <Clock className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                ) : (
                  <Ban className="h-3.5 w-3.5 mr-1.5 text-red-500" />
                )}
                {tenant.status === 'active' ? 'Active' : 
                 tenant.status === 'suspended' ? 'Suspended' : 'Blocked'}
                <ChevronDown className="h-3.5 w-3.5 ml-1.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Manage Access</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => {
                  setSelectedStatus('active');
                  setStatusReason('');
                  setStatusDialogOpen(true);
                }}
                className="text-green-600"
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                <span>Activate Access</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  setSelectedStatus('suspended');
                  setStatusReason('Payment delay');
                  setStatusDialogOpen(true);
                }}
                className="text-amber-600"
              >
                <Clock className="h-3.5 w-3.5 mr-1.5" />
                <span>Suspend Temporarily</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  setSelectedStatus('blocked');
                  setStatusReason('Account violation');
                  setStatusDialogOpen(true);
                }}
                className="text-red-600"
              >
                <Ban className="h-3.5 w-3.5 mr-1.5" />
                <span>Block Account</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/super-admin/database')}
            className="h-8"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back
          </Button>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
            className="h-8"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Delete
          </Button>
        </div>
      </div>
      
      {tenant.statusReason && (
        <Alert variant={tenant.status === 'active' ? 'default' : tenant.status === 'suspended' ? 'warning' : 'destructive'} className="mb-2">
          {tenant.status === 'active' ? (
            <CheckCircle className="h-4 w-4 mr-2" />
          ) : tenant.status === 'suspended' ? (
            <Clock className="h-4 w-4 mr-2" />
          ) : (
            <Ban className="h-4 w-4 mr-2" />
          )}
          <AlertDescription>
            <span className="font-medium">{tenant.status === 'active' ? 'Active: ' : tenant.status === 'suspended' ? 'Suspended: ' : 'Blocked: '}</span>
            {tenant.statusReason}
            {tenant.statusUpdatedAt && (
              <span className="block text-xs opacity-70 mt-0.5">
                {new Date(tenant.statusUpdatedAt).toLocaleString()}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <Database className="h-3.5 w-3.5 mr-1.5" />
                  Database Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Total Collections:</span>
                    <span className="text-sm font-medium">{collections.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Total Documents:</span>
                    <span className="text-sm font-medium">{statsData.totalDocuments.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Database Size:</span>
                    <span className="text-sm font-medium">{formatBytes(statsData.totalSize)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Creation Date:</span>
                    <span className="text-sm font-medium">
                      {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <Users className="h-3.5 w-3.5 mr-1.5" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Admin:</span>
                    <span className="text-sm font-medium">{tenant.Users?.[0]?.user_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Email:</span>
                    <span className="text-sm font-medium">{tenant.Users?.[0]?.user_email || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Total Users:</span>
                    <span className="text-sm font-medium">{tenant.Users?.length || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <Activity className="h-3.5 w-3.5 mr-1.5" />
                  Status Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Current Status:</span>
                    <Badge variant={tenant.status === 'active' ? 'success' : tenant.status === 'suspended' ? 'warning' : 'destructive'}>
                      {tenant.status || 'Active'}
                    </Badge>
                  </div>
                  {tenant.apiKey && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">API Key:</span>
                      <span className="text-xs font-mono bg-muted p-1 rounded">
                        {tenant.apiKey.substring(0, 10)}...
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Last Status Change:</span>
                    <span className="text-sm font-medium">
                      {tenant.statusUpdatedAt ? new Date(tenant.statusUpdatedAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2 pb-3 px-6">
                <Button variant="outline" size="sm" className="w-full h-7 text-xs" onClick={() => setStatusDialogOpen(true)}>
                  <RotateCcw className="h-3 w-3 mr-1.5" />
                  Change Status
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <BarChart2 className="h-3.5 w-3.5 mr-1.5" />
                Database Collections Overview
              </CardTitle>
              <CardDescription className="text-xs">
                Top collections by size and document count
              </CardDescription>
            </CardHeader>
            <CardContent>
              {collections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                  <Box className="h-8 w-8 text-muted-foreground opacity-30" />
                  <div className="text-sm font-medium">No collections found</div>
                  <p className="text-xs text-muted-foreground max-w-[300px]">
                    This database doesn't have any collections yet.
                  </p>
                </div>
              ) : (
                <div className="-mx-2 -my-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Collection Name</TableHead>
                        <TableHead className="text-right">Documents</TableHead>
                        <TableHead className="text-right">Size</TableHead>
                        <TableHead className="text-right">% of DB</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {collections
                        .sort((a, b) => b.size - a.size)
                        .slice(0, 5)
                        .map((collection) => (
                          <TableRow key={collection.name}>
                            <TableCell className="font-medium">{collection.name}</TableCell>
                            <TableCell className="text-right">{collection.count.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{formatBytes(collection.size)}</TableCell>
                            <TableCell className="text-right">
                              {statsData.totalSize ? 
                                `${Math.round((collection.size / statsData.totalSize) * 100)}%` : 
                                'N/A'
                              }
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="collections" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center">
                  <Database className="h-4 w-4 mr-1.5" />
                  Collections
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="h-7"
                >
                  {refreshing ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {collections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                  <Box className="h-10 w-10 text-muted-foreground opacity-30" />
                  <div className="text-sm font-medium">No collections found</div>
                  <p className="text-xs text-muted-foreground max-w-[300px]">
                    This database doesn't have any collections yet or there might be connectivity issues.
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="mt-2"
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
                    {refreshing ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    Try Again
                  </Button>
                </div>
              ) : (
                <div className="-mx-2 -my-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Collection Name</TableHead>
                        <TableHead>Documents</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Storage Size</TableHead>
                        <TableHead>Avg. Object Size</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {collections.map((collection) => (
                        <TableRow key={collection.name}>
                          <TableCell className="font-medium">{collection.name}</TableCell>
                          <TableCell>{collection.count.toLocaleString()}</TableCell>
                          <TableCell>{formatBytes(collection.size)}</TableCell>
                          <TableCell>{formatBytes(collection.storageSize)}</TableCell>
                          <TableCell>
                            {collection.avgObjSize ? formatBytes(collection.avgObjSize) : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Users className="h-4 w-4 mr-1.5" />
                Database Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="-mx-2 -my-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Verified</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenant.Users?.length > 0 ? (
                      tenant.Users.map((user, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{user.user_name}</TableCell>
                          <TableCell>{user.user_email}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? "default" : "secondary"}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.isVerified ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground text-sm">
                          No users found for this database
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <CreditCard className="h-4 w-4 mr-1.5" />
                Billing Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Payment Status</h4>
                  <Badge variant={tenant.status === 'active' ? "success" : "destructive"}>
                    {tenant.status === 'active' ? 'Current' : 'Overdue'}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Plan</h4>
                  <p className="text-sm">{tenant.plan || 'Free Plan'}</p>
                </div>
              </div>
              
              <div className="pt-2">
                <h4 className="text-sm font-medium mb-2">Update Account Status</h4>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8"
                    onClick={() => {
                      setSelectedStatus('active');
                      setStatusReason('Payment received');
                      setStatusDialogOpen(true);
                    }}
                  >
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                    Mark as Paid
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8"
                    onClick={() => {
                      setSelectedStatus('suspended');
                      setStatusReason('Payment delay');
                      setStatusDialogOpen(true);
                    }}
                  >
                    <Clock className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                    Suspend for Payment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Settings className="h-4 w-4 mr-1.5" />
                Database Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Store Name</label>
                    <Input value={tenant.storeName} disabled className="h-8 text-sm bg-muted" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Database Name</label>
                    <Input value={tenant.dbName} disabled className="h-8 text-sm bg-muted" />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">API Key</label>
                  <div className="relative">
                    <Input 
                      value={tenant.apiKey || 'No API key available'} 
                      disabled 
                      className="h-8 text-sm bg-muted pr-20 font-mono text-xs" 
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-6"
                      onClick={() => {
                        navigator.clipboard.writeText(tenant.apiKey);
                        toast.success("API key copied to clipboard");
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Status Change Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {selectedStatus === 'active' ? (
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              ) : selectedStatus === 'suspended' ? (
                <Clock className="h-5 w-5 mr-2 text-amber-500" />
              ) : (
                <Ban className="h-5 w-5 mr-2 text-red-500" />
              )}
              {selectedStatus === 'active' ? 'Activate Tenant' : 
               selectedStatus === 'suspended' ? 'Suspend Tenant' : 'Block Tenant'}
            </DialogTitle>
            <DialogDescription>
              {selectedStatus === 'active' ? 
                'The tenant will regain access to the platform.' : 
                selectedStatus === 'suspended' ? 
                'The tenant will temporarily lose access until reactivated.' : 
                'The tenant will be blocked from accessing the platform.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason</label>
              <Textarea
                placeholder="Enter reason for status change..."
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                className="text-sm resize-none min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStatusDialogOpen(false);
              }}
              disabled={statusLoading}
              className="h-8"
            >
              Cancel
            </Button>
            <Button
              variant={selectedStatus === 'active' ? 'default' : 
                      selectedStatus === 'suspended' ? 'warning' : 'destructive'}
              size="sm"
              onClick={handleStatusChange}
              disabled={statusLoading}
              className="h-8"
            >
              {statusLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Updating...
                </>
              ) : (
                selectedStatus === 'active' ? 'Activate' : 
                selectedStatus === 'suspended' ? 'Suspend' : 'Block'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-destructive">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Delete Database
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. All data in this database will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Alert>
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription className="text-xs">
                Type <span className="font-bold">DELETE</span> to confirm.
              </AlertDescription>
            </Alert>
            <Input
              placeholder="Type DELETE to confirm"
              value={confirmDelete}
              onChange={(e) => setConfirmDelete(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setConfirmDelete('');
                setDeleteDialogOpen(false);
              }}
              disabled={deleteLoading}
              className="h-8"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteDatabase}
              disabled={confirmDelete !== 'DELETE' || deleteLoading}
              className="h-8"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Database'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DatabaseManagement;
