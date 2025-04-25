import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/components/ui/toast';
import { 
  Store, 
  Database, 
  Mail, 
  User, 
  Key, 
  AlertCircle, 
  Loader2,
  ChevronLeft
} from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

const CreateTenant = () => {
  const [formData, setFormData] = useState({
    storeName: '',
    dbName: '',
    adminEmail: '',
    adminPassword: '',
    adminName: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.storeName.trim()) {
      newErrors.storeName = 'Store name is required';
    }
    
    if (!formData.dbName.trim()) {
      newErrors.dbName = 'Database name is required';
    } else if (!/^[a-z0-9_]+$/.test(formData.dbName)) {
      newErrors.dbName = 'Database name can only contain lowercase letters, numbers, and underscores';
    }
    
    if (!formData.adminEmail.trim()) {
      newErrors.adminEmail = 'Admin email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
      newErrors.adminEmail = 'Please enter a valid email address';
    }
    
    if (!formData.adminPassword.trim()) {
      newErrors.adminPassword = 'Admin password is required';
    } else if (formData.adminPassword.length < 6) {
      newErrors.adminPassword = 'Password must be at least 6 characters long';
    }
    
    if (!formData.adminName.trim()) {
      newErrors.adminName = 'Admin name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Generate database name from store name
  const generateDbName = () => {
    if (formData.storeName && !formData.dbName) {
      const dbName = formData.storeName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
      
      setFormData((prev) => ({ ...prev, dbName }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('superAdminToken');
      
      if (!token) {
        navigate('/super-admin/login');
        return;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/admin/tenants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create tenant');
      }
      
      addToast({
        title: 'Success',
        description: 'Tenant created successfully!',
        duration: 5000
      });
      
      // Navigate to the tenant details page
      navigate('/super-admin/tenants');
    } catch (error) {
      console.error('Error creating tenant:', error);
      addToast({
        title: 'Error',
        description: error.message || 'Failed to create tenant',
        variant: 'destructive',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="sm"
          className="text-gray-400 hover:text-white mr-2"
          onClick={() => navigate('/super-admin/tenants')}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-white">Create New Tenant</h1>
      </div>
      
      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5 text-blue-500" />
            Tenant Information
          </CardTitle>
          <CardDescription className="text-gray-400">
            Enter the details to create a new tenant organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} id="create-tenant-form" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Store Name */}
              <div className="space-y-2">
                <Label htmlFor="storeName" className="text-gray-300">
                  Store Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <Input
                    id="storeName"
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleChange}
                    onBlur={generateDbName}
                    placeholder="My Store"
                    className="pl-10 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                {errors.storeName && (
                  <p className="text-red-500 text-xs mt-1">{errors.storeName}</p>
                )}
              </div>
              
              {/* Database Name */}
              <div className="space-y-2">
                <Label htmlFor="dbName" className="text-gray-300">
                  Database Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Database className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <Input
                    id="dbName"
                    name="dbName"
                    value={formData.dbName}
                    onChange={handleChange}
                    placeholder="my_store_db"
                    className="pl-10 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                {errors.dbName ? (
                  <p className="text-red-500 text-xs mt-1">{errors.dbName}</p>
                ) : (
                  <p className="text-gray-500 text-xs mt-1">
                    Lowercase letters, numbers, and underscores only
                  </p>
                )}
              </div>
              
              {/* Admin Email */}
              <div className="space-y-2">
                <Label htmlFor="adminEmail" className="text-gray-300">
                  Admin Email <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <Input
                    id="adminEmail"
                    name="adminEmail"
                    type="email"
                    value={formData.adminEmail}
                    onChange={handleChange}
                    placeholder="admin@example.com"
                    className="pl-10 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                {errors.adminEmail && (
                  <p className="text-red-500 text-xs mt-1">{errors.adminEmail}</p>
                )}
              </div>
              
              {/* Admin Name */}
              <div className="space-y-2">
                <Label htmlFor="adminName" className="text-gray-300">
                  Admin Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <Input
                    id="adminName"
                    name="adminName"
                    value={formData.adminName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="pl-10 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                {errors.adminName && (
                  <p className="text-red-500 text-xs mt-1">{errors.adminName}</p>
                )}
              </div>
              
              {/* Admin Password */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="adminPassword" className="text-gray-300">
                  Admin Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <Input
                    id="adminPassword"
                    name="adminPassword"
                    type="password"
                    value={formData.adminPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="pl-10 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                {errors.adminPassword ? (
                  <p className="text-red-500 text-xs mt-1">{errors.adminPassword}</p>
                ) : (
                  <p className="text-gray-500 text-xs mt-1">
                    Password must be at least 6 characters
                  </p>
                )}
              </div>
            </div>
            
            <Alert className="bg-gray-700 border-blue-500 text-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-sm">
                A new tenant will be created with its own isolated database. The admin user will have full access to manage the tenant's data.
              </AlertDescription>
            </Alert>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4 border-t border-gray-700 pt-4">
          <Button 
            variant="ghost"
            className="text-gray-300 hover:text-white"
            onClick={() => navigate('/super-admin/tenants')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            form="create-tenant-form"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Tenant'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateTenant; 