"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ArrowUpRight, BarChart3, Mail, Users, Calendar, Pause, Square, Trash2, Moon, Sun } from "lucide-react"
import { format, subDays, isBefore } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip as TooltipComponent, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"

const EmailCampaign = (startDate, endDate) => {
  let currentDate = new Date(startDate)
  const data = []
  while (isBefore(currentDate, endDate) || currentDate.getTime() === endDate.getTime()) {
    data.push({
      name: format(currentDate, "MMM dd"),
      opens: Math.floor(Math.random() * 500),
      clicks: Math.floor(Math.random() * 300),
    })
    currentDate.setDate(currentDate.getDate() + 1)
  }
  return data
}

const iconVariants = {
  initial: { scale: 1, y: 0 },
  hover: { scale: 1.2, y: -5, transition: { duration: 0.3, type: "spring", stiffness: 300 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function EnhancedCampaignAnalytics() {
  const [activeTab, setActiveTab] = useState("overview")
  const [timeFrame, setTimeFrame] = useState("month")
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [campaignStatus, setCampaignStatus] = useState("active")
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode)
  }, [isDarkMode])

  const getChartData = () => {
    if (dateRange.from && dateRange.to) {
      return EmailCampaign(dateRange.from, dateRange.to)
    }
    return []
  }

  const handleCampaignAction = (action) => {
    switch (action) {
      case "pause":
        setCampaignStatus("paused")
        break
      case "stop":
        setCampaignStatus("stopped")
        break
      case "delete":
        setCampaignStatus("deleted")
        break
      default:
        break
    }
  }

  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex-1 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-500">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            Summer Sale Campaign Analytics
          </h1>
          <div className="flex items-center space-x-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCampaignAction("pause")}
                    disabled={campaignStatus !== "active"}
                    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Pause Campaign</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCampaignAction("stop")}
                    disabled={campaignStatus === "stopped" || campaignStatus === "deleted"}
                    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Stop Campaign</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCampaignAction("delete")}
                    disabled={campaignStatus === "deleted"}
                    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete Campaign</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all duration-300">
              Export Report
            </Button>
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4" />
              <Switch
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
                className="data-[state=checked]:bg-gray-800 data-[state=unchecked]:bg-gray-200"
              />
              <Moon className="h-4 w-4" />
            </div>
          </div>
        </header>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 rounded-lg">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-md transition-all duration-200">Overview</TabsTrigger>
            <TabsTrigger value="engagement" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-md transition-all duration-200">Engagement</TabsTrigger>
            <TabsTrigger value="conversions" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-md transition-all duration-200">Conversions</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <AnimatePresence>
                {[ 
                  { title: "Total Sent", value: "10,482", change: "+20.1% from last month", icon: <Mail className="h-5 w-5" /> },
                  { title: "Open Rate", value: "24.8%", change: "+4.3% from last campaign", icon: <ArrowUpRight className="h-5 w-5" /> },
                  { title: "Click Rate", value: "12.5%", change: "+1.2% from last campaign", icon: <BarChart3 className="h-5 w-5" /> },
                  { title: "Conversion Rate", value: "3.2%", change: "+0.5% from last campaign", icon: <Users className="h-5 w-5" /> }
                ].map((item, index) => (
                  <motion.div key={item.title} variants={cardVariants} initial="hidden" animate="visible" exit="hidden">
                    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-hidden">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{item.title}</CardTitle>
                        <motion.div
                          variants={iconVariants}
                          initial="initial"
                          whileHover="hover"
                          className="text-blue-500 dark:text-blue-400"
                        >
                          {item.icon}
                        </motion.div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.change}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Email Performance</CardTitle>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <ToggleGroup type="single" value={timeFrame} onValueChange={(value) => value && setTimeFrame(value)} className="bg-gray-100 dark:bg-gray-700 p-1 rounded-md">
                      <ToggleGroupItem value="month" aria-label="Toggle month view" className="data-[state=on]:bg-white dark:data-[state=on]:bg-gray-600 data-[state=on]:text-blue-500 rounded px-3 py-1 text-sm">
                        Month
                      </ToggleGroupItem>
                      <ToggleGroupItem value="day" aria-label="Toggle day view" className="data-[state=on]:bg-white dark:data-[state=on]:bg-gray-600 data-[state=on]:text-blue-500 rounded px-3 py-1 text-sm">
                        Day
                      </ToggleGroupItem>
                      <ToggleGroupItem value="hour" aria-label="Toggle hour view" className="data-[state=on]:bg-white dark:data-[state=on]:bg-gray-600 data-[state=on]:text-blue-500 rounded px-3 py-1 text-sm">
                        Hour
                      </ToggleGroupItem>
                    </ToggleGroup>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-[240px] justify-start text-left font-normal bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <Calendar className="mr-2 h-4 w-4" />
                          {dateRange.from && dateRange.to ? (
                            <>
                              {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            <span>Pick a date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange.from}
                          selected={dateRange}
                          onSelect={(newDateRange) => {
                            if (newDateRange?.from) {
                              setDateRange({ from: newDateRange.from, to: newDateRange.to || newDateRange.from })
                            }
                          }}
                          numberOfMonths={2}
                          className="rounded-md border border-gray-200 dark:border-gray-700"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={getChartData()}>
                    <defs>
                      <linearGradient id="colorOpens" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                      labelStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151' }}
                      itemStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151' }}
                    />
                    <Bar dataKey="opens" fill="url(#colorOpens)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="clicks" fill="url(#colorClicks)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}