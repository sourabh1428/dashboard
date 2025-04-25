import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from '@/components/ui/toast';
import { useNavigate } from 'react-router-dom';
import { 
  Store, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  BarChart,
  Plus,
  RefreshCw,
  ArrowUpRight,
  Calendar
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({
    tenantCount: 0,
    activeTenantsCount: 0,
    superAdminCount: 0
  });
  const [recentTenants, setRecentTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('superAdminToken');
      
      if (!token) {
        navigate('/super-admin/login');
        return;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const data = await response.json();
      setStats(data.stats);
      setRecentTenants(data.recentTenants);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      addToast({
        title: 'Error',
        description: error.message || 'Failed to load dashboard data',
        variant: 'destructive',
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  // Format date safely handling null or invalid dates
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Date formatting error:', error, dateString);
      return 'Invalid date';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-gray-300 border-gray-700 hover:bg-gray-800"
          onClick={fetchDashboardData}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            <Card className="bg-gray-800 border-gray-700 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-400 text-sm">Total Tenants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold">{stats.tenantCount}</span>
                  <Store className="h-8 w-8 text-blue-500" />
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  {stats.activeTenantsCount} active tenants
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800 border-gray-700 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-400 text-sm">Active Tenants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold">{stats.activeTenantsCount}</span>
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  {Math.round((stats.activeTenantsCount / stats.tenantCount) * 100) || 0}% of total tenants
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800 border-gray-700 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-400 text-sm">Super Admins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold">{stats.superAdminCount}</span>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  System administrators
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Tenants */}
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Recent Tenants</CardTitle>
              <Button 
                size="sm" 
                onClick={() => navigate('/super-admin/tenants/new')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Tenant
              </Button>
            </CardHeader>
            <CardContent>
              {recentTenants.length > 0 ? (
                <div className="space-y-4">
                  {recentTenants.map((tenant) => (
                    <div 
                      key={tenant._id} 
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-700 bg-gray-900 hover:bg-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
                      onClick={() => navigate(`/super-admin/tenants/${tenant._id}`)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-2 h-2 rounded-full ${tenant.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div>
                          <h3 className="font-medium">{tenant.storeName}</h3>
                          <div className="text-sm text-gray-400">
                            {tenant.dbName} • {tenant.Users?.[0]?.user_email || 'No admin'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-400 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {formatDate(tenant.createdAt)}
                          </div>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <Store className="h-10 w-10 text-gray-600 mb-2" />
                  <p className="text-gray-400">No tenants found</p>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="mt-4 border-gray-700 hover:bg-gray-700 text-gray-300"
                    onClick={() => navigate('/super-admin/tenants/new')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create your first tenant
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Quick Actions */}
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader className="pb-2">
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="bg-gray-900 border-gray-700 hover:bg-gray-700 flex items-center justify-center h-24"
                  onClick={() => navigate('/super-admin/tenants/new')}
                >
                  <div className="flex flex-col items-center">
                    <Store className="h-6 w-6 mb-2 text-blue-500" />
                    <span>Create New Tenant</span>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="bg-gray-900 border-gray-700 hover:bg-gray-700 flex items-center justify-center h-24"
                  onClick={() => navigate('/super-admin/tenants')}
                >
                  <div className="flex flex-col items-center">
                    <BarChart className="h-6 w-6 mb-2 text-purple-500" />
                    <span>Manage Tenants</span>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="bg-gray-900 border-gray-700 hover:bg-gray-700 flex items-center justify-center h-24"
                  onClick={() => navigate('/super-admin/settings')}
                >
                  <div className="flex flex-col items-center">
                    <Users className="h-6 w-6 mb-2 text-green-500" />
                    <span>Manage Admins</span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default SuperAdminDashboard; 