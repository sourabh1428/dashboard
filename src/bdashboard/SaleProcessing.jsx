import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Command, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Calendar, 
  Clock, 
  Loader2, 
  UserPlus, 
  Phone, 
  Mail, 
  ShoppingCart, 
  Search, 
  CheckCircle2,
  XCircle,
  ReceiptText,
  History,
  User,
  Plus,
  Edit,
  Save,
  Scan,
  ArrowLeft,
  ArrowRight,
  ChevronRight
} from "lucide-react";
import { ProductSelection } from "./ProductSelection";
import { CurrentSale } from "./CurrentSale";
import ProductScanner from "./ProductScanner";
import { getApiKey } from "@/configApi";
import { SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function Billing({ updateInventory, settings }) {
  const [customer, setCustomer] = useState({ name: "", mobile: "", email: "" });
  const [originalCustomer, setOriginalCustomer] = useState(null);
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userEvents, setUserEvents] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [currentStep, setCurrentStep] = useState("customer");
  const [showScanner, setShowScanner] = useState(false);
  const suggestionRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL;

  // Progress steps
  const steps = [
    { id: "customer", label: "Customer", icon: User },
    { id: "products", label: "Products", icon: ShoppingCart },
    { id: "checkout", label: "Checkout", icon: ReceiptText }
  ];

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingProducts(true);
      try {
        const storedProducts = JSON.parse(localStorage.getItem("products")) || [];
        setProducts(storedProducts);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const fetchUserEvents = async () => {
      if (!originalCustomer?.mmid) return;
      setIsLoadingEvents(true);
      try {
        const response = await fetch(`${API_URL}/events/userEvents?mmid=${originalCustomer.mmid}`, {
          method: "GET",
          headers: {
            "x-api-key": getApiKey(),
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch user events");
        }
        const events = await response.json();
        setUserEvents(events.data || []);
      } catch (error) {
        console.error("Error fetching user events:", error);
        setUserEvents([]);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchUserEvents();
  }, [originalCustomer?.mmid, API_URL]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const query = [customer.mobile, customer.email, customer.name].join(" ").trim();
      setSearchQuery(query);
    }, 300);
    return () => clearTimeout(handler);
  }, [customer.mobile, customer.email, customer.name]);

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery) {
        setFilteredUsers([]);
        setShowSuggestions(false);
        setIsSearching(false);
        return;
      }
    
      setIsSearching(true);
      try {
        const response = await fetch(
          `${API_URL}/users/cache?key=${encodeURIComponent(searchQuery)}`,
          {
            headers: {
              "x-api-key": getApiKey(),
              "Content-Type": "application/json"
            },
            method: "GET"
          }
        );
    
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
    
        const data = await response.json();

        let users = [];
        
        if (Array.isArray(data)) {
          data.forEach(chunk => {
            if (typeof chunk === 'string') {
              try {
                const parsedChunk = JSON.parse(chunk);
                if (Array.isArray(parsedChunk)) {
                  users = users.concat(parsedChunk);
                } else {
                  users.push(parsedChunk);
                }
              } catch (error) {
                console.error("Error parsing chunk:", error);
              }
            } else if (Array.isArray(chunk)) {
              users = users.concat(chunk);
            }
          });
        } else {
          console.error("Unexpected data format from API:", data);
        }
        
        const results = users.filter(user => {
          const searchLower = searchQuery.toLowerCase();
          return (
            (user.name && user.name.toLowerCase().includes(searchLower)) ||
            (user.mobile_number && user.mobile_number.includes(searchQuery)) ||
            (user.email && user.email.toLowerCase().includes(searchLower))
          );
        });
    
        setFilteredUsers(results.slice(0, 50));
        setShowSuggestions(results.length > 0);
      } catch (error) {
        console.error("Error searching users:", error);
        setFilteredUsers([]);
      } finally {
        setIsSearching(false);
      }
    };

    searchUsers();
  }, [searchQuery, API_URL]);

  const hasChanges = useMemo(() => {
    if (!originalCustomer) return false;
    return (
      customer.name !== originalCustomer.name ||
      customer.mobile !== originalCustomer.mobile_number ||
      customer.email !== originalCustomer.email
    );
  }, [customer, originalCustomer]);

  const handleInputChange = useCallback((field, value) => {
    setCustomer((prev) => ({ ...prev, [field]: value }));
    setShowSuggestions(true);
  }, []);

  const handleSelectUser = useCallback((user) => {
    setCustomer({
      name: user.name || "",
      mobile: user.mobile_number || "",
      email: user.email || "",
    });
    setOriginalCustomer(user);
    setShowSuggestions(false);
    setErrorMessage("");
    setUserEvents([]);
    setCurrentStep("products");
  }, []);

  const handleScannedProduct = useCallback((product) => {
    setCart(prevCart => [...prevCart, product]);
    setShowScanner(false);
    setCurrentStep("checkout");
  }, []);

  const updateUserAttributes = async () => {
    if (!originalCustomer?.mmid) return;
    
    const updates = [];
    if (customer.name !== originalCustomer.name) {
      updates.push({
        mmid: originalCustomer.mmid,
        attributeName: "name",
        attributeValue: customer.name,
      });
    }
    if (customer.mobile !== originalCustomer.mobile_number) {
      updates.push({
        mmid: originalCustomer.mmid,
        attributeName: "mobile_number",
        attributeValue: customer.mobile,
      });
    }
    if (customer.email !== originalCustomer.email) {
      updates.push({
        mmid: originalCustomer.mmid,
        attributeName: "email",
        attributeValue: customer.email,
      });
    }

    if (updates.length === 0) return true;

    try {
      const updatePromises = updates.map((update) =>
        fetch(`${API_URL}/users/user/attribute`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": getApiKey(),
          },
          body: JSON.stringify(update),
        })
      );
      
      const responses = await Promise.all(updatePromises);
      for (const response of responses) {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update user attribute");
        }
      }

      const updatedUser = {
        ...originalCustomer,
        name: customer.name,
        mobile_number: customer.mobile,
        email: customer.email,
      };
      setOriginalCustomer(updatedUser);
      setErrorMessage("");
      return true;
    } catch (error) {
      console.error("Error updating user:", error);
      setErrorMessage(error.message || "Failed to update user");
      return false;
    }
  };

  const createUser = async () => {
    if (!customer.mobile && !customer.email) {
      setErrorMessage("Please provide a mobile number or email to create a new customer");
      return;
    }

    setIsCreatingUser(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${API_URL}/users/createUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": getApiKey(),
        },
        body: JSON.stringify({
          name: customer.name,
          mobile_number: customer.mobile,
          email: customer.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create user");
      }

      const newUser = await response.json();
      setOriginalCustomer(newUser);
      setCurrentStep("products");
    } catch (error) {
      console.error("Error creating user:", error);
      setErrorMessage(error.message || "Failed to create user");
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleClickOutside = useCallback((event) => {
    if (
      suggestionRef.current &&
      !suggestionRef.current.contains(event.target)
    ) {
      setShowSuggestions(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStepStatus = (stepId) => {
    if (stepId === "customer") {
      return originalCustomer ? "complete" : "current";
    }
    if (stepId === "products") {
      if (currentStep === "customer") return "pending";
      return cart.length > 0 ? "complete" : "current";
    }
    if (stepId === "checkout") {
      if (currentStep === "customer" || currentStep === "products") return "pending";
      return "current";
    }
    return "pending";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <SheetHeader className="px-6 py-4 border-b">
        <div className="flex justify-between items-center">
          <SheetTitle className="text-xl">New Invoice</SheetTitle>
          <SheetClose className="rounded-full p-2 hover:bg-secondary">
            <XCircle className="h-5 w-5" />
          </SheetClose>
        </div>
      </SheetHeader>

      {/* Progress indicator */}
      <div className="px-6 py-4 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            const StepIcon = step.icon;
            
            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => {
                    // Only allow going back or to completed steps
                    if (status === "complete" || 
                        (index === 0) || 
                        (index === 1 && originalCustomer) ||
                        (index === 2 && cart.length > 0)) {
                      setCurrentStep(step.id);
                    }
                  }}
                  disabled={status === "pending"}
                  className="flex flex-col items-center space-y-1.5 relative"
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    transition-all duration-200
                    ${status === "complete" ? "bg-primary text-primary-foreground" : 
                      status === "current" ? "bg-primary/10 text-primary border border-primary" : 
                      "bg-muted text-muted-foreground"}
                  `}>
                    {status === "complete" ? <CheckCircle2 className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                  </div>
                  <span className={`text-xs font-medium ${
                    status === "complete" ? "text-primary" : 
                    status === "current" ? "text-foreground" : 
                    "text-muted-foreground"
                  }`}>
                    {step.label}
                  </span>
                </button>
                
                {index < steps.length - 1 && (
                  <div className={`w-full max-w-[60px] h-[2px] ${
                    getStepStatus(steps[index + 1].id) === "pending" ? 
                      "bg-muted" : "bg-primary"
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Customer selection step */}
        {currentStep === "customer" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Name</label>
                <div className="relative">
                  <Input
                    id="name"
                    placeholder="Customer Name"
                    value={customer.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="pl-9"
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="mobile" className="text-sm font-medium">Mobile</label>
                <div className="relative">
                  <Input
                    id="mobile"
                    placeholder="Mobile Number"
                    value={customer.mobile}
                    onChange={(e) => handleInputChange("mobile", e.target.value)}
                    className="pl-9"
                  />
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Input
                    id="email"
                    placeholder="Email Address"
                    value={customer.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-9"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Customer suggestions dropdown */}
            {showSuggestions && (
              <div
                ref={suggestionRef}
                className="relative z-10 mt-1 w-full bg-white rounded-md shadow-lg border"
              >
                <Command className="rounded-lg border shadow-md">
                  <CommandList>
                    {isSearching ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : filteredUsers.length > 0 ? (
                      <ScrollArea className="h-72">
                        {filteredUsers.map((user) => (
                          <CommandItem
                            key={user.mmid}
                            onSelect={() => handleSelectUser(user)}
                            className="flex items-center py-3 px-4 cursor-pointer hover:bg-muted"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="font-medium">{user.name || 'No Name'}</span>
                                <div className="flex text-xs text-muted-foreground gap-3">
                                  {user.mobile_number && (
                                    <span className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {user.mobile_number}
                                    </span>
                                  )}
                                  {user.email && (
                                    <span className="flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {user.email}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </ScrollArea>
                    ) : (
                      <CommandEmpty className="py-6 text-center text-sm">
                        No customers found. Enter details to create a new customer.
                      </CommandEmpty>
                    )}
                  </CommandList>
                </Command>
              </div>
            )}

            {/* Error messages */}
            {errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {/* Purchase history for existing customers */}
            {originalCustomer && (
              <div className="mt-4 space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <History className="h-4 w-4" />
                      Recent Purchase History
                    </h3>
                  </div>
                  
                  <div className="border rounded-md">
                    {isLoadingEvents ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : userEvents.length > 0 ? (
                      <div className="divide-y">
                        {userEvents.slice(0, 3).map((event, index) => (
                          <div key={index} className="p-3 hover:bg-muted/50">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{event.eventName}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(event.time || event.date)}
                                </p>
                              </div>
                              {event.event?.amount && (
                                <Badge variant="outline">
                                  ${event.event.amount.toFixed(2)}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-muted-foreground">
                        No purchase history available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Products selection step */}
        {currentStep === "products" && (
          <div className="grid md:grid-cols-5 gap-4 h-full">
            <div className="md:col-span-3 overflow-hidden flex flex-col">
              <ProductSelection
                products={products}
                setCart={setCart}
                showScanner={showScanner}
                setShowScanner={setShowScanner}
              />
            </div>
            <div className="md:col-span-2">
              <CurrentSale
                setCustomer={setCustomer}
                userId={originalCustomer?.mmid || ""}
                userInfo={customer}
                cart={cart}
                setCart={setCart}
                setUserEvents={setUserEvents}
                settings={settings}
              />
            </div>
          </div>
        )}

        {/* Checkout step */}
        {currentStep === "checkout" && (
          <div className="grid md:grid-cols-5 gap-4 h-full">
            <div className="md:col-span-3 overflow-hidden">
              <CustomerProfile
                customer={originalCustomer}
                events={userEvents}
                isLoadingEvents={isLoadingEvents}
              />
            </div>
            <div className="md:col-span-2">
              <CurrentSale
                setCustomer={setCustomer}
                userId={originalCustomer?.mmid || ""}
                userInfo={customer}
                cart={cart}
                setCart={setCart}
                setUserEvents={setUserEvents}
                settings={settings}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer with action buttons */}
      <div className="border-t px-6 py-4 bg-muted/30 flex items-center justify-between">
        {currentStep === "customer" ? (
          <div className="flex w-full justify-between">
            <div></div>
            {originalCustomer ? (
              <div className="flex gap-3">
                {hasChanges && (
                  <Button onClick={updateUserAttributes} variant="outline" className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                )}
                <Button 
                  onClick={() => setCurrentStep("products")} 
                  className="gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  Continue to Products
                </Button>
              </div>
            ) : (
              <Button 
                onClick={createUser} 
                disabled={isCreatingUser || (!customer.name && !customer.mobile && !customer.email)} 
                className="gap-2 ml-auto"
              >
                {isCreatingUser ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                Create New Customer
              </Button>
            )}
          </div>
        ) : currentStep === "products" ? (
          <div className="flex w-full justify-between">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep("customer")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Customer
            </Button>
            <Button 
              onClick={() => setCurrentStep("checkout")} 
              disabled={cart.length === 0}
              className="gap-2"
            >
              <ArrowRight className="h-4 w-4" />
              Proceed to Checkout
            </Button>
          </div>
        ) : (
          <div className="flex w-full justify-between">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep("products")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Billing;