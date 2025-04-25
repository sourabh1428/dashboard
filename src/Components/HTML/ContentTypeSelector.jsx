import React from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const ContentTypeSelector = ({ onSelect }) => {
  const contentTypes = [
    { type: 'heading', label: 'Heading' },
    { type: 'text', label: 'Paragraph' },
    { type: 'image', label: 'Image' },
    { type: 'button', label: 'Button' },
    { type: 'link', label: 'Link' },
    { type: 'list', label: 'List' },
  ]

  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full">
                Add Content
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to add new content to your email</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Content Types</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {contentTypes.map(({ type, label }) => (
            <DropdownMenuItem
              key={type}
              onClick={() => onSelect(type)}
              className="flex items-center cursor-pointer"
            >
              <span>{label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  )
}

export default ContentTypeSelector