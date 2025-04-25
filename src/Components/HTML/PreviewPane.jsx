import React from 'react'

const PreviewPane = ({ rows, device }) => {
  const containerStyle = device === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'

  const renderContent = (content) => {
    switch (content.type) {
      case 'text':
        return <p>{content.data.text}</p>
      case 'image':
        return <img src={content.data.src} alt={content.data.alt} className="max-w-full h-auto" />
      case 'button':
        return (
          <a href={content.data.url} className="btn btn-primary">
            {content.data.text}
          </a>
        )
      case 'link':
        return <a href={content.data.url}>{content.data.text}</a>
      default:
        return null
    }
  }

  return (
    <div className={`border p-4 ${containerStyle}`}>
      {rows.map((row) => (
        <div key={row.id} className="mb-4">
          {row.content.map((content) => (
            <div key={content.id}>{renderContent(content)}</div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default PreviewPane