'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronRight, ChevronLeft, Plus, X, Calendar as CalendarIcon } from 'lucide-react'
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import WhatsAppTemplateEditor from './WhatsappTemplateEditor'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { getApiKey } from '@/configApi'

export default function CreateWhatsapp() {
  const navigate =useNavigate();
  const [step, setStep] = useState(1)
  const [campaign, setCampaign] = useState({
    name: '',
    type: '',
    attributes: [{ type: 'email', value: '' }],
    event: '',
    content: '',
    template: 'custom',
    scheduleType: 'asap',
    scheduledDate: new Date(),
  })
  const [isDisabled, setDisabled] = useState(false)

  const updateCampaign = (field, value) => {
    setCampaign(prev => ({ ...prev, [field]: value }))
  }

  const addAttribute = () => {
    setCampaign(prev => ({
      ...prev,
      attributes: [...prev.attributes, { type: 'email', value: '' }]
    }))
  }

  const updateAttribute = (index, field, value) => {
    setCampaign(prev => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) => 
        i === index ? { ...attr, [field]: value } : attr
      )
    }))
  }

  const removeAttribute = (index) => {
    setCampaign(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }))
  }

  const nextStep = () => setStep(prev => Math.min(prev + 1, 5))
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1))

  const onSubmit = (tempData) => {
    setCampaign({...campaign, template: tempData})
  }

  const createCampaign = () => {
    console.log(campaign);
    postCampaign(campaign);
    navigate('/');
    //post that campauign
    ////  channel , type ,  event || attribute , value ,  channel
    //templateID:templateID, destinationPhone, params,type, fileLink,cta_url,ctaUrlText,ctaUrl 

    //call the post campaign 

    // const data=campaign.template;
    // const templateID=data.templateID;
    // const destinationPhone=campaign.attributes[0].value;
    // const fileLink=data.header;
    // const channel="whatsapp";
    // let cta_url=true;
    // if(cta_url===undefined || cta_url===null) cta_url=false;
    // const ctaUrlText=data.cta_url.buttonName;
    // const ctaUrl=data.cta_url.link;
    // if(campaign.type!=="event"){
    //     const type="attribute";
    //     const attribute="mobile_number";
    //     const value=destinationPhone;
    //     const response=axios.request("http://localhost:8080/campaigns/postCampaign")
        
    // }else{

    // }



  
  }


  async function postCampaign(campaign) {

    console.log('this is campaing',campaign);
    
    try {
        // Set up data based on campaign object
        const data = campaign.template;
        const templateID = data.templateID;
        const destinationPhone = campaign.attributes;
        const fileLink = data.header;
        const channel = "whatsapp";
        
        // Optional cta_url handling
        let cta_url = true;
        if (cta_url === undefined || cta_url === null) cta_url = false;
        
        const ctaUrlText = data.cta?.buttonName || ''; // Ensure it's defined
        const ctaUrl = data.cta?.link || '';
        let hue= campaign.type === "event" ? "event" : "attribute";
        // Prepare campaignData based on campaign.type
        let campaignData = {
            type: campaign.type === "event" ? "event" : "attribute",
            [hue]:campaign.event,
            attribute: campaign.type !== "event" ? "mobile_number" : undefined, 
            value: destinationPhone,
            oneTime:true,
            description:campaign.description ||"123", // Add your description
            channel: channel,
            name: campaign.name||"my campaign", // Update if you have a dynamic name value
 
            fileLink: fileLink,
            data: {
                templateID: templateID,
               
                headerImageId: "",
                params: Object.values(data.params), // Replace with actual parameters
                type: data.headerType.toLowerCase(), // Ensure lowercase for the type
                fileLink: fileLink,
                cta_url: cta_url,
                ctaUrlText: ctaUrlText,
                ctaUrl: ctaUrl,
            }
        };

        // Make the POST request with the required headers and data
        const response = await axios.post('http://localhost:8080/campaigns/postCampaign', campaignData, {
            headers: {
                'x-api-key': getApiKey(), // API key
                'Content-Type': 'application/json'
            }
        });

        // Log or handle the response as needed
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error:', error.message);
    }
}


  const steps = [
    { number: 1, title: 'Basic Info' },
    { number: 2, title: 'Targeting' },
    { number: 3, title: 'Content' },
    { number: 4, title: 'Schedule' },
    { number: 5, title: 'Review' },
  ]

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass-panel border-border/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl text-gradient-primary">Campaign Basics</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Start by naming your campaign
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="campaign-name" className="text-muted-foreground mb-3">
                      Campaign Name
                    </Label>
                    <Input 
                      id="campaign-name" 
                      value={campaign.name} 
                      onChange={(e) => updateCampaign('name', e.target.value)}
                      placeholder="Summer Sale 2023"
                      className="h-12 text-lg border-border/50 focus:border-brand-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass-panel border-border/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl text-gradient-primary">Target Audience</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Define who will receive this campaign
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <RadioGroup 
                    value={campaign.type} 
                    onValueChange={(value) => updateCampaign('type', value)} 
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="relative">
                      <RadioGroupItem value="attribute" id="attribute" className="peer sr-only" />
                      <Label 
                        htmlFor="attribute" 
                        className="flex flex-col p-6 border-2 border-border/30 rounded-xl hover:border-brand-500/50 cursor-pointer transition-all peer-data-[state=checked]:border-brand-500 glass-panel"
                      >
                        <span className="text-lg font-semibold mb-2">Attribute-based</span>
                        <span className="text-sm text-muted-foreground">
                          Target users based on specific attributes
                        </span>
                      </Label>
                    </div>
                    <div className="relative">
                      <RadioGroupItem value="event" id="event" className="peer sr-only" />
                      <Label 
                        htmlFor="event" 
                        className="flex flex-col p-6 border-2 border-border/30 rounded-xl hover:border-brand-500/50 cursor-pointer transition-all peer-data-[state=checked]:border-brand-500 glass-panel"
                      >
                        <span className="text-lg font-semibold mb-2">Event-based</span>
                        <span className="text-sm text-muted-foreground">
                          Trigger campaign based on user events
                        </span>
                      </Label>
                    </div>
                  </RadioGroup>

                  {campaign.type === 'attribute' && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        {campaign.attributes.map((attr, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-3"
                          >
                            <Select 
                              value={attr.type} 
                              onValueChange={(value) => updateAttribute(index, 'type', value)}
                              className="w-[180px]"
                            >
                              <SelectTrigger className="border-border/50">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="glass-panel">
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="mobile_number">Mobile Number</SelectItem>
                                <SelectItem value="name">Name</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input 
                              value={attr.value} 
                              onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                              placeholder={`Enter ${attr.type.replace('_', ' ')}`}
                              className=""
                            />
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeAttribute(index)}
                              className="text-red-500 hover:bg-red-500/10"
                            >
                              <X className="h-5 w-5" />
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                      <Button 
                        onClick={addAttribute} 
                        variant="outline" 
                        className="w-full border-dashed border-brand-500/50 hover:border-brand-500 text-brand-500 hover:text-brand-600"
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add Attribute
                      </Button>
                    </div>
                  )}

                  {campaign.type === 'event' && (
                    <div className="space-y-4">
                      <Label className="block text-sm font-medium text-muted-foreground">Select Event</Label>
                      <Select 
                        value={campaign.event} 
                        onValueChange={(value) => updateCampaign('event', value)}
                      >
                        <SelectTrigger className="h-12 text-base border-border/50">
                          <SelectValue placeholder="Select an event" />
                        </SelectTrigger>
                        <SelectContent className="glass-panel">
                          <SelectItem value="add_to_cart">Add to Cart</SelectItem>
                          <SelectItem value="product_viewed">Product Viewed</SelectItem>
                          <SelectItem value="product_purchased">Product Purchased</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )

      // Add similar enhanced styling for other steps

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Content Creation</CardTitle>
              </CardHeader>
              <CardContent>
                <WhatsAppTemplateEditor setDisabled={setDisabled} onSubmit={onSubmit}/>
              </CardContent>
            </Card>
          </motion.div>
        )
      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Scheduling</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <RadioGroup 
                    value={campaign.scheduleType} 
                    onValueChange={(value) => updateCampaign('scheduleType', value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="asap" id="asap" />
                      <Label htmlFor="asap">ASAP</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="specific" id="specific" />
                      <Label htmlFor="specific">Specific Date & Time</Label>
                    </div>
                  </RadioGroup>
                  {campaign.scheduleType === "specific" && (
                    <div className="flex flex-col">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[280px] justify-start text-left font-normal",
                              !campaign.scheduledDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {campaign.scheduledDate ? format(campaign.scheduledDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={campaign.scheduledDate}
                            onSelect={(date) => updateCampaign('scheduledDate', date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Campaign Name:</strong> {campaign.name}</p>
                  <p><strong>Campaign Type:</strong> {campaign.type}</p>
                  {campaign.type === 'attribute' && (
                    <div>
                      <p><strong>Attributes:</strong></p>
                      <ul className="list-disc list-inside">
                        {campaign.attributes.map((attr, index) => (
                          <li key={index}>{attr.type}: {attr.value}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {campaign.type === 'event' && (
                    <p><strong>Event:</strong> {campaign.event}</p>
                  )}
                  <p><strong>Content:</strong> {campaign.content}</p>
                  <p><strong>Schedule Type:</strong> {campaign.scheduleType}</p>
                  {campaign.scheduleType === 'specific' && (
                    <p><strong>Scheduled Date:</strong> {format(campaign.scheduledDate, "PPP")}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
  
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        

        {/* Enhanced Progress Steps */}
        <div className="mb-12">
          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-500/20 to-transparent" />
            <div className="flex justify-between">
              {steps.map((s, index) => (
                <div key={s.number} className="relative z-10 flex flex-col items-center">
                  <motion.button
                    onClick={() => step > s.number && setStep(s.number)}
                    className={cn(
                      "h-12 w-12 rounded-full flex items-center justify-center transition-all",
                      "shadow-lg hover:shadow-brand-500/20",
                      step >= s.number 
                        ? 'bg-gradient-to-br from-brand-500 to-accent text-white'
                        : 'bg-card border-2 border-border/30 text-muted-foreground'
                    )}
                    whileHover={{ scale: step > s.number ? 1.1 : 1 }}
                  >
                    {s.number}
                  </motion.button>
                  <div className={cn(
                    "absolute top-14 text-sm font-medium transition-colors",
                    step >= s.number ? 'text-brand-500' : 'text-muted-foreground'
                  )}>
                    {s.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>

        <div className="mt-8 flex justify-between gap-4">
          {step > 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Button 
                onClick={prevStep} 
                variant="outline" 
                className="h-12 px-6 text-lg gap-2 border-border/30 hover:border-brand-500/50 text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-5 w-5" /> Previous
              </Button>
            </motion.div>
          )}
          <div className="flex-1" />
          {step < 5 ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Button 
                onClick={nextStep} 
                disabled={isDisabled}
                className="h-12 px-8 text-lg bg-gradient-to-br from-brand-500 to-accent hover:from-brand-600 hover:to-accent/90 gap-2 shadow-lg shadow-brand-500/20"
              >
                Next Step <ChevronRight className="h-5 w-5" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                onClick={createCampaign}
                className="h-12 px-8 text-lg bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 gap-2 shadow-lg shadow-green-500/20"
              >
                Launch Campaign 🚀
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}