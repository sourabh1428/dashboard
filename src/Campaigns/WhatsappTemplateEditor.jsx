'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Info, Plus, Phone, Upload, X, Check, ChevronLeft, MoreVertical, Paperclip, Mic, Send, Link } from 'lucide-react'

// Initialize Supabase client
import { supabase } from '../Supabase/supabaseClient.js'

export default function WhatsAppTemplateEditor({ onSubmit, setDisabled }) {
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [header, setHeader] = useState('')
  const [body, setBody] = useState('')
  const [headerType, setHeaderType] = useState('TEXT')
  const [imageFile, setImageFile] = useState(null)
  const [imageUrl, setImageUrl] = useState('')
  const [currentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
  const [templateID, setTemplateID] = useState(null)
  const [showCTA, setShowCTA] = useState(false)
  const [ctaButtonName, setCtaButtonName] = useState('')
  const [ctaLink, setCtaLink] = useState('')
  const [imageUploadType, setImageUploadType] = useState('file')
  const [params, setParams] = useState({})

  useEffect(() => {
    fetchTemplates()
    setDisabled(true)
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch("https://api.gupshup.io/wa/app/9402e3f9-2750-43c2-86d2-9366f477f155/template", {
        method: "GET",
        headers: {
          "accept": "application/json",
          "apikey": "3t1djdl0hiqobxjxmdvctngegmr8o3yu"
        }
      })
      const data = await response.json()
      if (data.status === "success") {
        setTemplates(data.templates)
      }
    } catch (error) {
      console.error("Error fetching templates:", error)
    }
  }

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template)
    setHeader(template.containerMeta.header || '')
    setBody(template.data)
    setHeaderType(template.templateType)
    setImageFile(null)
    setTemplateID(template.id)
    setImageUrl('')
    setShowCTA(false)
    setCtaButtonName('')
    setCtaLink('')
    
    // Extract parameters from the template body
    const paramMatches = template.data.match(/{{[0-9]+}}/g) || []
    const newParams = {}
    paramMatches.forEach((match, index) => {
      newParams[match] = ''
    })
    setParams(newParams)
  }

  const handleParamChange = (param, value) => {
    setParams(prevParams => ({
      ...prevParams,
      [param]: value
    }))
  }

  const replaceParamsInBody = () => {
    let replacedBody = body
    Object.entries(params).forEach(([param, value]) => {
      replacedBody = replacedBody.replace(param, value)
    })
    return replacedBody
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = () => setImageUrl(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    let imagePublicUrl = imageUrl
    if (imageFile) {
      try {
        const imageName = `${selectedTemplate.elementName}-${Date.now()}`
        const { data, error } = await supabase.storage
          .from('Campaign images')
          .upload(imageName, imageFile, {
            cacheControl: '3600',
            upsert: false,
          })

        if (error) throw error

        const { data: publicURLData, error: urlError } = supabase
          .storage
          .from('Campaign images')
          .getPublicUrl(imageName)

        if (urlError) throw urlError
        imagePublicUrl = publicURLData.publicUrl
      } catch (error) {
        console.error("Error uploading image:", error)
      }
    }

    const templateData = {
      templateName: selectedTemplate?.elementName,
      header: headerType === 'TEXT' ? header : imagePublicUrl,
      headerType,
      body: replaceParamsInBody(),
      templateID,
      cta: showCTA ? {
        buttonName: ctaButtonName,
        link: ctaLink
      } : null,
      params
    }
    setDisabled(false)
    console.log("Template Data:", templateData)
    onSubmit(templateData)
  }

  return (
    <div className="space-y-6 p-4 rounded-lg">
      <div className="space-y-4">
        <label htmlFor="template-select" className="block text-sm font-medium">
          Select Template
        </label>
        <select
          id="template-select"
          className="w-full p-2 border rounded-md text-sm"
          onChange={(e) => handleTemplateSelect(templates[e.target.value])}
        >
          <option value="">Select a template</option>
          {templates.map((template, index) => (
            <option key={template.id} value={index} className="bg-green-200 text-black">
              {template.elementName}
            </option>
          ))}
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Editor Section */}
        <div className="space-y-6">
          {/* Header Section */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">Header ({headerType})</p>
                  <Badge variant="secondary" className="text-xs">Optional</Badge>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 " />
                    </TooltipTrigger>
                    <TooltipContent>
                      Add a header to your message.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {headerType === 'TEXT' && (
              
                <Input
                  value={header}
                  onChange={(e) => setHeader(e.target.value)}
                  placeholder="Enter header text"
                  maxLength={60}
                />
              )}
              {headerType === 'IMAGE' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="image-upload-type">Image Upload Type:</Label>
                    <select
                      id="image-upload-type"
                      className="p-2 border rounded-md text-sm bg-green-300 text-black"
                      value={imageUploadType}
                      onChange={(e) => setImageUploadType(e.target.value)}
                    >
                      <option value="file">File Upload</option>
                      <option value="url">Image URL</option>
                    </select>
                  </div>
                  {imageUploadType === 'file' ? (
                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer  transition-colors duration-300">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 " />
                          <p className="mb-2 text-sm "><span className="font-semibold">Click to upload</span> or drag and drop</p>
                          <p className="text-xs ">PNG, JPG or GIF (MAX. 800x400px)</p>
                        </div>
                        <input id="dropzone-file" type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                      </label>
                    </div>
                  ) : (
                    <Input
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Enter image URL"
                    />
                  )}
                  <AnimatePresence>
                    {imageUrl && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="relative"
                      >
                        <img src={imageUrl} alt="Selected" className="w-full h-auto rounded-lg object-cover max-h-48" />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setImageFile(null)
                            setImageUrl('')
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Body Section */}
          <Card>
            <CardContent className="p-6">
              <p className="font-semibold mb-4">Body</p>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter message text"
                className="min-h-[200px]"
              />
            </CardContent>
          </Card>

          {/* Parameters Section */}
          {Object.keys(params).length > 0 && (
            <Card>
              <CardContent className="p-6">
                <p className="font-semibold mb-4">Parameters</p>
                {Object.entries(params).map(([param, value]) => (
                  <div key={param} className="mb-4">
                    <Label htmlFor={param} className="block text-sm font-medium  mb-1">
                      {param}
                    </Label>
                    <Input
                      id={param}
                      value={value}
                      onChange={(e) => handleParamChange(param, e.target.value)}
                      placeholder={`Enter value for ${param}`}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* CTA Section */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="">Call to Action</p>
                <Switch
                  checked={showCTA}
                  onCheckedChange={setShowCTA}
                  id="cta-toggle"
                />
              </div>
              {showCTA && (
                <div className="space-y-4">
                  <Input
                    value={ctaButtonName}
                    onChange={(e) => setCtaButtonName(e.target.value)}
                    placeholder="CTA Button Name"
                  />
                  <Input
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    placeholder="CTA Link"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-green-600 p-4 flex items-center">
                <ChevronLeft className="h-6 w-6 mr-4" />
                <div>
                  <p className="font-semibold">WhatsApp Business</p>
                  <p className="text-xs">Template Preview</p>
                </div>
                <MoreVertical className="h-6 w-6 ml-auto" />
              </div>
              <div className=" p-4 h-[500px] overflow-y-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className=" rounded-lg p-3 shadow-sm max-w-[80%] ml-auto mb-4"
                >
                  {headerType === 'TEXT' && header && <div className="font-semibold mb-2 text-sm">{header}</div>}
                  {headerType === 'IMAGE' && imageUrl && (
                    <img src={imageUrl} alt="Header" className="w-full rounded-lg mb-2 max-h-40 object-cover" />
                  )}
                  <p className="text-sm whitespace-pre-wrap">{replaceParamsInBody() || 'Message preview will appear here'}</p>
                  {showCTA && (
                    <div className="mt-2 p-2  rounded-md">
                      <a href={ctaLink} target="_blank" rel="noopener noreferrer" className="text-green-600 font-medium flex items-center">
                        <Link className="h-4 w-4 mr-1" />
                        {ctaButtonName || 'Click here'}
                      </a>
                    </div>
                  )}
                  <div className="text-right mt-1">
                    <span className="text-xs ">{currentTime}</span>
                    <Check className="h-4 w-4 text-green-500 inline ml-1" />
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
          <Button onClick={handleSubmit} className="w-full bg-green-600 hover:bg-green-700">
            <Send className="h-4 w-4 mr-2" />
            Submit Template
          </Button>
        </div>
      </div>
    </div>
  )
}