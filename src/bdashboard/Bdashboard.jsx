import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ProductManagement } from './ProductList';
import { InventoryManagement } from './InventoryManagement';
import { Settings } from './Settings';
import { Billing } from './SaleProcessing';
import ReceiptTemplateBuilder from './ReceiptTemplateBuilder';
import { 
  Package, 
  BarChart, 
  Settings as SettingsIcon, 
  DollarSign, 
  Menu,
  Plus,
  Search,
  Receipt,
  Loader2,
  FileText
} from 'lucide-react';
import axios from 'axios';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getApiKey } from '@/configApi';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

// Constants
const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_HEADERS = { "x-api-key": getApiKey() };
const CHUNK_SIZE = 1000;

export default function Dashboard() {
  // State management
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    gstinNumber: '',
    brandName: '',
    invoiceTemplate: ''
  });
  const [activeSheet, setActiveSheet] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [recentInvoices, setRecentInvoices] = useState([]);
  const navigate = useNavigate();

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    try {
      const response = await axios.get('https://fakestoreapi.com/products');
      const productsWithQuantity = response.data.map(product => ({
        ...product,
        quantity: 10,
      }));
      setProducts(productsWithQuantity);
      localStorage.setItem('products', JSON.stringify(productsWithQuantity));
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  }, []);

  // Cache users in Redis
  const cacheUsersInRedis = useCallback(async (users) => {
    try {
      console.log(`Caching ${users.length} users in Redis...`);
      
      // Define a smaller chunk size for better handling
      const SMALLER_CHUNK_SIZE = 100;
      
      // Split allUsers into smaller chunks
      const chunks = [];
      for (let i = 0; i < users.length; i += SMALLER_CHUNK_SIZE) {
        chunks.push(users.slice(i, i + SMALLER_CHUNK_SIZE));
      }
      
      console.log(`Split users into ${chunks.length} chunks of size ${SMALLER_CHUNK_SIZE}`);
      
      // Store total chunks count first
      await axios.post(
        `${API_BASE_URL}/users/cache`,
        { 
          key: `cache_info`, 
          users: JSON.stringify({
            totalChunks: chunks.length,
            totalUsers: users.length,
            timestamp: new Date().toISOString()
          })
        },
        { 
          headers: API_HEADERS,
          timeout: 10000 // 10 second timeout
        }
      );
      
      // Cache each chunk sequentially to avoid overwhelming the server
      for (let i = 0; i < chunks.length; i++) {
        try {
          console.log(`Caching chunk ${i+1}/${chunks.length}...`);
          await axios.post(
            `${API_BASE_URL}/users/cache`,
            { 
              key: `chunk_${i}`, 
              users: chunks[i] // Send the chunk directly, let the server stringify it
            },
            { 
              headers: API_HEADERS,
              timeout: 30000 // 30 second timeout per chunk
            }
          );
          console.log(`Chunk ${i+1}/${chunks.length} cached successfully`);
        } catch (chunkError) {
          console.error(`Error caching chunk ${i+1}:`, chunkError);
          // Continue with other chunks even if one fails
        }
      }
      
      console.log("All users cached in Redis successfully.");
    } catch (error) {
      console.error("Error in cacheUsersInRedis:", error);
      // Don't throw - we want to continue even if caching fails
      console.log("Continuing without caching users");
    }
  }, []);

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    try {
      console.log("Fetching users from API...");
      const response = await axios.get(
        `${API_BASE_URL}/users/bulk-users`,
        { 
          headers: API_HEADERS,
          validateStatus: function (status) {
            return status < 500; // Accept any status code less than 500
          }
        }
      );
      
      if (response.status === 401) {
        console.error("Authentication error: Invalid API key");
        setError("Authentication failed. Please check your API key or login again.");
        setUsers([]);
        return;
      }
      
      if (!response.data || !response.data.users) {
        console.error("Unexpected API response format:", response.data);
        setUsers([]);
        return;
      }
      
      const fetchedUsers = response.data.users;
      console.log(`Fetched ${fetchedUsers.length} users successfully`);
      setUsers(fetchedUsers);
      
      // Cache users in Redis
      await cacheUsersInRedis(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to fetch users. Please try again later.");
      setUsers([]);
    }
  }, [cacheUsersInRedis]);

  // Fetch recent invoices/purchase events
  useEffect(() => {
    const fetchRecentInvoices = async () => {
      try {
        console.log("Fetching recent invoices...");
        const response = await fetch(`${API_BASE_URL}/events/recentSales`, {
          method: 'GET',
          headers: API_HEADERS
        });
        
        if (response.status === 401) {
          console.error("Authentication error: Invalid API key");
          setRecentInvoices([]);
          return;
        }
        
        if (!response.ok) {
          console.error(`Error fetching invoices: ${response.status}`);
          setRecentInvoices([]);
          return;
        }
        
        const data = await response.json();
        if (!data || !data.data) {
          console.error("Unexpected API response format:", data);
          setRecentInvoices([]);
          return;
        }
        
        console.log(`Fetched ${data.data.length} recent invoices successfully`);
        setRecentInvoices(data.data || []);
      } catch (error) {
        console.error('Error fetching recent invoices:', error);
        setRecentInvoices([]);
      }
    };
    
    fetchRecentInvoices();
  }, []);

  // Load data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([fetchProducts(), fetchUsers()]);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [fetchProducts, fetchUsers]);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('dashboardSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Product management handlers
  const addProduct = useCallback((product) => {
    setProducts(prevProducts => {
      const newProducts = [...prevProducts, { ...product, id: Date.now() }];
      localStorage.setItem('products', JSON.stringify(newProducts));
      return newProducts;
    });
  }, []);

  const updateInventory = useCallback((productId, quantity) => {
    setProducts(prevProducts => {
      const newProducts = prevProducts.map(product =>
        product.id === productId 
          ? { ...product, quantity: Math.max(0, product.quantity - quantity) }
          : product
      );
      localStorage.setItem('products', JSON.stringify(newProducts));
      return newProducts;
    });
  }, []);

  // Settings management
  const updateSettings = useCallback((newSettings) => {
    setSettings(prevSettings => {
      const updatedSettings = { ...prevSettings, ...newSettings };
      localStorage.setItem('dashboardSettings', JSON.stringify(updatedSettings));
      return updatedSettings;
    });
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive">
          <AlertDescription>
            {error}. Please refresh the page or try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Main dashboard render
  return (
    <div className="min-h-screen glass-dark">
      {/* Modern header with search and action buttons */}
      <header className="sticky top-0 z-10 w-full bg-background/85 backdrop-blur-md border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">Invoicing</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative max-w-md w-full lg:w-80 hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search customers..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full bg-background/50"
                />
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/invoicing/receipt-templates')} 
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Receipt Templates</span>
              </Button>
              
              <Sheet onOpenChange={(open) => !open && setActiveSheet(null)}>
                <SheetTrigger asChild>
                  <Button onClick={() => setActiveSheet("billing")} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>New Invoice</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl p-0 overflow-y-auto">
                  <Billing
                    products={products}
                    updateInventory={updateInventory}
                    settings={settings}
                  />
                </SheetContent>
              </Sheet>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" onClick={() => setActiveSheet("settings")} className="rounded-full w-10 h-10 p-0">
                    <SettingsIcon className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <Settings settings={settings} updateSettings={updateSettings} products={products} />
                </SheetContent>
              </Sheet>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" onClick={() => setActiveSheet("products")} className="rounded-full w-10 h-10 p-0">
                    <Package className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <ProductManagement products={products} addProduct={addProduct} />
                </SheetContent>
              </Sheet>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" onClick={() => setActiveSheet("inventory")} className="rounded-full w-10 h-10 p-0">
                    <BarChart className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <InventoryManagement products={products} updateInventory={updateInventory} />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main content area - Recent invoices dashboard */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Recent Invoices</h2>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  <span>View All</span>
                </Button>
              </div>
              
              {recentInvoices.length > 0 ? (
                <div className="rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="p-3 text-left text-sm font-medium">Customer</th>
                        <th className="p-3 text-left text-sm font-medium">Date</th>
                        <th className="p-3 text-left text-sm font-medium">Amount</th>
                        <th className="p-3 text-left text-sm font-medium">Products</th>
                        <th className="p-3 text-left text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentInvoices.map((invoice, index) => (
                        <tr key={index} className="border-b border-muted/30 hover:bg-muted/20">
                          <td className="p-3">
                            <div className="flex flex-col">
                              <span className="font-medium">{invoice.customerName}</span>
                              <span className="text-sm text-muted-foreground">{invoice.customerPhone}</span>
                            </div>
                          </td>
                          <td className="p-3 text-sm">
                            {new Date(invoice.date).toLocaleDateString()}
                          </td>
                          <td className="p-3 font-medium">
                            ₹{invoice.event.amount.toFixed(2)}
                          </td>
                          <td className="p-3 text-sm">
                            {invoice.event.productNames.map(product => product.title).join(', ')}
                          </td>
                          <td className="p-3">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => window.open(invoice.event.receiptLink, '_blank')}
                            >
                              <Receipt className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-card/30 rounded-lg p-8 text-center">
                  <Receipt className="h-16 w-16 mx-auto mb-4 text-muted-foreground/60" />
                  <h3 className="text-lg font-medium mb-2">No invoices yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    Create your first invoice by clicking the "New Invoice" button above.
                  </p>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button onClick={() => setActiveSheet("billing")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Invoice
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl p-0 overflow-y-auto">
                      <Billing
                        products={products}
                        updateInventory={updateInventory}
                        settings={settings}
                      />
                    </SheetContent>
                  </Sheet>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}