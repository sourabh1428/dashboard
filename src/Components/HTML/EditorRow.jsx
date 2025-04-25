import React from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { Grip, Trash2 } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import ContentTypeSelector from './ContentTypeSelector'
import ContentEditor from './ContentEditor'

const EditorRow = ({ row, index, moveRow, deleteRow, addContent, updateContent }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'ROW',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [, drop] = useDrop({
    accept: 'ROW',
    hover(item, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index
      if (dragIndex === hoverIndex) {
        return
      }
      moveRow(dragIndex, hoverIndex)
      item.index = hoverIndex
    },
  })

  const ref = React.useRef(null)
  const dragDropRef = drag(drop(ref))

  return (
    <Card ref={dragDropRef} className={`mb-4 ${isDragging ? 'opacity-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Grip className="mr-2 cursor-move" />
            <span>Row {index + 1}</span>
          </div>
          <Button variant="destructive" size="icon" onClick={() => deleteRow(row.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {row.content.map((content) => (
            <ContentEditor
              key={content.id}
              content={content}
              updateContent={(data) => updateContent(content.id, data)}
            />
          ))}
        </div>
        <ContentTypeSelector onSelect={(contentType) => addContent(contentType)} />
      </CardContent>
    </Card>
  )
}

export default EditorRow