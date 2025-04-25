import React, { useState, useEffect } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { v4 as uuidv4 } from 'uuid'
import { Laptop, Smartphone, Code, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import EditorRow from './EditorRow'
import ContentTypeSelector from './ContentTypeSelector'
import PreviewPane from './PreviewPane'

const MotionCard = motion(Card)

export default function HTMLEditor() {
  const [rows, setRows] = useState([])
  const [previewDevice, setPreviewDevice] = useState('desktop')
  const [showHtmlCode, setShowHtmlCode] = useState(false)
  const [htmlCode, setHtmlCode] = useState('')
  const [editorWidth, setEditorWidth] = useState(50)

  const addRow = () => {
    setRows([...rows, { id: uuidv4(), content: [] }])
  }

  const addContent = (rowId, contentType) => {
    setRows(rows.map(row => {
      if (row.id === rowId) {
        return {
          ...row,
          content: [...row.content, { id: uuidv4(), type: contentType, data: {} }]
        }
      }
      return row
    }))
  }

  const updateContent = (rowId, contentId, data) => {
    setRows(rows.map(row => {
      if (row.id === rowId) {
        return {
          ...row,
          content: row.content.map(content => {
            if (content.id === contentId) {
              return { ...content, data }
            }
            return content
          })
        }
      }
      return row
    }))
  }

  const moveRow = (dragIndex, hoverIndex) => {
    const newRows = [...rows]
    const [reorderedRow] = newRows.splice(dragIndex, 1)
    newRows.splice(hoverIndex, 0, reorderedRow)
    setRows(newRows)
  }

  const deleteRow = (rowId) => {
    setRows(rows.filter(row => row.id !== rowId))
  }

  const generateHtmlCode = () => {
    let html = '<table width="100%" cellpadding="0" cellspacing="0" border="0">'
    rows.forEach(row => {
      html += '<tr><td>'
      row.content.forEach(content => {
        switch (content.type) {
          case 'heading':
            html += `<h2>${content.data.text || ''}</h2>`
            break
          case 'text':
            html += `<p>${content.data.text || ''}</p>`
            break
          case 'image':
            html += `<img src="${content.data.src || ''}" alt="${content.data.alt || ''}" style="max-width: 100%;">`
            break
          case 'button':
            html += `<a href="${content.data.url || ''}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px;">${content.data.text || ''}</a>`
            break
          case 'link':
            html += `<a href="${content.data.url || ''}">${content.data.text || ''}</a>`
            break
          case 'list':
            html += `<ul>${(content.data.items || []).map(item => `<li>${item}</li>`).join('')}</ul>`
            break
        }
      })
      html += '</td></tr>'
    })
    html += '</table>'
    return html
  }

  useEffect(() => {
    setHtmlCode(generateHtmlCode())
  }, [rows])

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container mx-auto p-4 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
     
        <div className="flex flex-col lg:flex-row gap-4 relative">
          <MotionCard 
            className="flex-1"
            style={{ width: `${editorWidth}%` }}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Editor</h2>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={addRow} size="sm">Add Row</Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add a new row to your email</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <ScrollArea className="h-[calc(100vh-200px)]">
                <AnimatePresence>
                  {rows.map((row, index) => (
                    <motion.div
                      key={row.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <EditorRow
                        row={row}
                        index={index}
                        moveRow={moveRow}
                        deleteRow={deleteRow}
                        addContent={(contentType) => addContent(row.id, contentType)}
                        updateContent={(contentId, data) => updateContent(row.id, contentId, data)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </ScrollArea>
            </CardContent>
          </MotionCard>
          <Separator orientation="vertical" className="h-[calc(100vh-100px)] mx-2" />
          <MotionCard 
            className="flex-1"
            style={{ width: `${100 - editorWidth}%` }}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CardContent className="p-4">
              <Tabs defaultValue="desktop" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="desktop" onClick={() => { setPreviewDevice('desktop'); setShowHtmlCode(false); }}>
                    <Laptop className="mr-2 h-4 w-4" />
                    Desktop
                  </TabsTrigger>
                  <TabsTrigger value="mobile" onClick={() => { setPreviewDevice('mobile'); setShowHtmlCode(false); }}>
                    <Smartphone className="mr-2 h-4 w-4" />
                    Mobile
                  </TabsTrigger>
                  <TabsTrigger value="html" onClick={() => setShowHtmlCode(true)}>
                    <Code className="mr-2 h-4 w-4" />
                    HTML
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="desktop" className="mt-4">
                  <PreviewPane rows={rows} device={previewDevice} />
                </TabsContent>
                <TabsContent value="mobile" className="mt-4">
                  <PreviewPane rows={rows} device={previewDevice} />
                </TabsContent>
                <TabsContent value="html" className="mt-4">
                  <Textarea
                    value={htmlCode}
                    readOnly
                    className="w-full h-[calc(100vh-300px)] font-mono text-sm"
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </MotionCard>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => setEditorWidth(Math.max(30, editorWidth - 5))}
              className="rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setEditorWidth(Math.min(70, editorWidth + 5))}
              className="rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </DndProvider>
  )
}