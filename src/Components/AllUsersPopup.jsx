"use client"

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpRight } from "lucide-react";
import axios from "axios";
import { getApiKey } from "@/configApi";

const AllUsersPopup = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch sale events from the API
  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8080/events/getSale",
        { durationInDays: 30 }, // Send a fixed duration; adjust as needed.
        { headers: { "x-api-key": getApiKey() } }
      );
      // Assuming the response data is an array of sale objects
      setSales(response.data);
    } catch (error) {
      console.error("Error fetching sales:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []); // Run only once on mount

  // Filter sale events by eventName or MMID (case insensitive)
  const filteredSales = sales.filter(
    (sale) =>
      (sale.eventName && sale.eventName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sale.MMID && sale.MMID.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="ml-auto">
          View All Sales
          <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>All Sales</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="Search sales by event or MMID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>MMID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Product</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredSales.length > 0 ? (
                filteredSales.map((sale) => (
                  <TableRow key={sale.MMID || sale._id}>
                    <TableCell className="font-medium">{sale.eventName}</TableCell>
                    <TableCell>{sale.MMID}</TableCell>
                    <TableCell>
                      {sale.event && sale.event.amount ? `$${sale.event.amount}` : "N/A"}
                    </TableCell>
                    <TableCell>
                      {sale.event && sale.event.productNames && sale.event.productNames.length > 0
                        ? sale.event.productNames[0].title
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No sales found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AllUsersPopup;
