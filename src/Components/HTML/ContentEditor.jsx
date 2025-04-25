import React from 'react'
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const ContentEditor = ({ content, updateContent }) => {
  const handleChange = (e) => {
    updateContent({ ...content.data, [e.target.name]: e.target.value })
  }

  switch (content.type) {
    case 'text':
      return (
        <Textarea
          name="text"
          value={content.data.text || ''}
          onChange={handleChange}
          placeholder="Enter text here"
        />
      )
    case 'image':
      return (
        <div className="space-y-2">
          <Input
            name="src"
            value={content.data.src || ''}
            onChange={handleChange}
            placeholder="Image URL"
          />
          <Input
            name="alt"
            value={content.data.alt || ''}
            onChange={handleChange}
            placeholder="Alt text"
          />
        </div>
      )
    case 'button':
      return (
        <div className="space-y-2">
          <Input
            name="text"
            value={content.data.text || ''}
            onChange={handleChange}
            placeholder="Button text"
          />
          <Input
            name="url"
            value={content.data.url || ''}
            onChange={handleChange}
            placeholder="Button URL"
          />
        </div>
      )
    case 'link':
      return (
        <div className="space-y-2">
          <Input
            name="text"
            value={content.data.text || ''}
            onChange={handleChange}
            placeholder="Link text"
          />
          <Input
            name="url"
            value={content.data.url || ''}
            onChange={handleChange}
            placeholder="Link URL"
          />
        </div>
      )
    default:
      return null
  }
}

export default ContentEditor