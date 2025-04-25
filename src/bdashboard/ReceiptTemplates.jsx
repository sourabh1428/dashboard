import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Plus,
  Copy,
  Save,
  FilePen,
  Trash2,
  MoreVertical,
  ArrowLeft,
  Eye,
  Check,
  Star,
  StarOff,
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import ReceiptTemplateBuilder from './ReceiptTemplateBuilder';

export default function ReceiptTemplates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState(() => {
    const savedTemplates = localStorage.getItem('receiptTemplates');
    if (savedTemplates) {
      try {
        return JSON.parse(savedTemplates);
      } catch (error) {
        console.error('Error parsing saved templates:', error);
        return [];
      }
    }
    return [];
  });

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [previewTemplateId, setPreviewTemplateId] = useState(null);

  useEffect(() => {
    // Initialize with a default template if there are no templates
    if (templates.length === 0) {
      const defaultTemplate = {
        id: Date.now().toString(),
        name: 'Default Receipt Template',
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        elements: [
          { id: 'header-1', type: 'header', content: 'RECEIPT', style: { fontSize: '24px', fontWeight: 'bold', textAlign: 'center', color: '#000000' } },
          { id: 'company-1', type: 'company-info', content: { name: 'Your Company', address: '123 Business St, City', gstin: 'GSTIN12345' }, style: { fontSize: '14px', textAlign: 'center', color: '#000000' } },
          { id: 'customer-1', type: 'customer-info', style: { fontSize: '14px', color: '#000000' } },
          { id: 'products-1', type: 'product-table', style: { width: '100%', borderCollapse: 'collapse', fontSize: '14px', color: '#000000' } },
          { id: 'total-1', type: 'total', style: { fontSize: '16px', fontWeight: 'bold', textAlign: 'right', color: '#000000' } },
          { id: 'footer-1', type: 'footer', content: 'Thank you for your business!', style: { fontSize: '14px', textAlign: 'center', fontStyle: 'italic', color: '#000000', marginTop: '20px' } }
        ]
      };
      setTemplates([defaultTemplate]);
      localStorage.setItem('receiptTemplates', JSON.stringify([defaultTemplate]));
    }
  }, [templates.length]);

  // Save templates to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('receiptTemplates', JSON.stringify(templates));
  }, [templates]);

  const createNewTemplate = () => {
    if (!newTemplateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    const newTemplate = {
      id: Date.now().toString(),
      name: newTemplateName,
      isDefault: templates.length === 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      elements: [
        { id: 'header-1', type: 'header', content: 'RECEIPT', style: { fontSize: '24px', fontWeight: 'bold', textAlign: 'center', color: '#000000' } },
        { id: 'company-1', type: 'company-info', content: { name: 'Your Company', address: '123 Business St, City', gstin: 'GSTIN12345' }, style: { fontSize: '14px', textAlign: 'center', color: '#000000' } },
        { id: 'customer-1', type: 'customer-info', style: { fontSize: '14px', color: '#000000' } },
        { id: 'products-1', type: 'product-table', style: { width: '100%', borderCollapse: 'collapse', fontSize: '14px', color: '#000000' } },
        { id: 'total-1', type: 'total', style: { fontSize: '16px', fontWeight: 'bold', textAlign: 'right', color: '#000000' } },
        { id: 'footer-1', type: 'footer', content: 'Thank you for your business!', style: { fontSize: '14px', textAlign: 'center', fontStyle: 'italic', color: '#000000', marginTop: '20px' } }
      ]
    };

    setTemplates(prev => [...prev, newTemplate]);
    setSelectedTemplate(newTemplate);
    setNewTemplateName('');
    setIsCreateDialogOpen(false);
    setEditMode(true);
  };

  const duplicateTemplate = (template) => {
    const duplicatedTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTemplates(prev => [...prev, duplicatedTemplate]);
  };

  const deleteTemplate = (templateId) => {
    // Check if it's the default template
    const isDefault = templates.find(t => t.id === templateId)?.isDefault;
    
    if (isDefault) {
      // Find another template to set as default
      const remainingTemplates = templates.filter(t => t.id !== templateId);
      if (remainingTemplates.length > 0) {
        const newDefaultTemplate = { ...remainingTemplates[0], isDefault: true };
        setTemplates(prev => 
          prev
            .filter(t => t.id !== templateId)
            .map(t => t.id === newDefaultTemplate.id ? newDefaultTemplate : t)
        );
      } else {
        alert("Cannot delete the only template. Please create another template first.");
        return;
      }
    } else {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    }

    // If the deleted template was selected, deselect it
    if (selectedTemplate?.id === templateId) {
      setSelectedTemplate(null);
      setEditMode(false);
    }
  };

  const setDefaultTemplate = (templateId) => {
    setTemplates(prev => prev.map(template => ({
      ...template,
      isDefault: template.id === templateId,
    })));
  };

  const updateTemplate = (updatedTemplate) => {
    setTemplates(prev => prev.map(template => 
      template.id === updatedTemplate.id ? { 
        ...updatedTemplate, 
        updatedAt: new Date().toISOString() 
      } : template
    ));
  };

  const saveTemplateElements = (elements) => {
    if (!selectedTemplate) return;
    
    const updatedTemplate = {
      ...selectedTemplate,
      elements,
      updatedAt: new Date().toISOString()
    };
    
    updateTemplate(updatedTemplate);
    setSelectedTemplate(updatedTemplate);
  };

  // Filter templates based on active tab
  const filteredTemplates = activeTab === 'favorites' 
    ? templates.filter(template => template.isDefault)
    : templates;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="container max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate('/invoicing')}
            title="Back to invoicing"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Receipt Templates</h1>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
              <DialogDescription>
                Give your new receipt template a name to get started.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Template Name"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createNewTemplate}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {!editMode ? (
        <>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center mb-6">
              <TabsList>
                <TabsTrigger value="all">All Templates</TabsTrigger>
                <TabsTrigger value="favorites">Default</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className={`overflow-hidden transition-all hover:shadow-md ${template.isDefault ? 'border-primary/40' : ''}`}>
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {template.name}
                            {template.isDefault && (
                              <div className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                                Default
                              </div>
                            )}
                          </CardTitle>
                          <CardDescription>
                            Last updated: {formatDate(template.updatedAt)}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedTemplate(template);
                              setEditMode(true);
                            }}>
                              <FilePen className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setPreviewTemplateId(template.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => duplicateTemplate(template)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            {!template.isDefault && (
                              <DropdownMenuItem onClick={() => setDefaultTemplate(template.id)}>
                                <Star className="h-4 w-4 mr-2" />
                                Set as Default
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this template?')) {
                                  deleteTemplate(template.id);
                                }
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div 
                        className="h-[160px] bg-muted/20 flex items-center justify-center cursor-pointer"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setEditMode(true);
                        }}
                      >
                        <div className="text-center p-6">
                          <FilePen className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Click to edit template</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between p-4 border-t">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setEditMode(true);
                        }}
                      >
                        <FilePen className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant={template.isDefault ? "secondary" : "outline"} 
                        size="sm"
                        onClick={() => setDefaultTemplate(template.id)}
                        disabled={template.isDefault}
                      >
                        {template.isDefault ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Default
                          </>
                        ) : (
                          <>
                            <Star className="h-4 w-4 mr-2" />
                            Set Default
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Preview Dialog */}
          {previewTemplateId && (
            <Dialog 
              open={previewTemplateId !== null} 
              onOpenChange={(open) => !open && setPreviewTemplateId(null)}
            >
              <DialogContent className="max-w-4xl h-[80vh]">
                <DialogHeader>
                  <DialogTitle>
                    {templates.find(t => t.id === previewTemplateId)?.name} Preview
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="flex-1 h-full">
                  <div className="p-4">
                    <ReceiptTemplatePreview 
                      template={templates.find(t => t.id === previewTemplateId)}
                    />
                  </div>
                </ScrollArea>
                <DialogFooter>
                  <Button 
                    onClick={() => {
                      const template = templates.find(t => t.id === previewTemplateId);
                      setSelectedTemplate(template);
                      setPreviewTemplateId(null);
                      setEditMode(true);
                    }}
                  >
                    <FilePen className="h-4 w-4 mr-2" />
                    Edit Template
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setEditMode(false);
                  setSelectedTemplate(null);
                }}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="text-lg font-medium">{selectedTemplate?.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedTemplate?.isDefault && <span className="text-primary">Default Template • </span>}
                  Last updated: {formatDate(selectedTemplate?.updatedAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!selectedTemplate?.isDefault && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDefaultTemplate(selectedTemplate.id)}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Set as Default
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setEditMode(false);
                  setSelectedTemplate(null);
                }}
              >
                Done
              </Button>
            </div>
          </div>

          <ReceiptTemplateBuilder 
            settings={{ receiptTemplate: selectedTemplate?.elements }}
            updateSettings={(settings) => {
              saveTemplateElements(settings.receiptTemplate);
            }}
          />
        </div>
      )}
    </div>
  );
}

