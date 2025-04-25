"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { jwtDecode } from "jwt-decode"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CampaignControls } from "@/Campaigns/CampaignControl"
import { getApiKey } from "@/configApi"

export default function AllCampaign() {
  const [campaigns, setCampaigns] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const navigate = useNavigate()

  // Check if token is expired using jwtDecode
  const isTokenExpired = () => {
    const token = localStorage.getItem("token")
    if (!token) return true
    try {
      const decodedToken = jwtDecode(token)
      return decodedToken.exp < Date.now() / 1000
    } catch (error) {
      console.error("Invalid token:", error)
      return true
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    navigate("/signin")
  }

  // Check token expiration on mount and every minute
  useEffect(() => {
    if (isTokenExpired()) {
      logout()
    }
    const checkTokenInterval = setInterval(() => {
      if (isTokenExpired()) {
        logout()
      }
    }, 60000)
    return () => clearInterval(checkTokenInterval)
  }, [isTokenExpired, logout]) // Added dependencies

  // Fetch all campaigns from the API endpoint
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true)
        const response = await axios.get("http://localhost:8080/campaigns/getAllCampaign", {
          headers: { "x-api-key": getApiKey() },
        })
        // Set campaigns (assuming response.data is an array)
        setCampaigns(response.data)
      } catch (error) {
        console.error("Error fetching campaigns:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCampaigns()
  }, [])

  // Filter campaigns based on the search term (by campaign name)
  const filteredCampaigns = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return campaigns.filter((campaign) => campaign.name?.toLowerCase().includes(term))
  }, [campaigns, searchTerm])

  // Handle row click to navigate to campaign detail page
  const handleRowClick = useCallback(
    (campaignId) => {
      navigate(`/campaign/${campaignId}`)
    },
    [navigate],
  )

  const handleCreateCampaign = (type) => {
    // Here you would typically navigate to a new page or open a more detailed form
    console.log(`Creating ${type} campaign`)
    setIsCreateDialogOpen(false)
    // For demonstration, let's navigate to a hypothetical create page
    if(type=='Email'){
      console.log(type);
      
      navigate("/Createemail");
      return;
    }
    navigate("createWhatsapp")
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Create Campaign Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button>Create Campaign</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
          </DialogHeader>
          <div className="flex justify-around mt-4">
            <Button onClick={() => handleCreateCampaign("WhatsApp")}>Create WhatsApp Campaign</Button>
            <Button onClick={() => handleCreateCampaign("Email")}>Create Email Campaign</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Campaign Controls (search, sort, etc.) */}
      <CampaignControls
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortOrder={"desc"}
        setSortOrder={() => {}}
        selectedStatus={"all"}
        setSelectedStatus={() => {}}
      />

      {/* Campaign Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">All Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.length > 0 ? (
                  filteredCampaigns.map((campaign) => (
                    <TableRow
                      key={campaign._id}
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleRowClick(campaign._id)}
                    >
                      <TableCell>{campaign.name}</TableCell>
                      <TableCell>{campaign.description}</TableCell>
                      <TableCell>{campaign.channel}</TableCell>
                      <TableCell>{new Date(campaign.createdAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No campaigns found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

