import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../../hooks/useToast';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  ArrowUpRight,
  Plus,
  ArrowRight,
  Clock,
  Mail,
  Bell,
  CalendarClock,
  Tag,
  ClipboardList,
  Activity,
  BarChart2,
  Zap,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAutomations: 0,
    activeAutomations: 0,
    totalExecutions: 0,
    successRate: 0
  });
  const [recentAutomations, setRecentAutomations] = useState([]);
  const [automationsByCategory, setAutomationsByCategory] = useState([]);
  const [executionTrend, setExecutionTrend] = useState([]);
  
  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const config = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-api-key': localStorage.getItem('apiKey') || 'dev-default-key-123'
        }
      };
      
      // For a real app, you'd fetch this data from an endpoint
      // Simulating API response for demo purposes
      
      // Fetch dashboard stats
      const statsData = {
        totalAutomations: 12,
        activeAutomations: 8,
        totalExecutions: 432,
        successRate: 95.7
      };
      
      // Fetch recent automations
      const automations = await axios.get('/automation', config);
      const recentAutomationsData = automations.data.automations?.slice(0, 5) || generateMockAutomations();
      
      // Generate mock category data
      const categoryData = [
        { name: 'Marketing', value: 5 },
        { name: 'Sales', value: 3 },
        { name: 'Customer Service', value: 2 },
        { name: 'Analytics', value: 2 }
      ];
      
      // Generate mock execution trend data
      const trendData = [
        { name: 'Mon', executions: 65, successful: 62 },
        { name: 'Tue', executions: 78, successful: 75 },
        { name: 'Wed', executions: 85, successful: 81 },
        { name: 'Thu', executions: 72, successful: 68 },
        { name: 'Fri', executions: 96, successful: 92 },
        { name: 'Sat', executions: 55, successful: 52 },
        { name: 'Sun', executions: 48, successful: 45 }
      ];
      
      setStats(statsData);
      setRecentAutomations(recentAutomationsData);
      setAutomationsByCategory(categoryData);
      setExecutionTrend(trendData);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockAutomations = () => {
    return [
      {
        _id: '1',
        name: 'Welcome Email Sequence',
        status: true,
        category: 'Marketing',
        trigger: { type: 'event', event: 'new_signup' },
        actions: [{ type: 'send_email' }, { type: 'wait' }, { type: 'send_email' }],
        runCount: 286,
        createdAt: new Date().toISOString(),
        lastRunAt: new Date().toISOString()
      },
      {
        _id: '2',
        name: 'Abandoned Cart Recovery',
        status: true,
        category: 'Sales',
        trigger: { type: 'event', event: 'abandoned_cart' },
        actions: [{ type: 'send_email' }, { type: 'wait' }, { type: 'tag_contact' }],
        runCount: 142,
        createdAt: new Date().toISOString(),
        lastRunAt: new Date().toISOString()
      },
      {
        _id: '3',
        name: 'Follow-up Task Creation',
        status: false,
        category: 'Customer Service',
        trigger: { type: 'event', event: 'purchase_completed' },
        actions: [{ type: 'wait' }, { type: 'create_task' }],
        runCount: 67,
        createdAt: new Date().toISOString(),
        lastRunAt: new Date().toISOString()
      }
    ];
  };

  const getTriggerIcon = (trigger) => {
    if (!trigger) return <Bell className="h-4 w-4 text-gray-500" />;
    
    if (trigger.type === 'schedule') {
      return <CalendarClock className="h-4 w-4 text-purple-500" />;
    } else if (trigger.type === 'event') {
      switch (trigger.event) {
        case 'email_opened':
          return <Mail className="h-4 w-4 text-blue-500" />;
        case 'new_signup':
          return <Bell className="h-4 w-4 text-green-500" />;
        case 'abandoned_cart':
          return <Clock className="h-4 w-4 text-amber-500" />;
        case 'purchase_completed':
          return <CheckCircle className="h-4 w-4 text-emerald-500" />;
        default:
          return <Bell className="h-4 w-4 text-gray-500" />;
      }
    }
    
    return <Bell className="h-4 w-4 text-gray-500" />;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <RefreshCw className="h-10 w-10 animate-spin mx-auto text-blue-500 mb-4" />
        <p className="text-lg">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">Overview of your automation workflows</p>
        </div>
        <Button onClick={() => navigate('/automation/create')}>
          <Plus className="mr-2 h-4 w-4" /> Create Automation
        </Button>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Automations</p>
                <p className="text-3xl font-bold mt-1">{stats.totalAutomations}</p>
              </div>
              <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <Zap className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-xs text-green-500">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>+24% from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Automations</p>
                <p className="text-3xl font-bold mt-1">{stats.activeAutomations}</p>
              </div>
              <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <Activity className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-xs text-green-500">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>{Math.round((stats.activeAutomations / stats.totalAutomations) * 100)}% of total</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Executions</p>
                <p className="text-3xl font-bold mt-1">{stats.totalExecutions}</p>
              </div>
              <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                <BarChart2 className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-xs text-green-500">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>+35% from last week</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Success Rate</p>
                <p className="text-3xl font-bold mt-1">{stats.successRate}%</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-xs text-green-500">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>+2.3% improvement</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Execution Trend</CardTitle>
            <CardDescription>Daily automation executions for the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={executionTrend}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="executions" fill="#4f46e5" name="Total Executions" />
                  <Bar dataKey="successful" fill="#10b981" name="Successful" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Automations by Category</CardTitle>
            <CardDescription>Distribution of automations across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={automationsByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {automationsByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Automations Section */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Automations</CardTitle>
            <CardDescription>Your recently created or updated automations</CardDescription>
          </div>
          <Button variant="outline" onClick={() => navigate('/automation')}>
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trigger</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Run Count</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Run</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentAutomations.map((automation) => (
                  <tr 
                    key={automation._id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/automation/${automation._id}`)}
                  >
                    <td className="py-4 px-4">
                      <div className="font-medium text-blue-600">{automation.name}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        {getTriggerIcon(automation.trigger)}
                        <span className="ml-2 text-sm">
                          {automation.trigger?.event || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={automation.status ? "success" : "outline"}>
                        {automation.status ? "Active" : "Paused"}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm">{automation.category}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm">{automation.runCount}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm">
                        {automation.lastRunAt
                          ? new Date(automation.lastRunAt).toLocaleDateString()
                          : 'Never'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Quick Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performer</CardTitle>
            <CardDescription>Most successful automation</CardDescription>
          </CardHeader>
          <CardContent>
            {recentAutomations.length > 0 && (
              <div className="text-center p-4">
                <div className="mb-4 inline-flex p-3 rounded-full bg-emerald-100">
                  <CheckCircle className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold">{recentAutomations[0].name}</h3>
                <p className="text-sm text-gray-500 mt-1">{recentAutomations[0].runCount} successful runs</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate(`/automation/${recentAutomations[0]._id}`)}
                >
                  View Details
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Needs Attention</CardTitle>
            <CardDescription>Automations with issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center p-4">
              <div className="mb-4 inline-flex p-3 rounded-full bg-amber-100">
                <AlertTriangle className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold">No Issues Detected</h3>
              <p className="text-sm text-gray-500 mt-1">All automations are running smoothly</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate('/automation')}
              >
                View All Automations
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Inactive Automations</CardTitle>
            <CardDescription>Paused workflows</CardDescription>
          </CardHeader>
          <CardContent>
            {recentAutomations.some(a => !a.status) ? (
              <div className="space-y-4">
                {recentAutomations
                  .filter(a => !a.status)
                  .slice(0, 2)
                  .map(automation => (
                    <div 
                      key={automation._id} 
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                      onClick={() => navigate(`/automation/${automation._id}`)}
                    >
                      <div className="flex items-center">
                        <XCircle className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="font-medium">{automation.name}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  ))
                }
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/automation?filter=inactive')}
                >
                  View All Inactive
                </Button>
              </div>
            ) : (
              <div className="text-center p-4">
                <div className="mb-4 inline-flex p-3 rounded-full bg-blue-100">
                  <CheckCircle className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold">All Automations Active</h3>
                <p className="text-sm text-gray-500 mt-1">No paused automations found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard; 