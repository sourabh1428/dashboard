"use client"

import React, { useState } from "react"
import Papa from "papaparse"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { UploadIcon } from 'lucide-react'
import { getApiKey } from "@/configApi"

const UserUpload = () => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [csvData, setCsvData] = useState([])
  const [columnMappings, setColumnMappings] = useState({})
    const[bunch,handleBunch]=useState('');


    function handleBunchChange(e){
        handleBunch(e.target.value);
    }


  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type === "text/csv") {
        setUploadedFile(file)
        parseCsvFile(file)
      } else {
        toast({
          title: "Error",
          description: "Only CSV files are allowed.",
          variant: "destructive",
        })
      }
    }
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex for email validation
  const parseCsvFile = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setCsvData(result.data)
        const initialMappings = {}
        result.meta.fields.forEach(field => {
          initialMappings[field] = ""
        })
        setColumnMappings(initialMappings)
      },
      error: (error) => {
        toast({
          title: "Error",
          description: "Error parsing CSV file: " + error.message,
          variant: "destructive",
        })
      },
    })
  }
  const handleUpload = async () => {
    if (!uploadedFile) return;
  
    setIsUploading(true);
  
    const badEmails = []; // List to store invalid emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email validation regex
    const throttleLimit = 10; // Limit the number of concurrent requests
  
    try {
      const validUsers = csvData
        .map((row) => {
          const email = row[columnMappings.email]; // Map the "email" column based on user's selection
          if (!emailRegex.test(email)) {
            badEmails.push(email); // Log invalid emails
            return null; // Skip further processing for this email
          }
          const name = email.split("@")[0]; // Extract name from email
          return { email, name, bunchID: bunch }; // Return valid user data
        })
        .filter(Boolean); // Filter out invalid emails (null entries)
  
      const batches = [];
      for (let i = 0; i < validUsers.length; i += throttleLimit) {
        batches.push(validUsers.slice(i, i + throttleLimit));
      }
  
      // Process each batch sequentially
      for (const batch of batches) {
        await Promise.all(
          batch.map(async (user) => {
            try {
              const response = await fetch("http://localhost:8080/postUser", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-api-key": getApiKey(),
                },
                body: JSON.stringify(user),
              });
  
              if (!response.ok) {
                throw new Error(`Failed to upload user: ${user.email}`);
              }
            } catch (error) {
              console.error(`Error uploading user ${user.email}:`, error);
            }
          })
        );
  
        // Add a delay between batches to avoid overwhelming the server
        await new Promise((resolve) => setTimeout(resolve, 500)); // Adjust delay as needed
      }
  
      if (badEmails.length > 0) {
        console.warn("Invalid emails found:", badEmails); // Log all invalid emails
      }
  
      // Create the bunch after all users are uploaded
      const bunchResponse = await fetch("http://localhost:8080/users/createBunch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": getApiKey(),
        },
        body: JSON.stringify({ bunchID: bunch }),
      });
  
      if (bunchResponse.ok) {
        console.log(`Bunch created successfully with ID: ${bunch}`);
      } else {
        throw new Error("Failed to create bunch.");
      }
    } catch (error) {
      console.error("Error during upload:", error);
    } finally {
      setIsUploading(false);
    }
  };
  
  

  const handleColumnMapping = (header, value) => {
    setColumnMappings(prev => ({ ...prev, [header]: value }))
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-center">Upload Users via CSV</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
      <input
           
            type="text"
            placeholder="Provide unique bunch name"
            onChange={handleBunchChange}
        
          />
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="csv-upload"
            className="cursor-pointer inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
          >
            <UploadIcon className="mr-2 h-4 w-4" />
            {uploadedFile ? uploadedFile.name : "Select CSV file"}
          </label>
        </div>

        {csvData.length > 0 && (
          <div className="border rounded-lg p-4 bg-background">
            <h2 className="text-lg font-semibold mb-2">Preview and Map Columns</h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(csvData[0]).map((header) => (
                      <TableHead key={header} className="min-w-[150px]">
                        <Select onValueChange={(value) => handleColumnMapping(header, value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Map to attribute" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">email</SelectItem>
                            <SelectItem value="name">mobile number</SelectItem>
                            <SelectItem value="role">name</SelectItem>
                            {/* Add more user attributes as needed */}
                          </SelectContent>
                        </Select>
                        <div className="mt-1 text-sm font-normal">{header}</div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvData.slice(0, 5).map((row, index) => (
                    <TableRow key={index}>
                      {Object.values(row).map((value, i) => (
                        <TableCell key={i}>{value}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!uploadedFile || isUploading}
          className="w-full"
        >
          {isUploading ? "Uploading..." : "Upload"}
        </Button>
      </CardContent>
    </Card>
  )
}

export default UserUpload

