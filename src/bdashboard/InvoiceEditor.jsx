import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChromePicker } from 'react-color';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Minus, Move, Type, Image, List, Grid, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

const ElementTypes = {
  TEXT: 'text',
  IMAGE: 'image',
  PRODUCT_LIST: 'product-list',
  TABLE: 'table'
};

const SortableItem = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

export function AdvancedInvoiceEditor({ products, settings, updateSettings }) {
  const [elements, setElements] = useState(settings.invoiceTemplate || []);
  const [selectedElement, setSelectedElement] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (settings.invoiceTemplate) {
      setElements(settings.invoiceTemplate);
    }
  }, [settings.invoiceTemplate]);

  const addElement = (type) => {
    const newElement = { 
      id: Date.now(), 
      type, 
      content: type === ElementTypes.TEXT ? 'New Text' : '',
      style: { 
        fontSize: '16px',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'none',
        color: '#000000',
        textAlign: 'left',
      }
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement);
  };

  const updateElement = (id, updates) => {
    const updatedElements = elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    );
    setElements(updatedElements);
    updateSettings({ ...settings, invoiceTemplate: updatedElements });
  };

  const removeElement = (id) => {
    const updatedElements = elements.filter(el => el.id !== id);
    setElements(updatedElements);
    updateSettings({ ...settings, invoiceTemplate: updatedElements });
    if (selectedElement && selectedElement.id === id) {
      setSelectedElement(null);
    }
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

  const renderElement = (element) => {
    switch (element.type) {
      case ElementTypes.TEXT:
        return (
          <div
            style={element.style}
            onClick={() => setSelectedElement(element)}
          >
            {element.content}
          </div>
        );
      case ElementTypes.IMAGE:
        return (
          <div onClick={() => setSelectedElement(element)}>
            <img src={element.content} alt="Invoice element" style={element.style} />
          </div>
        );
      case ElementTypes.PRODUCT_LIST:
        return (
          <div onClick={() => setSelectedElement(element)}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.title}</TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>${(product.quantity * product.price).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      case ElementTypes.TABLE:
        return (
          <div onClick={() => setSelectedElement(element)}>
            <Table>
              <TableBody>
                {element.content.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      default:
        return null;
    }
  };

  const renderElementEditor = () => {
    if (!selectedElement) return null;

    switch (selectedElement.type) {
      case ElementTypes.TEXT:
        return (
          <div className="space-y-4">
            <Textarea
              value={selectedElement.content}
              onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
            />
            <div className="flex space-x-2">
              <Button onClick={() => updateElement(selectedElement.id, { style: { ...selectedElement.style, fontWeight: selectedElement.style.fontWeight === 'bold' ? 'normal' : 'bold' } })}>
                <Bold size={16} />
              </Button>
              <Button onClick={() => updateElement(selectedElement.id, { style: { ...selectedElement.style, fontStyle: selectedElement.style.fontStyle === 'italic' ? 'normal' : 'italic' } })}>
                <Italic size={16} />
              </Button>
              <Button onClick={() => updateElement(selectedElement.id, { style: { ...selectedElement.style, textDecoration: selectedElement.style.textDecoration === 'underline' ? 'none' : 'underline' } })}>
                <Underline size={16} />
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => updateElement(selectedElement.id, { style: { ...selectedElement.style, textAlign: 'left' } })}>
                <AlignLeft size={16} />
              </Button>
              <Button onClick={() => updateElement(selectedElement.id, { style: { ...selectedElement.style, textAlign: 'center' } })}>
                <AlignCenter size={16} />
              </Button>
              <Button onClick={() => updateElement(selectedElement.id, { style: { ...selectedElement.style, textAlign: 'right' } })}>
                <AlignRight size={16} />
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Label>Font Size:</Label>
              <Input
                type="number"
                value={parseInt(selectedElement.style.fontSize)}
                onChange={(e) => updateElement(selectedElement.id, { style: { ...selectedElement.style, fontSize: `${e.target.value}px` } })}
                className="w-20"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Label>Color:</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    className="w-10 h-10 rounded-full" 
                    style={{ backgroundColor: selectedElement.style.color }}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <ChromePicker 
                    color={selectedElement.style.color}
                    onChange={(color) => updateElement(selectedElement.id, { style: { ...selectedElement.style, color: color.hex } })}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        );
      case ElementTypes.IMAGE:
        return (
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Image URL"
              value={selectedElement.content}
              onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
            />
            <div className="flex items-center space-x-2">
              <Label>Width:</Label>
              <Slider
                min={10}
                max={100}
                step={1}
                value={[parseInt(selectedElement.style.width) || 100]}
                onValueChange={(value) => updateElement(selectedElement.id, { style: { ...selectedElement.style, width: `${value[0]}%` } })}
              />
            </div>
          </div>
        );
      case ElementTypes.TABLE:
        return (
          <div className="space-y-4">
            <Button onClick={() => {
              const newContent = [...selectedElement.content, Array(selectedElement.content[0].length).fill('')];
              updateElement(selectedElement.id, { content: newContent });
            }}>
              Add Row
            </Button>
            <Button onClick={() => {
              const newContent = selectedElement.content.map(row => [...row, '']);
              updateElement(selectedElement.id, { content: newContent });
            }}>
              Add Column
            </Button>
            {selectedElement.content.map((row, rowIndex) => (
              <div key={rowIndex} className="flex space-x-2">
                {row.map((cell, cellIndex) => (
                  <Input
                    key={cellIndex}
                    value={cell}
                    onChange={(e) => {
                      const newContent = [...selectedElement.content];
                      newContent[rowIndex][cellIndex] = e.target.value;
                      updateElement(selectedElement.id, { content: newContent });
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Advanced Invoice Editor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 mb-4">
          <Button onClick={() => addElement(ElementTypes.TEXT)}><Type size={16} className="mr-2" /> Add Text</Button>
          <Button onClick={() => addElement(ElementTypes.IMAGE)}><Image size={16} className="mr-2" /> Add Image</Button>
          <Button onClick={() => addElement(ElementTypes.PRODUCT_LIST)}><List size={16} className="mr-2" /> Add Product List</Button>
          <Button onClick={() => addElement(ElementTypes.TABLE)}><Grid size={16} className="mr-2" /> Add Table</Button>
        </div>
        <div className="flex">
          <div className="w-2/3 pr-4 border-r">
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={elements}
                strategy={verticalListSortingStrategy}
              >
                {elements.map((element) => (
                  <SortableItem key={element.id} id={element.id}>
                    <div className="mb-4 p-4 border rounded relative">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => removeElement(element.id)}
                      >
                        <Minus size={16} />
                      </Button>
                      <div className="cursor-move absolute top-2 left-2">
                        <Move size={16} />
                      </div>
                      {renderElement(element)}
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
          </div>
          <div className="w-1/3 pl-4">
            <h3 className="text-lg font-semibold mb-4">Element Editor</h3>
            {renderElementEditor()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}