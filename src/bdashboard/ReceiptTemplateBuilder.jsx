import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Plus, 
  Minus, 
  Move, 
  Type, 
  Image as ImageIcon, 
  Table, 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Save,
  FileText,
  Eye
} from 'lucide-react';
import { ChromePicker } from 'react-color';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ElementTypes = {
  HEADER: 'header',
  COMPANY_INFO: 'company-info',
  CUSTOMER_INFO: 'customer-info',
  PRODUCT_TABLE: 'product-table',
  TOTAL: 'total',
  TEXT: 'text',
  IMAGE: 'image',
  DIVIDER: 'divider',
  LOGO: 'logo',
  FOOTER: 'footer'
};

const SortableItem = ({ id, children }) => {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition 
  } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="relative border border-dashed border-muted-foreground/50 p-4 mb-3 rounded-md bg-white/50 group"
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute -left-2 top-1/2 transform -translate-y-1/2 cursor-move opacity-30 group-hover:opacity-100"
      >
        <Move className="h-5 w-5" />
      </div>
      {children}
    </div>
  );
};

export default function ReceiptTemplateBuilder({ settings, updateSettings }) {
  const [elements, setElements] = useState(settings?.receiptTemplate || [
    { id: 'header-1', type: ElementTypes.HEADER, content: 'RECEIPT', style: { fontSize: '24px', fontWeight: 'bold', textAlign: 'center', color: '#000000' } },
    { id: 'company-1', type: ElementTypes.COMPANY_INFO, content: { name: settings?.brandName || 'Your Company', address: '123 Business St, City', gstin: settings?.gstinNumber || 'GSTIN12345' }, style: { fontSize: '14px', textAlign: 'center', color: '#000000' } },
    { id: 'customer-1', type: ElementTypes.CUSTOMER_INFO, style: { fontSize: '14px', color: '#000000' } },
    { id: 'products-1', type: ElementTypes.PRODUCT_TABLE, style: { width: '100%', borderCollapse: 'collapse', fontSize: '14px', color: '#000000' } },
    { id: 'total-1', type: ElementTypes.TOTAL, style: { fontSize: '16px', fontWeight: 'bold', textAlign: 'right', color: '#000000' } },
    { id: 'footer-1', type: ElementTypes.FOOTER, content: 'Thank you for your business!', style: { fontSize: '14px', textAlign: 'center', fontStyle: 'italic', color: '#000000', marginTop: '20px' } }
  ]);
  
  const [selectedElement, setSelectedElement] = useState(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [activeTab, setActiveTab] = useState('edit');
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Generate preview HTML
  useEffect(() => {
    generatePreview();
  }, [elements]);
  
  const generatePreview = () => {
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .receipt { max-width: 800px; margin: 0 auto; border: 1px solid #ccc; padding: 20px; border-radius: 5px; }
          table { width: 100%; border-collapse: collapse; }
          table th, table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          table th { background-color: #f2f2f2; }
          .divider { border-top: 1px dashed #ccc; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="receipt">
    `;
    
    // Add elements to HTML
    elements.forEach(element => {
      switch (element.type) {
        case ElementTypes.HEADER:
          html += `<div style="${styleToString(element.style)}">${element.content}</div>`;
          break;
        case ElementTypes.COMPANY_INFO:
          html += `
            <div style="${styleToString(element.style)}">
              <div>${element.content.name}</div>
              <div>${element.content.address}</div>
              <div>GSTIN: ${element.content.gstin}</div>
            </div>
          `;
          break;
        case ElementTypes.CUSTOMER_INFO:
          html += `
            <div style="${styleToString(element.style)}">
              <p><strong>Customer:</strong> {{customer.name}}</p>
              <p><strong>Mobile:</strong> {{customer.mobile}}</p>
              <p><strong>Date:</strong> {{date}}</p>
            </div>
          `;
          break;
        case ElementTypes.PRODUCT_TABLE:
          html += `
            <table style="${styleToString(element.style)}">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {{#each items}}
                <tr>
                  <td>{{this.title}}</td>
                  <td>{{this.quantity}}</td>
                  <td>₹{{this.price}}</td>
                  <td>₹{{multiply this.price this.quantity}}</td>
                </tr>
                {{/each}}
              </tbody>
            </table>
          `;
          break;
        case ElementTypes.TOTAL:
          html += `
            <div style="${styleToString(element.style)}">
              <p>Subtotal: ₹{{subtotal}}</p>
              <p>GST (18%): ₹{{gst}}</p>
              <p>Total: ₹{{total}}</p>
            </div>
          `;
          break;
        case ElementTypes.TEXT:
          html += `<div style="${styleToString(element.style)}">${element.content}</div>`;
          break;
        case ElementTypes.IMAGE:
          html += `<img src="${element.content}" alt="Receipt Image" style="${styleToString(element.style)}" />`;
          break;
        case ElementTypes.DIVIDER:
          html += `<div class="divider"></div>`;
          break;
        case ElementTypes.FOOTER:
          html += `<div style="${styleToString(element.style)}">${element.content}</div>`;
          break;
        default:
          break;
      }
    });
    
    html += `
        </div>
      </body>
      </html>
    `;
    
    setPreviewHtml(html);
  };
  
  const styleToString = (style) => {
    return Object.entries(style).map(([key, value]) => {
      // Convert camelCase to kebab-case
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssKey}: ${value}`;
    }).join('; ');
  };
  
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setElements((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
  
  const addElement = (type) => {
    const newElement = { 
      id: `${type}-${Date.now()}`, 
      type
    };
    
    switch (type) {
      case ElementTypes.TEXT:
        newElement.content = 'New Text';
        newElement.style = { 
          fontSize: '16px',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          color: '#000000',
          textAlign: 'left',
        };
        break;
      case ElementTypes.IMAGE:
        newElement.content = '';
        newElement.style = { 
          width: '100%',
          maxWidth: '200px',
          margin: '10px auto',
          display: 'block'
        };
        break;
      case ElementTypes.DIVIDER:
        newElement.style = { 
          borderTop: '1px dashed #ccc',
          margin: '15px 0'
        };
        break;
      case ElementTypes.FOOTER:
        newElement.content = 'Thank you for your business!';
        newElement.style = { 
          fontSize: '14px',
          textAlign: 'center',
          fontStyle: 'italic',
          color: '#000000',
          marginTop: '20px'
        };
        break;
      default:
        break;
    }
    
    setElements([...elements, newElement]);
    setSelectedElement(newElement);
  };
  
  const updateElement = (id, updates) => {
    const updatedElements = elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    );
    setElements(updatedElements);
    
    // Also update the selected element reference
    if (selectedElement && selectedElement.id === id) {
      setSelectedElement({ ...selectedElement, ...updates });
    }
  };
  
  const removeElement = (id) => {
    const updatedElements = elements.filter(el => el.id !== id);
    setElements(updatedElements);
    
    if (selectedElement && selectedElement.id === id) {
      setSelectedElement(null);
    }
  };
  
  const saveTemplate = () => {
    updateSettings({ 
      ...settings, 
      receiptTemplate: elements 
    });
    
    alert('Receipt template saved successfully!');
  };
  
  const renderElementEditor = () => {
    if (!selectedElement) return null;
    
    const commonStyleEditors = (
      <div className="space-y-4 mt-4">
        <div className="flex flex-col space-y-2">
          <Label>Font Size</Label>
          <Input
            type="text"
            value={selectedElement.style?.fontSize || ''}
            onChange={(e) => updateElement(selectedElement.id, { 
              style: { ...selectedElement.style, fontSize: e.target.value } 
            })}
          />
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <Button 
            variant={selectedElement.style?.fontWeight === 'bold' ? 'default' : 'outline'}
            onClick={() => updateElement(selectedElement.id, { 
              style: { ...selectedElement.style, fontWeight: selectedElement.style?.fontWeight === 'bold' ? 'normal' : 'bold' } 
            })}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button 
            variant={selectedElement.style?.fontStyle === 'italic' ? 'default' : 'outline'}
            onClick={() => updateElement(selectedElement.id, { 
              style: { ...selectedElement.style, fontStyle: selectedElement.style?.fontStyle === 'italic' ? 'normal' : 'italic' } 
            })}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button 
            variant={selectedElement.style?.textDecoration === 'underline' ? 'default' : 'outline'}
            onClick={() => updateElement(selectedElement.id, { 
              style: { ...selectedElement.style, textDecoration: selectedElement.style?.textDecoration === 'underline' ? 'none' : 'underline' } 
            })}
          >
            <Underline className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <Button 
            variant={selectedElement.style?.textAlign === 'left' ? 'default' : 'outline'}
            onClick={() => updateElement(selectedElement.id, { 
              style: { ...selectedElement.style, textAlign: 'left' } 
            })}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant={selectedElement.style?.textAlign === 'center' ? 'default' : 'outline'}
            onClick={() => updateElement(selectedElement.id, { 
              style: { ...selectedElement.style, textAlign: 'center' } 
            })}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button 
            variant={selectedElement.style?.textAlign === 'right' ? 'default' : 'outline'}
            onClick={() => updateElement(selectedElement.id, { 
              style: { ...selectedElement.style, textAlign: 'right' } 
            })}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-col space-y-2">
          <Label>Text Color</Label>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-10 h-10 p-0" 
                  style={{ backgroundColor: selectedElement.style?.color || '#000000' }}
                />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <ChromePicker 
                  color={selectedElement.style?.color || '#000000'} 
                  onChange={(color) => updateElement(selectedElement.id, { 
                    style: { ...selectedElement.style, color: color.hex } 
                  })}
                />
              </PopoverContent>
            </Popover>
            <Input 
              type="text" 
              value={selectedElement.style?.color || '#000000'}
              onChange={(e) => updateElement(selectedElement.id, { 
                style: { ...selectedElement.style, color: e.target.value } 
              })}
            />
          </div>
        </div>
      </div>
    );
    
    switch (selectedElement.type) {
      case ElementTypes.TEXT:
      case ElementTypes.HEADER:
      case ElementTypes.FOOTER:
        return (
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label>Content</Label>
              <Textarea
                value={selectedElement.content || ''}
                onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                rows={3}
              />
            </div>
            {commonStyleEditors}
          </div>
        );
      case ElementTypes.COMPANY_INFO:
        return (
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label>Company Name</Label>
              <Input
                value={selectedElement.content?.name || ''}
                onChange={(e) => updateElement(selectedElement.id, { 
                  content: { ...selectedElement.content, name: e.target.value } 
                })}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label>Address</Label>
              <Input
                value={selectedElement.content?.address || ''}
                onChange={(e) => updateElement(selectedElement.id, { 
                  content: { ...selectedElement.content, address: e.target.value } 
                })}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label>GSTIN</Label>
              <Input
                value={selectedElement.content?.gstin || ''}
                onChange={(e) => updateElement(selectedElement.id, { 
                  content: { ...selectedElement.content, gstin: e.target.value } 
                })}
              />
            </div>
            {commonStyleEditors}
          </div>
        );
      case ElementTypes.IMAGE:
        return (
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label>Image URL</Label>
              <Input
                type="text"
                value={selectedElement.content || ''}
                onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label>Width</Label>
              <Input
                type="text"
                value={selectedElement.style?.width || '100%'}
                onChange={(e) => updateElement(selectedElement.id, { 
                  style: { ...selectedElement.style, width: e.target.value } 
                })}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label>Max Width</Label>
              <Input
                type="text"
                value={selectedElement.style?.maxWidth || '200px'}
                onChange={(e) => updateElement(selectedElement.id, { 
                  style: { ...selectedElement.style, maxWidth: e.target.value } 
                })}
              />
            </div>
          </div>
        );
      case ElementTypes.CUSTOMER_INFO:
      case ElementTypes.PRODUCT_TABLE:
      case ElementTypes.TOTAL:
        return (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                This is a dynamic element that will be populated with data during checkout.
              </AlertDescription>
            </Alert>
            {commonStyleEditors}
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Receipt Template Builder</h1>
        <div className="flex gap-2">
          <Button onClick={saveTemplate} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Template
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Edit Template
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" /> Preview
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Receipt Layout</CardTitle>
              </CardHeader>
              <CardContent>
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={elements.map(e => e.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {elements.map(element => (
                        <SortableItem key={element.id} id={element.id}>
                          <div 
                            className={`flex justify-between items-center p-2 rounded ${selectedElement?.id === element.id ? 'bg-primary/10 ring-1 ring-primary' : ''}`}
                            onClick={() => setSelectedElement(element)}
                          >
                            <div className="flex items-center gap-2">
                              {element.type === ElementTypes.TEXT && <Type className="h-4 w-4" />}
                              {element.type === ElementTypes.IMAGE && <ImageIcon className="h-4 w-4" />}
                              {element.type === ElementTypes.HEADER && <Type className="h-4 w-4" />}
                              {element.type === ElementTypes.COMPANY_INFO && <Type className="h-4 w-4" />}
                              {element.type === ElementTypes.CUSTOMER_INFO && <Type className="h-4 w-4" />}
                              {element.type === ElementTypes.PRODUCT_TABLE && <Table className="h-4 w-4" />}
                              {element.type === ElementTypes.TOTAL && <Type className="h-4 w-4" />}
                              {element.type === ElementTypes.FOOTER && <Type className="h-4 w-4" />}
                              <span className="font-medium capitalize">{element.type.replace(/-/g, ' ')}</span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                removeElement(element.id);
                              }}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                        </SortableItem>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
                
                <div className="flex flex-wrap gap-2 mt-6">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addElement(ElementTypes.TEXT)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Text
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addElement(ElementTypes.IMAGE)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Image
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addElement(ElementTypes.DIVIDER)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Divider
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addElement(ElementTypes.FOOTER)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Footer
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Element Properties</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedElement ? (
                  renderElementEditor()
                ) : (
                  <div className="text-center p-4 text-muted-foreground">
                    Select an element to edit its properties
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Receipt Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-4 overflow-auto max-h-[600px]">
                <iframe
                  srcDoc={previewHtml}
                  title="Receipt Preview"
                  className="w-full h-[600px]"
                  sandbox="allow-same-origin"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 