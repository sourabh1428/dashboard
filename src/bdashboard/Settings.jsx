import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, FileText, ArrowRight } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNavigate } from 'react-router-dom'

export function Settings({ settings, updateSettings, products }) {
  const [localSettings, setLocalSettings] = useState(settings)
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setLocalSettings({ ...localSettings, [name]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    updateSettings(localSettings)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="business" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="business">Business Settings</TabsTrigger>
          <TabsTrigger value="receipt">Receipt Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>Business Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="gstinNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    GSTIN Number
                  </label>
                  <Input
                    type="text"
                    id="gstinNumber"
                    name="gstinNumber"
                    value={localSettings.gstinNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="brandName" className="block text-sm font-medium text-gray-700 mb-1">
                    Brand Name
                  </label>
                  <Input
                    type="text"
                    id="brandName"
                    name="brandName"
                    value={localSettings.brandName}
                    onChange={handleInputChange}
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button type="submit" onClick={handleSubmit} className="flex gap-2 items-center">
                <Save className="h-4 w-4" />
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="receipt">
          <Card>
            <CardHeader>
              <CardTitle>Receipt Templates</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-10">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/60" />
              <h3 className="text-lg font-medium mb-2">Manage Receipt Templates</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Create and manage your receipt templates in our dedicated template editor.
              </p>
              <Button onClick={() => navigate('/invoicing/receipt-templates')} className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Go to Template Editor
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}