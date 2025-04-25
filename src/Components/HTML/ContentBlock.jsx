import React from 'react'

const ContentBlock = ({ content, updateContent }) => {
  const handleChange = (e) => {
    updateContent({
      ...content.data,
      [e.target.name]: e.target.value
    })
  }

  switch (content.type) {
    case 'heading':
      return (
        <input
          type="text"
          name="text"
          value={content.data.text || ''}
          onChange={handleChange}
          className="w-full text-2xl font-bold p-2 mb-2"
          placeholder="Enter heading..."
        />
      )

    case 'text':
      return (
        <textarea
          name="text"
          value={content.data.text || ''}
          onChange={handleChange}
          className="w-full p-2 mb-2"
          placeholder="Enter text..."
          rows="3"
        />
      )

    case 'image':
      return (
        <div className="mb-2">
          <input
            type="text"
            name="src"
            value={content.data.src || ''}
            onChange={handleChange}
            className="w-full p-2 mb-2"
            placeholder="Image URL..."
          />
          <input
            type="text"
            name="alt"
            value={content.data.alt || ''}
            onChange={handleChange}
            className="w-full p-2"
            placeholder="Alt text..."
          />
        </div>
      )

    case 'button':
      return (
        <div className="mb-2">
          <input
            type="text"
            name="text"
            value={content.data.text || ''}
            onChange={handleChange}
            className="w-full p-2 mb-2"
            placeholder="Button text..."
          />
          <input
            type="text"
            name="url"
            value={content.data.url || ''}
            onChange={handleChange}
            className="w-full p-2"
            placeholder="Button URL..."
          />
        </div>
      )

    default:
      return <div>Unsupported content type</div>
  }
}

export default ContentBlock