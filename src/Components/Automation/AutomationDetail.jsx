import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from "@/hooks/use-toast";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ArrowLeft,
  MessageSquare,
  CalendarClock,
  Tag,
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Play,
  Settings,
  History,
  Activity,
  Edit,
  Sparkles,
  Info,
  Mail
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const AutomationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [automation, setAutomation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [executionHistory, setExecutionHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [executeDialogOpen, setExecuteDialogOpen] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [skipSend, setSkipSend] = useState(false);
  const phoneInputRef = useRef(null);
  const emailInputRef = useRef(null);

  useEffect(() => {
    fetchAutomation();
    fetchExecutionHistory();
  }, [id]);

  const fetchAutomation = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-api-key': localStorage.getItem('apiKey') || 'dev-default-key-123'
        }
      };
      
      const response = await axios.get(`/automation/${id}`, config);
      setAutomation(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching automation:', err);
      setError('Failed to load automation details');
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Could not load automation details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchExecutionHistory = async () => {
    try {
      setHistoryLoading(true);
      const config = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-api-key': localStorage.getItem('apiKey') || 'dev-default-key-123'
        }
      };
      
      const response = await axios.get(`/automation/${id}/executions`, config);
      setExecutionHistory(response.data || []);
    } catch (err) {
      console.error('Error fetching execution history:', err);
      toast({
        title: 'Warning',
        description: 'Could not load execution history',
        variant: 'default',
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!automation) return;
    
    try {
      setToggleLoading(true);
      const config = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-api-key': localStorage.getItem('apiKey') || 'dev-default-key-123'
        }
      };
      
      const newStatus = !automation.active;
      const response = await axios.patch(`/automation/${id}/status`, 
        { active: newStatus }, 
        config
      );
      
      setAutomation(prev => ({
        ...prev,
        active: newStatus
      }));
      
      toast({
        title: 'Success',
        description: `Automation ${newStatus ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (err) {
      console.error('Error toggling automation status:', err);
      toast({
        title: 'Error',
        description: 'Failed to update automation status',
        variant: 'destructive',
      });
    } finally {
      setToggleLoading(false);
    }
  };

  const handleExecute = () => {
    setExecuteDialogOpen(true);
  };

  const executeAutomation = async (testParams = {}) => {
    try {
      setExecuting(true);
      
      // Get the token and ensure it exists
      const token = localStorage.getItem('token');
      const apiKey = localStorage.getItem('apiKey') || 'dev-default-key-123';
      
      if (!token) {
        throw new Error('Authentication token is missing. Please sign in again.');
      }
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      };
      
      console.log('Execute automation headers:', config.headers);
      console.log('Execute automation payload:', testParams);
      
      // Send test parameters in request body
      const response = await axios.post(
        `/automation/${id}/execute`, 
        testParams,
        config
      );
      
      if (response.data.success) {
        setExecuteDialogOpen(false);
        toast({
          title: 'Success',
          description: 'Automation execution started',
        });
        // Refresh execution history after a short delay
        setTimeout(() => {
          fetchExecutionHistory();
        }, 2000);
      }
    } catch (error) {
      console.error('Execute automation error:', error);
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        toast({
          title: 'Authentication Error',
          description: 'Your session has expired. Please sign in again.',
          variant: 'destructive',
        });
        // Redirect to sign in page after a short delay
        setTimeout(() => {
          localStorage.removeItem('token');
          navigate('/signin');
        }, 2000);
      } else {
        toast({
          title: 'Error',
          description: error.response?.data?.error || 'Failed to execute automation',
          variant: 'destructive',
        });
      }
    } finally {
      setExecuting(false);
    }
  };

  const handleRunTest = () => {
    const testParams = {
      skipActualSend: skipSend,
      phoneNumber: phoneInputRef.current?.value,
      email: emailInputRef.current?.value
    };
    executeAutomation(testParams);
  };

  // Helper function to get icon for action type
  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'send_whatsapp':
        return <MessageSquare className="h-4 w-4 text-green-600" />;
      case 'create_task':
        return <ClipboardList className="h-4 w-4 text-blue-600" />;
      case 'tag_contact':
        return <Tag className="h-4 w-4 text-purple-600" />;
      case 'wait':
        return <Clock className="h-4 w-4 text-amber-600" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Helper function to display trigger details
  const getTriggerDisplay = (trigger) => {
    if (!trigger) return 'Unknown trigger';
    
    if (trigger.type === 'event') {
      switch (trigger.event) {
        case 'new_signup':
          return 'When a new user signs up';
        case 'abandoned_cart':
          return 'When a user abandons their cart';
        case 'purchase_completed':
          return 'When a purchase is completed';
        case 'whatsapp_message_received':
          return 'When a WhatsApp message is received';
        default:
          return `When event "${trigger.event}" occurs`;
      }
    } else if (trigger.type === 'schedule') {
      return trigger.event === 'daily' 
        ? 'Every day at a specific time' 
        : 'Every week on a specific day';
    }
    
    return 'Unknown trigger type';
  };

  // Helper function to get color for action type
  const getActionColor = (actionType) => {
    switch (actionType) {
      case 'send_whatsapp':
        return 'bg-green-50 border-green-100 text-green-700';
      case 'create_task':
        return 'bg-blue-50 border-blue-100 text-blue-700';
      case 'tag_contact':
        return 'bg-purple-50 border-purple-100 text-purple-700';
      case 'wait':
        return 'bg-amber-50 border-amber-100 text-amber-700';
      default:
        return 'bg-gray-50 border-gray-100 text-gray-700';
    }
  };

  // Helper function to get status badge for execution history
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-normal">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Completed
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-normal">
            <XCircle className="h-3.5 w-3.5 mr-1" /> Failed
          </Badge>
        );
      case 'running':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-normal">
            <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" /> Running
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="font-normal">
            <AlertCircle className="h-3.5 w-3.5 mr-1" /> {status}
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate('/automation')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Automations
        </Button>
        
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-8 w-20" />
          </div>
          
          <Skeleton className="h-[500px] w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate('/automation')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Automations
        </Button>
        
        <div className="max-w-5xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
              <Button 
                onClick={fetchAutomation} 
                className="mt-4 w-full"
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        {/* Header section with background and navigation */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex justify-between items-center mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/automation')}
              className="text-white/90 hover:text-white hover:bg-white/10 transition-all"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Automations
            </Button>
            
            <div className="flex items-center gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/automation/${id}/edit`)}
                      className="text-white border-white/30 bg-white/10 hover:bg-white/20 hover:border-white/40"
                    >
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Edit this automation</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={automation?.active ? "default" : "outline"}
                      size="sm"
                      onClick={handleExecute}
                      disabled={!automation?.active}
                      className={automation?.active ? 
                        "bg-green-500 hover:bg-green-600 text-white border-none" : 
                        "bg-white/10 text-white/60 border-white/20"}
                    >
                      <Play className="h-4 w-4 mr-1" /> Run Now
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      {automation?.active 
                        ? 'Manually trigger this automation' 
                        : 'Activate the automation to run it manually'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center">
                  <h1 className="text-3xl font-bold text-white">{automation?.name}</h1>
                  {automation?.active ? (
                    <Badge className="ml-3 bg-green-500/20 text-green-100 border-green-400/30 hover:bg-green-500/30">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="ml-3 border-white/20 text-white/80 bg-white/5">
                      Inactive
                    </Badge>
                  )}
                </div>
                {automation?.description && (
                  <p className="text-white/80 mt-2 max-w-xl">{automation?.description}</p>
                )}
              </div>
              
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <span className="text-sm font-medium text-white/90">
                  {automation?.active ? 'Automation is running' : 'Automation is paused'}
                </span>
                <Switch 
                  checked={automation?.active} 
                  disabled={toggleLoading}
                  onCheckedChange={handleToggleStatus}
                  className={automation?.active ? "data-[state=checked]:bg-green-500" : ""}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                <Settings className="h-3.5 w-3.5 mr-1.5" /> 
                {automation?.category || 'General'}
              </Badge>
              
              <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> 
                {automation?.runCount || 0} Executions
              </Badge>
              
              {automation?.lastRunAt && (
                <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                  <Clock className="h-3.5 w-3.5 mr-1.5" /> 
                  Last Run: {new Date(automation.lastRunAt).toLocaleString()}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6 bg-gray-100/80 p-1 rounded-lg">
              <TabsTrigger value="overview" className="flex items-center gap-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700">
                <Activity className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700">
                <History className="h-4 w-4" />
                <span>Execution History</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card className="border border-gray-200 shadow-sm overflow-hidden rounded-xl hover:shadow-md transition-shadow">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                  <CardTitle className="text-xl flex items-center text-blue-800">
                    <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
                    Trigger
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    When this automation will run
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 bg-gradient-to-b from-blue-50/50 to-white">
                  <div className="p-4 bg-white border border-blue-100 rounded-lg shadow-sm">
                    <div className="flex items-start">
                      {automation?.trigger?.type === 'schedule' ? (
                        <div className="p-2 bg-blue-100 rounded-full shadow-sm mr-3">
                          <CalendarClock className="h-5 w-5 text-blue-600" />
                        </div>
                      ) : (
                        <div className="p-2 bg-amber-100 rounded-full shadow-sm mr-3">
                          <Sparkles className="h-5 w-5 text-amber-600" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {getTriggerDisplay(automation?.trigger)}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {automation?.trigger?.type === 'schedule' 
                            ? 'Runs automatically based on a schedule'
                            : 'Triggered when a specific event occurs'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-gray-200 shadow-sm overflow-hidden rounded-xl hover:shadow-md transition-shadow">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <CardTitle className="text-xl flex items-center text-gray-800">
                    <ClipboardList className="h-5 w-5 mr-2 text-gray-600" />
                    Action Sequence
                  </CardTitle>
                  <CardDescription>
                    Steps executed when the automation runs
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {automation?.actions?.map((action, index) => (
                    <div
                      key={index}
                      className={`p-5 ${index !== 0 ? 'border-t' : ''} hover:bg-gray-50 transition-colors relative group`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full shadow-sm flex items-center justify-center shrink-0 ${getActionColor(action.type)} group-hover:shadow transition-shadow`}>
                          {getActionIcon(action.type)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium flex items-center">
                              <Badge variant="outline" className="mr-2 py-0.5 bg-gray-100 border-gray-200 text-gray-700 group-hover:bg-blue-100 group-hover:text-blue-800 group-hover:border-blue-200 transition-colors">Step {index + 1}</Badge>
                              {action.type === 'send_whatsapp' ? 'Send WhatsApp Message' :
                               action.type === 'create_task' ? 'Create Task' :
                               action.type === 'tag_contact' ? 'Add Tag to Contact' :
                               action.type === 'wait' ? 'Wait' : 
                               action.type}
                            </h3>
                          </div>
                          
                          {action.type === 'send_whatsapp' && (
                            <div className="mt-3 space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium text-gray-700">Template:</span>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-normal">
                                  {action.templateId}
                                </Badge>
                              </div>
                              
                              {action.params && Object.keys(action.params).length > 0 && (
                                <div className="text-sm bg-white rounded-lg p-3 border border-gray-100 mt-3 shadow-sm group-hover:shadow-md transition-shadow">
                                  <div className="font-medium text-gray-700 mb-2">Parameters:</div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {Object.entries(action.params).map(([key, value], i) => (
                                      <div key={i} className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200 group-hover:border-blue-200 transition-colors">
                                        <span className="text-gray-500 font-medium">{key}:</span>
                                        <span className="text-gray-800">{value}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {action.type === 'create_task' && (
                            <div className="mt-3 space-y-2">
                              <div className="flex flex-col gap-1 text-sm">
                                <div className="font-medium text-gray-700">{action.title}</div>
                                <p className="text-gray-600">{action.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    Priority: {action.priority}
                                  </Badge>
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    Due in: {action.dueDateDays} days
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {action.type === 'tag_contact' && (
                            <div className="mt-3 space-y-2">
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">Tag:</span>
                                <Badge className="ml-2 bg-purple-100 text-purple-700 border-purple-200 group-hover:bg-purple-200 transition-colors">
                                  {action.tag}
                                </Badge>
                              </div>
                            </div>
                          )}
                          
                          {action.type === 'wait' && (
                            <div className="mt-3 space-y-2">
                              <div className="text-sm flex items-center">
                                <span className="font-medium text-gray-700">Duration:</span>
                                <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200 font-normal group-hover:bg-amber-100 transition-colors">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {action.duration} {action.unit}
                                </Badge>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Arrow connecting to next action */}
                      {index < automation.actions.length - 1 && (
                        <div className="absolute left-[23px] -bottom-4 h-8 w-5 flex justify-center z-10">
                          <div className="h-full w-0.5 bg-gray-300 group-hover:bg-blue-300 transition-colors"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* History Tab */}
            <TabsContent value="history" className="space-y-6">
              <Card className="border border-gray-200 shadow-sm overflow-hidden rounded-xl hover:shadow-md transition-shadow">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-xl flex items-center">
                        <History className="h-5 w-5 mr-2 text-gray-600" />
                        Execution History
                      </CardTitle>
                      <CardDescription>
                        Recent automation runs and their outcomes
                      </CardDescription>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchExecutionHistory}
                      disabled={historyLoading}
                      className="text-gray-600 hover:bg-white hover:text-gray-900 transition-colors"
                    >
                      <RefreshCw className={`h-4 w-4 mr-1 ${historyLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {historyLoading ? (
                    <div className="space-y-3 p-6">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : executionHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50/80">
                            <TableHead className="font-semibold">Date</TableHead>
                            <TableHead className="font-semibold">Status</TableHead>
                            <TableHead className="font-semibold">Details</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {executionHistory.map((execution, index) => (
                            <TableRow key={index} className="hover:bg-blue-50/30 transition-colors">
                              <TableCell className="font-medium">
                                {new Date(execution.timestamp).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(execution.status)}
                              </TableCell>
                              <TableCell>
                                {execution.error ? (
                                  <span className="text-red-600 text-sm bg-red-50 px-3 py-1 rounded-full border border-red-100">{execution.error}</span>
                                ) : (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 px-3 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                                          <Info className="h-4 w-4 mr-1.5" />
                                          View Details
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-white p-0 shadow-xl border border-gray-200 rounded-lg">
                                        <div className="w-80 p-3">
                                          <h4 className="font-medium mb-2 text-gray-800 pb-2 border-b border-gray-100">Execution Results</h4>
                                          <div className="text-xs space-y-2 max-h-60 overflow-y-auto">
                                            {execution.results?.map((result, i) => (
                                              <div key={i} className={`p-2.5 rounded-md ${result.success ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
                                                {result.success ? (
                                                  <div className="flex items-center">
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 mr-1.5 flex-shrink-0" />
                                                    <span className="text-green-700">{result.message || 'Action completed successfully'}</span>
                                                  </div>
                                                ) : (
                                                  <div className="flex items-center">
                                                    <XCircle className="h-3.5 w-3.5 text-red-600 mr-1.5 flex-shrink-0" />
                                                    <span className="text-red-700">{result.error || 'Action failed'}</span>
                                                  </div>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="py-16 text-center">
                      <div className="bg-gray-100 w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-5 shadow-inner">
                        <Clock className="h-12 w-12 text-gray-300" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-900 mb-3">No Execution History</h3>
                      <p className="text-gray-500 max-w-sm mx-auto">
                        This automation hasn't been executed yet. Use the "Run Now" button to trigger it manually.
                      </p>
                      <Button 
                        onClick={handleExecute} 
                        className="mt-6 bg-blue-600 hover:bg-blue-700 transition-all shadow-sm hover:shadow px-6"
                        disabled={!automation?.active}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Run Now
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Execute Dialog */}
          {automation && (
            <Dialog open={executeDialogOpen} onOpenChange={setExecuteDialogOpen}>
              <DialogContent className="sm:max-w-md bg-white p-0 overflow-hidden rounded-xl shadow-xl">
                <DialogHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5 border-b border-blue-700 text-white">
                  <DialogTitle className="text-xl flex items-center">
                    <Play className="h-5 w-5 mr-2 text-blue-200" />
                    Test Automation
                  </DialogTitle>
                  <DialogDescription className="text-blue-100">
                    Run this automation with test data and see the results
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-5 p-6">
                  {/* Show phone number input if automation contains WhatsApp action */}
                  {automation.actions.some(a => a.type === 'send_whatsapp') && (
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-gray-700 font-medium">Phone Number</Label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="phoneNumber"
                          placeholder="+1234567890"
                          ref={phoneInputRef}
                          className="pl-10 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                        />
                      </div>
                      <p className="text-xs text-gray-500">Required for WhatsApp messages (include country code)</p>
                    </div>
                  )}
                  
                  {/* Show email input if automation contains email action */}
                  {automation.actions.some(a => a.type === 'send_email') && (
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700 font-medium">Test Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          placeholder="test@example.com"
                          ref={emailInputRef}
                          className="pl-10 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                        />
                      </div>
                      <p className="text-xs text-gray-500">Required for email actions</p>
                    </div>
                  )}
                  
                  <div className="space-y-2 pt-2">
                    <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-lg flex items-start gap-3 shadow-sm">
                      <div className="p-2 bg-white rounded-full mt-0.5 shadow-sm">
                        <Settings className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="skipActualSend" 
                            checked={skipSend}
                            onCheckedChange={setSkipSend}
                            className="border-amber-400 data-[state=checked]:bg-amber-500"
                          />
                          <Label htmlFor="skipActualSend" className="text-gray-700 font-medium">Test mode (simulate only)</Label>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Run through all steps without actually sending messages or creating tasks
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <DialogFooter className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                  <DialogClose asChild>
                    <Button variant="outline" className="border-gray-200 hover:bg-gray-100 transition-colors">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button 
                    onClick={handleRunTest} 
                    disabled={executing}
                    className="bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm hover:shadow"
                  >
                    {executing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Run Test
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutomationDetail; 