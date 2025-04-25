import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useToast } from "@/hooks/use-toast";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  MessageSquare, 
  RefreshCw, 
  AlertCircle, 
  Image as ImageIcon, 
  FileText, 
  Link2, 
  CheckCircle2,
  Upload,
  X,
  Link
} from 'lucide-react';
import { getApiKey } from '@/configApi.js';

// Import supabase client
import { supabase } from '../../Supabase/supabaseClient.js';

const WhatsappAutomation = ({ 
  actionData = {}, 
  onChange,
  index = 0
}) => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [activeTab, setActiveTab] = useState("template");
  const [imageUploadType, setImageUploadType] = useState('url');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  
  // Initialize with default values if not provided
  const whatsappData = {
    type: 'send_whatsapp',
    templateId: actionData.templateId || '',
    params: actionData.params || {},
    mediaUrl: actionData.mediaUrl || '',
    ctaText: actionData.ctaText || '',
    ctaUrl: actionData.ctaUrl || '',
    ...actionData
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      
      // Use the same API endpoint as in WhatsappTemplateEditor
      const response = await fetch("https://api.gupshup.io/wa/app/9402e3f9-2750-43c2-86d2-9366f477f155/template", {
        method: "GET",
        headers: {
          "accept": "application/json",
          "apikey": "3t1djdl0hiqobxjxmdvctngegmr8o3yu"
        }
      });
      
      const data = await response.json();
      
      if (data.status === "success" && Array.isArray(data.templates)) {
        // Transform the templates to match our expected format
        const formattedTemplates = data.templates.map(template => {
          // Extract parameters from the template body
          const paramMatches = template.data.match(/{{[0-9]+}}/g) || [];
          const variables = paramMatches.map(match => match.replace(/[{}]/g, ''));
          
          return {
            id: template.id,
            name: template.elementName || template.id,
            text: template.data,
            previewText: template.data,
            variables: variables,
            hasMedia: template.templateType === 'IMAGE' || template.templateType === 'VIDEO',
            hasCta: template.containerMeta && template.containerMeta.cta,
            originalData: template // Keep the original data for reference
          };
        });
        
        setTemplates(formattedTemplates);
        
        // If we have a templateId, find and set the selected template
        if (whatsappData.templateId) {
          const template = formattedTemplates.find(t => t.id === whatsappData.templateId);
          setSelectedTemplate(template || null);
        }
      } else {
        // Fallback to mock data if API fails to return expected format
        // This is for development/testing purposes
        setTemplates([
          {
            id: 'welcome_template',
            name: 'Welcome Message',
            text: 'Hello {{1}}, welcome to our platform! We\'re excited to have you on board.',
            previewText: 'Hello [Name], welcome to our platform! We\'re excited to have you on board.',
            variables: ['1'],
            hasMedia: false,
            hasCta: false
          },
          {
            id: 'order_confirmation',
            name: 'Order Confirmation',
            text: 'Thank you for your order, {{1}}! Your order #{{2}} has been confirmed and will be processed soon.',
            previewText: 'Thank you for your order, [Name]! Your order #[OrderID] has been confirmed and will be processed soon.',
            variables: ['1', '2'],
            hasMedia: false,
            hasCta: true
          }
        ]);
        
        console.warn('Fallback to mock templates: API returned unexpected format', data);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching WhatsApp templates:', err);
      setError('Failed to load WhatsApp templates. Using local mock data instead.');
      
      // Provide mock templates for testing/development
      setTemplates([
        {
          id: 'welcome_template',
          name: 'Welcome Message',
          text: 'Hello {{1}}, welcome to our platform! We\'re excited to have you on board.',
          previewText: 'Hello [Name], welcome to our platform! We\'re excited to have you on board.',
          variables: ['1'],
          hasMedia: false,
          hasCta: false
        },
        {
          id: 'order_confirmation',
          name: 'Order Confirmation',
          text: 'Thank you for your order, {{1}}! Your order #{{2}} has been confirmed and will be processed soon.',
          previewText: 'Thank you for your order, [Name]! Your order #[OrderID] has been confirmed and will be processed soon.',
          variables: ['1', '2'],
          hasMedia: false,
          hasCta: true
        }
      ]);
      
      toast({
        title: 'Warning',
        description: 'Could not load WhatsApp templates from API. Using mock data instead.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    setSelectedTemplate(template);
    
    // Prepare default parameters based on the template variables
    const defaultParams = {};
    if (template && template.variables) {
      template.variables.forEach(variable => {
        // Convert to string to match createWhatsapp format
        defaultParams[variable] = '';
      });
    }
    
    // Update the action data with new template and reset params
    updateActionData({
      templateId,
      params: defaultParams,
      // Reset media and CTA when changing templates
      mediaUrl: '',
      ctaText: '',
      ctaUrl: ''
    });
    
    // Reset to the template tab
    setActiveTab("template");
  };

  const handleParamChange = (paramName, value) => {
    const updatedParams = {
      ...whatsappData.params,
      [paramName]: value
    };
    
    updateActionData({ params: updatedParams });
  };

  const mapParamsToNumberedFormat = (params) => {
    // Convert params object to createWhatsapp format
    const numberedParams = {};
    if (selectedTemplate && selectedTemplate.variables) {
      selectedTemplate.variables.forEach((variable, index) => {
        // Use 1-based indexing for parameters
        numberedParams[index + 1] = params[variable] || '';
      });
    }
    return numberedParams;
  };

  const updateActionData = (updates) => {
    const updatedData = {
      ...whatsappData,
      ...updates
    };
    
    if (onChange) {
      // Convert parameters to numbered format for the createWhatsapp API
      if (updates.params && selectedTemplate) {
        const numberedParams = mapParamsToNumberedFormat(updates.params);
        onChange(index, {
          ...updatedData,
          // This is for internal storage
          params: updates.params,
          // This is for API compatibility when sending
          _numberedParams: numberedParams
        });
      } else {
        onChange(index, updatedData);
      }
    }
  };

  // Check if all required fields are completed
  const isTemplateComplete = () => {
    if (!selectedTemplate) return false;
    
    // Check if all variable parameters are filled
    if (selectedTemplate.variables && selectedTemplate.variables.length > 0) {
      return selectedTemplate.variables.every(v => 
        whatsappData.params[v] && whatsappData.params[v].trim() !== ''
      );
    }
    
    return true;
  };

  // Check if required fields for media are filled
  const isMediaComplete = () => {
    if (!selectedTemplate || !selectedTemplate.hasMedia) return true;
    return !!whatsappData.mediaUrl;
  };

  // Check if required fields for CTA are filled
  const isCtaComplete = () => {
    if (!selectedTemplate || !selectedTemplate.hasCta) return true;
    return !!whatsappData.ctaText && !!whatsappData.ctaUrl;
  };

  // Function to handle image file upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive"
      });
      return;
    }
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, or GIF image",
        variant: "destructive"
      });
      return;
    }
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    setImageFile(file);
  };
  
  // Function to upload image via backend
  const uploadImageToBackend = async () => {
    if (!imageFile) return null;
    
    setUploadingImage(true);
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('templateId', selectedTemplate?.id || 'unknown-template');
      formData.append('fileName', `whatsapp-template-${Date.now()}`);
      
      // Upload to backend which will save to Supabase
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || ''}/whatsapp/upload-template-media`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-api-key': getApiKey()
          }
        }
      );
      
      if (response.data && response.data.success) {
        const mediaUrl = response.data.mediaUrl;
        
        // Update the media URL in the component state
        updateActionData({ mediaUrl });
        
        toast({
          title: "Image uploaded",
          description: "Image has been uploaded and linked to the template",
          variant: "success"
        });
        
        return mediaUrl;
      } else {
        throw new Error(response.data?.error || 'Upload failed');
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploadingImage(false);
    }
  };
  
  // Function to save external URL
  const saveExternalUrl = async (url) => {
    if (!url) return null;
    
    try {
      setUploadingImage(true);
      
      // Save the URL to our backend
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || ''}/whatsapp/save-template-media-url`,
        {
          mediaUrl: url,
          templateId: selectedTemplate?.id || 'unknown-template',
          fileName: `whatsapp-template-url-${Date.now()}`
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': getApiKey()
          }
        }
      );
      
      if (response.data && response.data.success) {
        const mediaUrl = response.data.mediaUrl;
        
        // Update the media URL in the component state
        updateActionData({ mediaUrl });
        
        toast({
          title: "URL saved",
          description: "External URL has been saved and will be used for the template",
          variant: "success"
        });
        
        return mediaUrl;
      } else {
        throw new Error(response.data?.error || 'Failed to save URL');
      }
    } catch (error) {
      console.error("Error saving URL:", error);
      toast({
        title: "Failed to save URL",
        description: error.message || "An error occurred while saving the URL",
        variant: "destructive"
      });
    } finally {
      setUploadingImage(false);
    }
  };
  
  // Handle image upload when file is selected
  useEffect(() => {
    if (imageFile && imageUploadType === 'file') {
      uploadImageToBackend();
    }
  }, [imageFile]);
  
  // Handle URL change after a delay
  const handleUrlChange = (url) => {
    updateActionData({ mediaUrl: url });
  };
  
  // Save URL when user clicks save button
  const handleSaveUrl = () => {
    if (whatsappData.mediaUrl) {
      saveExternalUrl(whatsappData.mediaUrl);
    } else {
      toast({
        title: "No URL provided",
        description: "Please enter a URL first",
        variant: "destructive"
      });
    }
  };
  
  // Clear image preview when changing upload type
  useEffect(() => {
    if (imageUploadType === 'url') {
      setImageFile(null);
      setImagePreview(null);
    }
  }, [imageUploadType]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-40 w-full rounded-md" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-5 w-5 mr-2" />
        <AlertTitle>Error Loading Templates</AlertTitle>
        <AlertDescription className="mt-2">
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchTemplates}
            className="mt-2 w-full"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-2" /> Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <div className="space-y-2">
        <Label htmlFor={`template-${index}`} className="font-medium">WhatsApp Template</Label>
        <Select 
          value={whatsappData.templateId} 
          onValueChange={handleTemplateChange}
        >
          <SelectTrigger id={`template-${index}`} className="bg-white">
            <SelectValue placeholder="Select a WhatsApp template" />
          </SelectTrigger>
          <SelectContent>
            {templates.map(template => (
              <SelectItem key={template.id} value={template.id}>
                <div className="flex items-center">
                  <span>{template.name}</span>
                  {template.hasMedia && (
                    <Badge variant="outline" className="ml-2 py-0 h-5 text-xs">
                      <ImageIcon className="h-3 w-3 mr-1" /> Media
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {templates.length === 0 && (
          <div className="rounded-md bg-amber-50 p-3 text-amber-700 text-sm border border-amber-200 mt-2">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2 shrink-0" />
              <span>No templates available. Please create a template first in your WhatsApp Business settings.</span>
            </div>
          </div>
        )}
      </div>

      {selectedTemplate && (
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full mt-4"
        >
          <TabsList className="grid grid-cols-2 lg:grid-cols-3 w-full">
            <TabsTrigger value="template" className="flex items-center text-xs">
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
              Template
            </TabsTrigger>
            
            {selectedTemplate.hasMedia && (
              <TabsTrigger value="media" className="flex items-center text-xs">
                <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
                Media
              </TabsTrigger>
            )}
            
            {selectedTemplate.hasCta && (
              <TabsTrigger value="cta" className="flex items-center text-xs">
                <Link2 className="h-3.5 w-3.5 mr-1.5" />
                Button
              </TabsTrigger>
            )}
          </TabsList>
          
          {/* Template Tab */}
          <TabsContent value="template">
            <div className="space-y-4">
              <div className="p-4 border border-gray-100 bg-gray-50 rounded-md">
                <div className="font-medium mb-2 text-sm flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1.5 text-green-600" />
                  Template Preview
                </div>
                
                <Card className="overflow-hidden">
                  <CardContent className="p-4 rounded-md bg-white">
                    <div 
                      className="text-sm"
                      dangerouslySetInnerHTML={{ 
                        __html: selectedTemplate.previewText || selectedTemplate.text 
                      }} 
                    />
                  </CardContent>
                </Card>
              </div>

              {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                <div className="space-y-3 bg-gray-50 p-4 rounded-md border border-gray-100">
                  <div className="font-medium text-sm mb-2">Template Parameters</div>
                  <div className="grid gap-4">
                    {selectedTemplate.variables.map((variable, i) => (
                      <div key={i} className="space-y-1">
                        <Label 
                          htmlFor={`param-${index}-${i}`} 
                          className="text-xs text-gray-500 font-normal"
                        >
                          Parameter {variable}
                        </Label>
                        <Input
                          id={`param-${index}-${i}`}
                          placeholder={`Value for parameter ${variable}`}
                          value={whatsappData.params[variable] || ''}
                          onChange={(e) => handleParamChange(variable, e.target.value)}
                          className="border-gray-300 h-9"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Media Tab */}
          {selectedTemplate.hasMedia && (
            <TabsContent value="media">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                  <div className="font-medium mb-3 text-sm flex items-center">
                    <ImageIcon className="h-4 w-4 mr-1.5 text-blue-600" />
                    Media Settings
                  </div>
                  
                  <div className="space-y-4">
                    {/* Upload type selector */}
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`image-upload-type-${index}`}>Upload Type:</Label>
                      <Select 
                        value={imageUploadType} 
                        onValueChange={setImageUploadType}
                      >
                        <SelectTrigger id={`image-upload-type-${index}`} className="w-auto min-w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="url">URL</SelectItem>
                          <SelectItem value="file">File Upload</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* URL input or file upload based on selected type */}
                    {imageUploadType === 'url' ? (
                      <div className="space-y-2">
                        <Label htmlFor={`media-${index}`}>Media URL</Label>
                        <div className="flex space-x-2">
                          <Input
                            id={`media-${index}`}
                            placeholder="https://example.com/image.jpg"
                            value={whatsappData.mediaUrl || ''}
                            onChange={(e) => handleUrlChange(e.target.value)}
                            className="border-gray-300 flex-1"
                          />
                          <Button 
                            size="sm" 
                            onClick={handleSaveUrl}
                            disabled={!whatsappData.mediaUrl || uploadingImage}
                          >
                            {uploadingImage ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Link className="h-4 w-4 mr-2" />}
                            Save
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">Save the URL to ensure it remains accessible.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Image preview */}
                        {imagePreview && (
                          <div className="relative w-full max-w-xs mx-auto">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="w-full h-auto rounded-md border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setImageFile(null);
                                setImagePreview(null);
                              }}
                              className="absolute top-1 right-1 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                        
                        {/* File upload button */}
                        {!imagePreview && (
                          <div className="flex items-center justify-center w-full">
                            <label htmlFor={`dropzone-file-${index}`} className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 5MB)</p>
                              </div>
                              <input 
                                id={`dropzone-file-${index}`}
                                ref={fileInputRef}
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleImageUpload}
                              />
                            </label>
                          </div>
                        )}
                        
                        {/* Show the URL of the uploaded image */}
                        {whatsappData.mediaUrl && (
                          <div className="text-xs text-gray-700 bg-gray-100 p-2 rounded truncate">
                            <span className="font-semibold">Linked URL: </span>
                            <a 
                              href={whatsappData.mediaUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {whatsappData.mediaUrl}
                            </a>
                          </div>
                        )}
                        
                        {/* Loading indicator */}
                        {uploadingImage && (
                          <div className="flex items-center justify-center">
                            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                            <span className="text-sm">Uploading image...</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500 flex items-start gap-2">
                      <AlertCircle className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <span>
                        Supported formats: image (jpg, png), document (pdf), video (mp4).<br />
                        Media files must be hosted on a publicly accessible URL.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}
          
          {/* CTA Tab */}
          {selectedTemplate.hasCta && (
            <TabsContent value="cta">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                  <div className="font-medium mb-3 text-sm flex items-center">
                    <Link2 className="h-4 w-4 mr-1.5 text-purple-600" />
                    Button Settings
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`cta-text-${index}`}>Button Text</Label>
                      <Input
                        id={`cta-text-${index}`}
                        placeholder="View Details"
                        value={whatsappData.ctaText || ''}
                        onChange={(e) => updateActionData({ ctaText: e.target.value })}
                        className="border-gray-300"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`cta-url-${index}`}>Button URL</Label>
                      <Input
                        id={`cta-url-${index}`}
                        placeholder="https://example.com/product"
                        value={whatsappData.ctaUrl || ''}
                        onChange={(e) => updateActionData({ ctaUrl: e.target.value })}
                        className="border-gray-300"
                      />
                    </div>
                    
                    <div className="text-xs text-gray-500 flex items-start gap-2">
                      <AlertCircle className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <span>
                        The button text should be concise and clear. URLs must be HTTPS and publicly accessible.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
};

export default WhatsappAutomation; 