import React from 'react'
import { Loader2 } from "lucide-react"

export function Spinner({ size = "default", className }) {
  const sizeClasses = {
    default: "h-4 w-4",
    sm: "h-3 w-3",
    lg: "h-6 w-6"
  }

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  )
}