// Component to render a preview of a receipt template
function ReceiptTemplatePreview({ template }) {
  if (!template || !template.elements) {
    return <div>No template data available</div>;
  }

  // Helper function to convert style object to inline CSS string
  const styleToString = (style) => {
    if (!style) return '';
    return Object.entries(style).map(([key, value]) => {
      // Convert camelCase to kebab-case
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssKey}: ${value}`;
    }).join('; ');
  };

  // Sample data for preview
  const previewData = {
    company: {
      name: "Sample Company",
      address: "123 Business Street, City",
      gstin: "GSTIN1234567890",
    },
    customer: {
      name: "John Doe",
      mobile: "+1 (555) 123-4567",
    },
    date: new Date().toLocaleDateString(),
    items: [
      { title: "Product 1", quantity: 2, price: 19.99 },
      { title: "Product 2", quantity: 1, price: 29.99 },
    ],
    subtotal: 69.97,
    gst: 12.59,
    total: 82.56,
  };

  // Generate preview HTML
  let previewHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; border: 1px solid #ccc; padding: 20px; border-radius: 5px;">
  `;

  // Add elements to HTML
  template.elements.forEach(element => {
    switch (element.type) {
      case 'header':
        previewHtml += `<div style="${styleToString(element.style)}">${element.content}</div>`;
        break;
      case 'company-info':
        previewHtml += `
          <div style="${styleToString(element.style)}">
            <div>${element.content?.name || previewData.company.name}</div>
            <div>${element.content?.address || previewData.company.address}</div>
            <div>GSTIN: ${element.content?.gstin || previewData.company.gstin}</div>
          </div>
        `;
        break;
      case 'customer-info':
        previewHtml += `
          <div style="${styleToString(element.style)}">
            <p><strong>Customer:</strong> ${previewData.customer.name}</p>
            <p><strong>Mobile:</strong> ${previewData.customer.mobile}</p>
            <p><strong>Date:</strong> ${previewData.date}</p>
          </div>
        `;
        break;
      case 'product-table':
        previewHtml += `
          <table style="${styleToString(element.style)}; width: 100%; border-collapse: collapse; margin: 15px 0;">
            <thead>
              <tr>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Item</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Qty</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Price</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${previewData.items.map(item => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${item.title}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">₹${item.price.toFixed(2)}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">₹${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
        break;
      case 'total':
        previewHtml += `
          <div style="${styleToString(element.style)}">
            <p>Subtotal: ₹${previewData.subtotal.toFixed(2)}</p>
            <p>GST (18%): ₹${previewData.gst.toFixed(2)}</p>
            <p>Total: ₹${previewData.total.toFixed(2)}</p>
          </div>
        `;
        break;
      case 'text':
        previewHtml += `<div style="${styleToString(element.style)}">${element.content}</div>`;
        break;
      case 'image':
        previewHtml += `<img src="${element.content || 'https://placehold.co/600x200/png'}" alt="Receipt Image" style="${styleToString(element.style)}" />`;
        break;
      case 'divider':
        previewHtml += `<div style="border-top: 1px dashed #ccc; margin: 15px 0;"></div>`;
        break;
      case 'footer':
        previewHtml += `<div style="${styleToString(element.style)}">${element.content}</div>`;
        break;
      default:
        break;
    }
  });

  previewHtml += `</div>`;

  return (
    <div className="border rounded p-4 bg-white">
      <iframe 
        srcDoc={previewHtml}
        title="Receipt Preview"
        className="w-full h-[60vh] border-0"
        sandbox="allow-same-origin"
      />
    </div>
  );
} 