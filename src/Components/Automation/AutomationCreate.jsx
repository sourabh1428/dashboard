import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from "@/hooks/use-toast";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter 
} from "@/components/ui/card";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Trash2,
  MessageSquare,
  CalendarClock,
  Tag,
  ClipboardList,
  ArrowLeft,
  RefreshCw,
  Save,
  Info,
  CheckCircle2,
  ChevronRight,
  Settings,
  Sparkles
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import WhatsappAutomation from './WhatsappAutomation';

const AutomationCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [automation, setAutomation] = useState({
    name: '',
    description: '',
    category: 'Marketing',
    trigger: {
      type: 'event',
      event: 'new_signup'
    },
    actions: [
      {
        type: 'send_whatsapp',
        templateId: '',
        params: {}
      }
    ],
    conditions: []
  });

  const triggerOptions = [
    { value: 'new_signup', label: 'New User Signup', type: 'event', description: 'Triggered when a new user creates an account' },
    { value: 'abandoned_cart', label: 'Abandoned Cart', type: 'event', description: 'Triggered when a user adds items to cart but doesn\'t checkout' },
    { value: 'purchase_completed', label: 'Purchase Completed', type: 'event', description: 'Triggered when a purchase is successfully completed' },
    { value: 'whatsapp_message_received', label: 'WhatsApp Message Received', type: 'event', description: 'Triggered when a WhatsApp message is received from a user' },
    { value: 'daily', label: 'Daily at specific time', type: 'schedule', schedule: '0 8 * * *', description: 'Runs every day at 8:00 AM' },
    { value: 'weekly', label: 'Weekly on Monday', type: 'schedule', schedule: '0 8 * * 1', description: 'Runs every Monday at 8:00 AM' }
  ];

  const actionTypes = [
    { value: 'send_whatsapp', label: 'Send WhatsApp', icon: <MessageSquare className="h-5 w-5" />, color: 'bg-green-100 text-green-700', description: 'Send a WhatsApp message using a template' },
    { value: 'create_task', label: 'Create Task', icon: <ClipboardList className="h-5 w-5" />, color: 'bg-blue-100 text-blue-700', description: 'Create a task for your team to follow up' },
    { value: 'tag_contact', label: 'Tag Contact', icon: <Tag className="h-5 w-5" />, color: 'bg-purple-100 text-purple-700', description: 'Add or remove tags from a contact' },
    { value: 'wait', label: 'Wait', icon: <RefreshCw className="h-5 w-5" />, color: 'bg-amber-100 text-amber-700', description: 'Wait for a specified duration before continuing' }
  ];

  // Check if form is complete enough to submit
  const isFormComplete = () => {
    return (
      automation.name.trim() !== '' && 
      automation.trigger && 
      automation.actions.length > 0 &&
      !automation.actions.some(action => action.type === 'send_whatsapp' && !action.templateId)
    );
  };

  // Handle input changes for basic automation details
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAutomation(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle selection of trigger type
  const handleTriggerChange = (value) => {
    const selectedTrigger = triggerOptions.find(opt => opt.value === value);
    setAutomation(prev => ({
      ...prev,
      trigger: {
        type: selectedTrigger.type,
        event: selectedTrigger.value,
        ...(selectedTrigger.schedule ? { schedule: selectedTrigger.schedule } : {})
      }
    }));
  };

  // Add a new action to the workflow
  const addAction = (type) => {
    let newAction = {};
    
    switch (type) {
      case 'send_whatsapp':
        newAction = {
          type: 'send_whatsapp',
          templateId: '',
          params: {}
        };
        break;
      case 'create_task':
        newAction = {
          type: 'create_task',
          title: 'New Task',
          description: 'Task description',
          priority: 'normal',
          dueDateDays: 3
        };
        break;
      case 'tag_contact':
        newAction = {
          type: 'tag_contact',
          tag: 'new-tag'
        };
        break;
      case 'wait':
        newAction = {
          type: 'wait',
          duration: 1,
          unit: 'days'
        };
        break;
      default:
        return;
    }
    
    setAutomation(prev => ({
      ...prev,
      actions: [...prev.actions, newAction]
    }));
  };

  // Update a specific action in the workflow
  const updateAction = (index, keyOrData, value) => {
    setAutomation(prev => {
      const newActions = [...prev.actions];
      
      // If value is undefined, it means we're handling the WhatsApp component
      // which provides the entire action object instead of key/value
      if (value === undefined && typeof keyOrData === 'object') {
        newActions[index] = {
          ...newActions[index],
          ...keyOrData
        };
      } else {
        // Handle regular key/value updates
        newActions[index] = {
          ...newActions[index],
          [keyOrData]: value
        };
      }
      
      return {
        ...prev,
        actions: newActions
      };
    });
  };

  // Remove an action from the workflow
  const removeAction = (index) => {
    setAutomation(prev => {
      const newActions = [...prev.actions];
      newActions.splice(index, 1);
      return {
        ...prev,
        actions: newActions
      };
    });
  };

  // Move to next tab
  const goToNextTab = () => {
    if (activeTab === "basic") {
      setActiveTab("trigger");
    } else if (activeTab === "trigger") {
      setActiveTab("actions");
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!automation.name) {
      toast({
        title: 'Validation Error',
        description: 'Automation name is required',
        variant: 'destructive',
      });
      return;
    }
    
    if (automation.actions.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'At least one action is required',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-api-key': localStorage.getItem('apiKey') || 'dev-default-key-123'
        }
      };
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await axios.post(`${API_URL}/automation`, automation, config);
      
      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Automation created successfully',
        });
        navigate('/automation');
      }
    } catch (error) {
      console.error('Create automation error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create automation',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render action form based on action type
  const renderActionForm = (action, index) => {
    switch (action.type) {
      case 'send_whatsapp':
        return (
          <WhatsappAutomation 
            actionData={action}
            onChange={updateAction}
            index={index}
          />
        );
      
      case 'create_task':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`title-${index}`}>Task Title</Label>
              <Input 
                id={`title-${index}`}
                value={action.title}
                onChange={(e) => updateAction(index, 'title', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`description-${index}`}>Task Description</Label>
              <Textarea 
                id={`description-${index}`}
                value={action.description}
                onChange={(e) => updateAction(index, 'description', e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`priority-${index}`}>Priority</Label>
                <Select 
                  value={action.priority} 
                  onValueChange={(value) => updateAction(index, 'priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor={`dueDate-${index}`}>Due in (days)</Label>
                <Input 
                  id={`dueDate-${index}`}
                  type="number"
                  min="1"
                  value={action.dueDateDays}
                  onChange={(e) => updateAction(index, 'dueDateDays', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
        );
      
      case 'tag_contact':
        return (
          <div>
            <Label htmlFor={`tag-${index}`}>Tag Name</Label>
            <Input 
              id={`tag-${index}`}
              value={action.tag}
              onChange={(e) => updateAction(index, 'tag', e.target.value)}
            />
            <p className="text-sm text-gray-500 mt-2">
              The contact will be tagged with this label for segmentation and targeting
            </p>
          </div>
        );
      
      case 'wait':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`duration-${index}`}>Duration</Label>
                <Input 
                  id={`duration-${index}`}
                  type="number"
                  min="1"
                  value={action.duration}
                  onChange={(e) => updateAction(index, 'duration', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor={`unit-${index}`}>Unit</Label>
                <Select 
                  value={action.unit} 
                  onValueChange={(value) => updateAction(index, 'unit', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">Minutes</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              The automation will pause for this duration before executing the next action
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/automation')}
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Automations
        </Button>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-flex gap-1.5 items-center text-sm text-blue-600 font-medium">
                <Sparkles className="h-4 w-4" />
                <span>Pro tips</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="w-80 p-4">
              <div className="space-y-2">
                <p className="font-semibold">Tips for effective automations:</p>
                <ul className="text-xs space-y-1 list-disc pl-4">
                  <li>Keep automations focused on a single goal</li>
                  <li>Test your automations before activating them</li>
                  <li>Use clear, descriptive names for easy management</li>
                </ul>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
     
      
      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Basics</span>
              </TabsTrigger>
              <TabsTrigger value="trigger" className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4" />
                <span>Trigger</span>
              </TabsTrigger>
              <TabsTrigger value="actions" className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Actions</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Basic Information</CardTitle>
                    <CardDescription>
                      Define your automation's core details
                    </CardDescription>
                  </div>
                  <span className="text-sm bg-blue-100 text-blue-800 py-1 px-3 rounded-full">Step 1 of 3</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-base font-medium flex items-center gap-2">
                    Automation Name
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Give your automation a clear, descriptive name
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input 
                    id="name"
                    name="name"
                    placeholder="E.g., Welcome Message Sequence"
                    value={automation.name}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description" className="text-base font-medium">Description</Label>
                  <Textarea 
                    id="description"
                    name="description"
                    placeholder="Briefly describe what this automation does and its purpose"
                    value={automation.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="category" className="text-base font-medium">Category</Label>
                  <Select 
                    name="category"
                    value={automation.category} 
                    onValueChange={(value) => setAutomation(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Customer Service">Customer Service</SelectItem>
                      <SelectItem value="Analytics">Analytics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t p-6">
                <Button
                  type="button"
                  onClick={goToNextTab}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!automation.name}
                >
                  Continue to Trigger
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Trigger Tab */}
          <TabsContent value="trigger" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Trigger Configuration</CardTitle>
                    <CardDescription>
                      Define when this automation should run
                    </CardDescription>
                  </div>
                  <span className="text-sm bg-blue-100 text-blue-800 py-1 px-3 rounded-full">Step 2 of 3</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="trigger" className="text-base font-medium">
                    When should this automation start?
                  </Label>
                  <Select 
                    value={automation.trigger.event} 
                    onValueChange={handleTriggerChange}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Show description for selected trigger */}
                  <div className="mt-4 p-4 bg-gray-50 border border-gray-100 rounded-lg">
                    <div className="flex items-start">
                      {automation.trigger.type === 'schedule' ? (
                        <CalendarClock className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                      ) : (
                        <Info className="h-5 w-5 text-amber-600 mr-3 mt-0.5" />
                      )}
                      <div>
                        <p className="font-medium">
                          {triggerOptions.find(t => t.value === automation.trigger.event)?.label}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {triggerOptions.find(t => t.value === automation.trigger.event)?.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {automation.trigger.type === 'schedule' && (
                  <div className="mt-4 p-5 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-start">
                      <CalendarClock className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-800">
                          Schedule Details
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                          {automation.trigger.event === 'daily' 
                            ? 'This automation will run every day at 8:00 AM'
                            : 'This automation will run every Monday at 8:00 AM'}
                        </p>
                        <p className="text-xs text-blue-600 mt-2">
                          Timezone is based on your account settings
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end border-t p-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("basic")}
                  className="mr-2"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={goToNextTab}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Continue to Actions
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Actions</CardTitle>
                    <CardDescription>
                      Define the steps that will execute when the automation runs
                    </CardDescription>
                  </div>
                  <span className="text-sm bg-blue-100 text-blue-800 py-1 px-3 rounded-full">Step 3 of 3</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {automation.actions.map((action, index) => {
                  const actionType = actionTypes.find(t => t.value === action.type);
                  
                  return (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <div className={`${actionType?.color || 'bg-gray-100'} px-4 py-3 flex items-center justify-between`}>
                        <div className="flex items-center">
                          <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-xs font-bold mr-3">
                            {index + 1}
                          </div>
                          <div className="flex items-center">
                            {actionType?.icon}
                            <h3 className="text-base font-medium ml-2">
                              {actionType?.label || 'Action'}
                            </h3>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeAction(index)}
                          className="text-gray-600 hover:text-red-600 hover:bg-white/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="p-5">
                        {renderActionForm(action, index)}
                      </div>
                    </div>
                  );
                })}
                
                <div className="border border-dashed rounded-lg overflow-hidden">
                  <div className="px-4 py-5 text-center">
                    <h3 className="text-lg font-medium mb-3">Add Another Action</h3>
                    <p className="text-sm text-gray-500 mb-4 max-w-lg mx-auto">
                      Choose an action to add to your automation workflow. Actions are executed in sequence from top to bottom.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                      {actionTypes.map(type => (
                        <Button 
                          key={type.value}
                          variant="outline" 
                          onClick={() => addAction(type.value)}
                          className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 min-w-36"
                        >
                          <div className={`w-8 h-8 rounded-full ${type.color} flex items-center justify-center mr-2`}>
                            {type.icon}
                          </div>
                          <div className="text-left">
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-gray-500 truncate max-w-28">
                              {type.description}
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("trigger")}
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !isFormComplete()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create Automation
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
};

export default AutomationCreate; 