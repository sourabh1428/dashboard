import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Calendar, BarChart, FileText, Users, Smartphone, CheckCircle2, CircleSlash, ChevronRight } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { getApiKey } from '@/configApi'

// ... (Keep the API functions same as previous)
async function getParticularCampaign(cid) {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/campaigns/getParticularCampaign`,
      { cid },
      { headers: { 'x-api-key': getApiKey() } }
    )
    return response.data
  } catch (error) {
    console.error("Error fetching campaign:", error)
    throw error
  }
}

async function deleteCampaign(segmentId) {
  console.log(segmentId);
  
 
  try {
    await axios.delete(
      `${import.meta.env.VITE_API_URL}/campaigns/deleteCampaign`,
      {
        headers: { 'x-api-key': getApiKey() },
        data: { segment_id:segmentId }
      }
    )
    return true
  } catch (error) {
    console.error("Error deleting campaign:", error)
    throw error
  }
}

async function getParticularSegment(segment_id) {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/campaigns/getParticularCampaignSegment`,
      { segment_id },
      { headers: { 'x-api-key': getApiKey() } }
    )
    return response.data
  } catch (error) {
    console.error("Error fetching segment:", error)
    throw error
  }
}

export default function SingleCampaign() {
  // ... (Keep state and effect hooks same as previous)
  const progressRef = useRef(null)


  const { cid } = useParams()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState(null)
  const [segment, setSegment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const campaignData = await getParticularCampaign(cid)
        const segmentData = await getParticularSegment(campaignData.segment_id)
        
        setCampaign(campaignData)
        setSegment(segmentData)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load campaign details")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [cid])
  useEffect(() => {
    if (segment && progressRef.current) {
      const progress = (segment.processedUsers?.length / segment.processedUsers?.length) * 100 || 0
      progressRef.current.style.width = `${progress}%`
    }
  }, [segment])
  const handleDelete = async () => {
    try {
      await deleteCampaign(campaign.segment_id)
      navigate('/')
    } catch (err) {
      setError("Error deleting campaign")
    }
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="max-w-4xl mx-auto shadow-2xl rounded-2xl overflow-hidden ">
          {loading ? (
            <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4 rounded-lg" />
              <Skeleton className="h-4 w-1/2 rounded-lg" />
            </div>
            <Skeleton className="h-64 w-full rounded-xl" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-20 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4 rounded-lg" />
              <Skeleton className="h-4 w-2/3 rounded-lg" />
              <Skeleton className="h-4 w-1/2 rounded-lg" />
            </div>
          </CardContent>
          ) : (
            <>
              <CardHeader className="px-6 pt-6 pb-4 border-b">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-3xl font-bold bg-gradient-to-r ">
                        {campaign.name}
                      </CardTitle>
                      <div className="mt-2 flex items-center gap-3">
                        <Badge variant="outline" className="px-3 py-1 text-sm backdrop-blur-sm bg-white/50">
                          <Smartphone className="mr-2 h-4 w-4" />
                          {segment?.attribute} Segment
                        </Badge>
                        <Badge 
                          variant={campaign?.status === 'complete' ? 'default' : 'destructive'}
                          className="animate-pulse"
                        >
                          {campaign?.status}
                        </Badge>
                      </div>
                    </div>
                    <Badge variant="secondary" className="px-3 py-2 text-sm backdrop-blur-sm bg-white/50">
                      <Calendar className="mr-2 h-4 w-4" />
                      {format(new Date(campaign.createdAt), 'dd MMM yyyy')}
                    </Badge>
                  </div>
                </motion.div>
              </CardHeader>

              <CardContent className="px-6 py-6 space-y-8">
                {/* Animated Segment Section */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2  bg-clip-text text-transparent">
                      <Users className="h-5 w-5" />
                      Target Audience
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Mobile Numbers Card */}
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                          <Smartphone className="h-5 w-5 " />
                          <span className="font-medium">Contact List</span>
                          <Badge variant="outline" className="ml-auto">
                            {segment?.value?.length} Numbers
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="max-h-40 overflow-y-auto pr-2">
                            {segment?.value?.map((item, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                              >
                                <ChevronRight className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="font-mono text-sm">{item.value}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Progress Card */}
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <span className="font-medium">Delivery Progress</span>
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm">
                            <span>Processed</span>
                            <span>
                              {segment?.processedUsers?.length || 0}
                              <span className="text-gray-500">/{segment?.processedUsers?.length || 0}</span>
                            </span>
                          </div>
                          <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              ref={progressRef}
                              className="absolute h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                              initial={{ width: 0 }}
                              animate={{
                                width: `${(segment.processedUsers?.length / segment.processedUsers?.length) * 100 || 0}%`
                              }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <CircleSlash className="h-4 w-4 text-red-500" />
                            {segment?.users?.length - segment?.processedUsers?.length || 0} remaining
                            {segment?.lastProcessed && (
                              <span className="ml-auto text-xs">
                                Last: {format(new Date(segment.lastProcessed), 'HH:mm:ss')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Message Config Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  {campaign.data && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        <FileText className="h-5 w-5" />
                        Message Configuration
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Template Details */}
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                          <div className="space-y-4">
                            <div>
                              <Label className="text-gray-500">Template ID</Label>
                              <div className="font-medium mt-1 font-mono text-sm text-blue-600 dark:text-blue-400">
                                {campaign.data.templateID}
                              </div>
                            </div>
                            <div>
                              <Label className="text-gray-500">Content Type</Label>
                              <Badge 
                                variant="outline" 
                                className="mt-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300"
                              >
                                {campaign.data.type}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* CTA Details */}
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                          <div className="space-y-4">
                            <div>
                              <Label className="text-gray-500">Call to Action</Label>
                              <div className="mt-1">
                                {campaign.data.ctaUrl ? (
                                  <motion.div 
                                    whileHover={{ scale: 1.02 }}
                                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                                  >
                                    <Link className="h-4 w-4" />
                                    <span>{campaign.data.ctaUrl}</span>
                                  </motion.div>
                                ) : (
                                  <span className="text-gray-400">No CTA configured</span>
                                )}
                              </div>
                            </div>
                            <div>
                              <Label className="text-gray-500">Dynamic Parameters</Label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {campaign.data.params.map((param, index) => (
                                  <motion.div
                                    key={index}
                                    whileHover={{ scale: 1.05 }}
                                  >
                                    <Badge variant="secondary" className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300">
                                      {param}
                                    </Badge>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </CardContent>

              <CardFooter className="px-6 py-4 border-t bg-gray-50 dark:bg-gray-800/50">
                <motion.div
                  className="flex items-center justify-between w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Created {format(new Date(campaign.createdAt), 'MMM dd, yyyy HH:mm')}
                  </div>
                  <Button 
                    variant="destructive" 
                    onClick={handleDelete}
                    className="shadow-lg shadow-red-100 dark:shadow-red-900/20 hover:scale-[1.02] transition-transform"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Campaign
                  </Button>
                </motion.div>
              </CardFooter>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  )
}