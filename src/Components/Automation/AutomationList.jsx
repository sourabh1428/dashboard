import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from "@/hooks/use-toast";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Play,
  Pause,
  Trash2,
  Copy,
  ExternalLink,
  RefreshCw,
  CalendarClock,
  Clock,
  Mail,
  Tag,
  ClipboardList,
  Settings,
  MessageSquare
} from 'lucide-react';

const AutomationList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [automations, setAutomations] = useState([]);
  const [filteredAutomations, setFilteredAutomations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchAutomations();
  }, []);

  useEffect(() => {
    filterAutomations();
  }, [searchTerm, activeFilter, automations]);

  const fetchAutomations = async () => {
    try {
      setIsLoading(true);
      const config = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-api-key': localStorage.getItem('apiKey') || 'dev-default-key-123'
        }
      };
      
      const response = await axios.get('/automation', config);
      setAutomations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching automations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load automations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterAutomations = () => {
    let filtered = [...automations];
    
    // Apply status filter - using active property instead of status
    if (activeFilter !== 'all') {
      filtered = filtered.filter(automation => 
        activeFilter === 'active' ? automation.active : !automation.active
      );
    }
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(automation => 
        automation.name.toLowerCase().includes(search) || 
        (automation.description && automation.description.toLowerCase().includes(search)) ||
        automation.category.toLowerCase().includes(search)
      );
    }
    
    setFilteredAutomations(filtered);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-api-key': localStorage.getItem('apiKey') || 'dev-default-key-123'
        }
      };
      
      // Use the status endpoint and send the opposite of current status
      const response = await axios.patch(
        `/automation/${id}/status`,
        { active: !currentStatus },
        config
      );
      
      // Check if response contains the automation object
      if (response.data) {
        setAutomations(automations.map(automation => 
          automation._id === id ? response.data : automation
        ));
        
        toast({
          title: 'Success',
          description: `Automation ${response.data.active ? 'activated' : 'paused'}`,
        });
      }
    } catch (error) {
      console.error('Error toggling automation status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update automation status',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicateAutomation = async (id) => {
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-api-key': localStorage.getItem('apiKey') || 'dev-default-key-123'
        }
      };
      
      const response = await axios.post(`/automation/${id}/duplicate`, {}, config);
      
      if (response.data.success) {
        fetchAutomations();
        
        toast({
          title: 'Success',
          description: 'Automation duplicated successfully',
        });
      }
    } catch (error) {
      console.error('Error duplicating automation:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate automation',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAutomation = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this automation?');
    if (!confirmDelete) return;
    
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-api-key': localStorage.getItem('apiKey') || 'dev-default-key-123'
        }
      };
      
      const response = await axios.delete(`/automation/${id}`, config);
      
      if (response.data.success) {
        setAutomations(automations.filter(automation => automation._id !== id));
        
        toast({
          title: 'Success',
          description: 'Automation deleted successfully',
        });
      }
    } catch (error) {
      console.error('Error deleting automation:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete automation',
        variant: 'destructive',
      });
    }
  };

  const getTriggerIcon = (trigger) => {
    if (!trigger) return null;
    
    if (trigger.type === 'schedule') {
      return <CalendarClock className="h-4 w-4 text-purple-500" />;
    } else if (trigger.type === 'event') {
      switch (trigger.event) {
        case 'email_opened':
          return <Mail className="h-4 w-4 text-blue-500" />;
        default:
          return <Clock className="h-4 w-4 text-yellow-500" />;
      }
    }
    
    return null;
  };

  const getTriggerName = (trigger) => {
    if (!trigger) return 'Unknown trigger';
    
    if (trigger.type === 'event') {
      switch (trigger.event) {
        case 'new_signup':
          return 'New Signup';
        case 'abandoned_cart':
          return 'Abandoned Cart';
        case 'purchase_completed':
          return 'Purchase Completed';
        case 'email_opened':
          return 'Email Opened';
        default:
          return trigger.event;
      }
    } else if (trigger.type === 'schedule') {
      switch (trigger.event) {
        case 'daily':
          return 'Daily';
        case 'weekly':
          return 'Weekly';
        default:
          return 'Scheduled';
      }
    }
    
    return 'Unknown trigger';
  };

  const countActionsByType = (actions) => {
    const counts = {
      send_email: 0,
      create_task: 0,
      tag_contact: 0,
      wait: 0,
      other: 0
    };
    
    actions.forEach(action => {
      if (counts[action.type] !== undefined) {
        counts[action.type]++;
      } else {
        counts.other++;
      }
    });
    
    return counts;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <RefreshCw className="h-10 w-10 animate-spin mx-auto text-blue-500 mb-4" />
        <p className="text-lg">Loading automations...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Automations</h1>
          <p className="text-gray-600">
            Create and manage your automated workflows
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button 
            variant="outline"
            onClick={() => navigate('/automation/settings')}
          >
            <Settings className="mr-2 h-4 w-4" /> Settings
          </Button>
          <Button 
            onClick={() => navigate('/automation/create')}
          >
            <Plus className="mr-2 h-4 w-4" /> Create Automation
          </Button>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Search automations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={activeFilter === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveFilter('all')}
          >
            All
          </Button>
          <Button 
            variant={activeFilter === 'active' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveFilter('active')}
          >
            Active
          </Button>
          <Button 
            variant={activeFilter === 'inactive' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveFilter('inactive')}
          >
            Paused
          </Button>
        </div>
      </div>
      
      {/* No results state */}
      {!isLoading && filteredAutomations.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-center mb-4">
            {searchTerm || activeFilter !== 'all' ? (
              <Search className="h-12 w-12 text-gray-300" />
            ) : (
              <ClipboardList className="h-12 w-12 text-gray-300" />
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || activeFilter !== 'all' 
              ? 'No matching automations found' 
              : 'No automations yet'}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            {searchTerm || activeFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria to find what you\'re looking for.'
              : 'Create your first automation workflow to automate your marketing and customer engagement.'}
          </p>
          {!(searchTerm || activeFilter !== 'all') && (
            <Button 
              onClick={() => navigate('/automation/create')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Automation
            </Button>
          )}
        </div>
      )}

      {/* Results grid with improved cards */}
      {!isLoading && filteredAutomations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAutomations.map((automation) => {
            const actionCounts = countActionsByType(automation.actions || []);
            
            return (
              <Card 
                key={automation._id} 
                className="overflow-hidden hover:shadow-md transition-shadow border border-gray-200"
              >
                <CardHeader className="pb-3 bg-gray-50 border-b">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={automation.active ? "default" : "outline"}
                        className={automation.active ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
                      >
                        {automation.active ? "Active" : "Paused"}
                      </Badge>
                      <Badge variant="outline" className="bg-gray-100">{automation.category}</Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/automation/${automation._id}`)}>
                          <ExternalLink className="h-4 w-4 mr-2" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/automation/${automation._id}/edit`)}>
                          <Settings className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(automation._id, automation.active)}>
                          {automation.active 
                            ? <><Pause className="h-4 w-4 mr-2" /> Pause</> 
                            : <><Play className="h-4 w-4 mr-2" /> Activate</>}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateAutomation(automation._id)}>
                          <Copy className="h-4 w-4 mr-2" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteAutomation(automation._id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle 
                    className="text-xl mt-2 hover:text-blue-600 cursor-pointer"
                    onClick={() => navigate(`/automation/${automation._id}`)}
                  >
                    {automation.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                    {automation.description || 'No description provided'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    {/* Trigger */}
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      {getTriggerIcon(automation.trigger)}
                      <div className="ml-3">
                        <p className="text-xs text-gray-500">Trigger</p>
                        <p className="text-sm font-medium">
                          {getTriggerName(automation.trigger)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Actions Summary */}
                    <div className="border-t pt-3">
                      <p className="text-xs text-gray-500 mb-2">Actions ({automation.actions?.length || 0})</p>
                      <div className="flex flex-wrap gap-2">
                        {automation.actions?.some(a => a.type === 'send_whatsapp') && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <MessageSquare className="h-3 w-3 mr-1" /> WhatsApp
                          </Badge>
                        )}
                        {automation.actions?.some(a => a.type === 'send_email') && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            <Mail className="h-3 w-3 mr-1" /> Email
                          </Badge>
                        )}
                        {automation.actions?.some(a => a.type === 'create_task') && (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            <ClipboardList className="h-3 w-3 mr-1" /> Task
                          </Badge>
                        )}
                        {automation.actions?.some(a => a.type === 'tag_contact') && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            <Tag className="h-3 w-3 mr-1" /> Tag
                          </Badge>
                        )}
                        {automation.actions?.some(a => a.type === 'wait') && (
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                            <Clock className="h-3 w-3 mr-1" /> Wait
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Stats */}
                    {(automation.runCount > 0 || automation.lastRunAt) && (
                      <div className="flex justify-between text-xs text-gray-500 pt-3 border-t">
                        <div>
                          <p>Runs: {automation.runCount || 0}</p>
                        </div>
                        <div>
                          {automation.lastRunAt && (
                            <p>Last run: {new Date(automation.lastRunAt).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AutomationList;

 