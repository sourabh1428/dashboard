import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import axios from "axios"

import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Bell, 
  Search,
  BarChart3,
  Calendar,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Mail,
  MessageSquare,
  ChevronRight
} from "lucide-react"

import { getApiKey } from "@/configApi"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UserDetailsPopup from "./UserDetailsPopup"
import WhatsAppStatusDashboard from './Dashboard/WhatsAppStatusDashboard'

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, trend, description, color = "primary" }) => (
  <Card className="overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className={`p-2 rounded-full bg-${color}-500/10`}>
        <Icon className={`h-4 w-4 text-${color}-500`} />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-1 text-xs">
          {trend > 0 ? (
            <>
              <ArrowUpRight className="h-3 w-3 text-success" />
              <span className="text-success">+{trend.toFixed(1)}%</span>
            </>
          ) : trend < 0 ? (
            <>
              <ArrowDownRight className="h-3 w-3 text-destructive" />
              <span className="text-destructive">{trend.toFixed(1)}%</span>
            </>
          ) : (
            <span className="text-muted-foreground">0%</span>
          )}
          <span className="text-muted-foreground ml-1">{description}</span>
        </div>
      )}
    </CardContent>
  </Card>
)

// Activity Card Component
const ActivityCard = ({ title, icon: Icon, value, text, linkTo, linkText }) => (
  <Card className="hover-lift">
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-1">{title}</div>
          <div className="text-2xl font-bold mb-1">{value}</div>
          <div className="text-sm text-muted-foreground">{text}</div>
        </div>
        <div className="p-3 rounded-full bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      {linkTo && (
        <Link 
          to={linkTo} 
          className="inline-flex items-center gap-1 text-sm text-primary font-medium mt-4 hover:underline"
        >
          {linkText} <ChevronRight className="h-3 w-3" />
        </Link>
      )}
    </CardContent>
  </Card>
)

const Dashboard = () => {
  const [transactions, setTransactions] = useState([])
  const [loadingTx, setLoadingTx] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [daysBack, setDaysBack] = useState(30)
  const [error, setError] = useState(null)
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    averageOrderValue: 0,
    totalOrders: 0,
    uniqueCustomers: 0,
    revenueTrend: 0,
    totalProducts: 0,
    avgProductsPerOrder: 0,
    retentionRate: 0
  })

  const calculateMetrics = (sales) => {
    if (!Array.isArray(sales) || sales.length === 0) {
      return {
        totalRevenue: 0,
        averageOrderValue: 0,
        totalOrders: 0,
        uniqueCustomers: 0,
        revenueTrend: 0,
        totalProducts: 0,
        avgProductsPerOrder: 0,
        retentionRate: 0
      }
    }

    const totalRevenue = sales.reduce((sum, sale) => sum + (sale.event?.amount || 0), 0)
    const totalOrders = sales.length
    const uniqueCustomers = new Set(sales.map(sale => sale.MMID)).size
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Calculate total products and average products per order
    const totalProducts = sales.reduce((sum, sale) => 
      sum + (sale.event?.productNames?.length || 0), 0)
    const avgProductsPerOrder = totalOrders > 0 ? totalProducts / totalOrders : 0

    // Calculate previous period metrics for comparison
    const midPoint = Math.floor(sales.length / 2)
    const recentSales = sales.slice(0, midPoint)
    const previousSales = sales.slice(midPoint)
    
    const recentRevenue = recentSales.reduce((sum, sale) => sum + (sale.event?.amount || 0), 0)
    const previousRevenue = previousSales.reduce((sum, sale) => sum + (sale.event?.amount || 0), 0)
    const revenueTrend = previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0

    // Calculate retention rate
    const retentionRate = totalOrders > 0 ? (uniqueCustomers / totalOrders) * 100 : 0

    return {
      totalRevenue,
      averageOrderValue,
      totalOrders,
      uniqueCustomers,
      revenueTrend,
      totalProducts,
      avgProductsPerOrder,
      retentionRate
    }
  }

  const fetchTransactions = useCallback(async () => {
    try {
      setLoadingTx(true);
      setError(null);
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - daysBack);
  
      const saleResponse = await axios.post(
        "http://localhost:8080/events/getSale",
        {
          durationInDays: daysBack,
          startDate: startDate.toISOString().split('T')[0],
        },
        { headers: { "x-api-key": getApiKey() } },
      );
  
      const sales = saleResponse.data;
      const calculatedMetrics = calculateMetrics(sales);
      setMetrics(calculatedMetrics);
  
      const txData = await Promise.all(
        sales.map(async (sale) => {
          try {
            const userResponse = await axios.get(
              `http://localhost:8080/users/user/${sale.MMID}`, 
              { headers: { "x-api-key": getApiKey() } }
            );
            const user = userResponse.data;
            
            // Use sale.eventTime if available, otherwise use sale.date.
            // Fallback to current date/time if neither is provided.
            let saleDate = sale.eventTime ? new Date(sale.eventTime) : (sale.date ? new Date(sale.date) : new Date());
            // Format the date to include both date and time.
            const formattedDate = saleDate.toLocaleString();
  
            return {
              customer: user.name || "Unknown",
              email: user.email || "Unknown",
              mobile_number: user.mobile_number || "None",
              type: "Sale",
              status: sale.status || "Approved",
              date: formattedDate, // formatted date with time
              amount: sale.event?.amount ? `$${sale.event.amount.toFixed(2)}` : "$0.00",
              mmid: sale.MMID,
              products: sale.event?.productNames || []
            };
          } catch (error) {
            console.error("Error fetching user for MMID", sale.MMID, error);
            return null;
          }
        })
      );
  
      // Filter out any null transactions from failed user fetches.
      const transactions = txData.filter((tx) => tx !== null);
  
      // Sort transactions by date in descending order (latest first)
      const sortedTransactions = transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  
      // Only keep the latest transactions
      const latestTransactions = sortedTransactions.slice(0, 5);
  
      setTransactions(latestTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError("Failed to fetch transactions. Please try again later.");
    } finally {
      setLoadingTx(false);
    }
  }, [daysBack]);
  

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const formatCurrency = (value) => {
    return `$${value.toFixed(2)}`
  }

  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="messages">Message Status</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        {/* Overview tab content */}
        <TabsContent value="overview">
          <div className="flex flex-col min-h-screen">
            {/* Page header with title, description and time period selector */}
            <div className="container pb-12 animate-fade-in">
              <div className="grid gap-6">
                {/* Time selector */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => setDaysBack(7)}>7d</Button>
                    <Button size="sm" variant="outline" onClick={() => setDaysBack(30)}>30d</Button>
                    <Button size="sm" variant="outline" onClick={() => setDaysBack(90)}>90d</Button>
                  </div>
                </div>

                {/* Key Metrics - 4 cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    title="Total Revenue"
                    value={formatCurrency(metrics.totalRevenue)}
                    icon={DollarSign}
                    trend={metrics.revenueTrend}
                    description="from previous period"
                    color="primary"
                  />
                  <StatCard
                    title="Average Order"
                    value={formatCurrency(metrics.averageOrderValue)}
                    icon={ShoppingCart}
                    description={`From ${metrics.totalOrders} orders`}
                    color="brand"
                  />
                  <StatCard
                    title="Unique Customers"
                    value={metrics.uniqueCustomers}
                    icon={Users}
                    description={`${metrics.retentionRate.toFixed(1)}% retention`}
                    color="accent"
                  />
                  <StatCard
                    title="Total Orders"
                    value={metrics.totalOrders}
                    icon={Package}
                    trend={0}
                    description={`${metrics.avgProductsPerOrder.toFixed(1)} items/order`}
                    color="success"
                  />
                </div>

                {/* Activity Cards */}
                <div className="grid gap-6 md:grid-cols-3">
                  <ActivityCard
                    title="Total Emails Sent"
                    value="1,254"
                    text="Last 30 days"
                    icon={Mail}
                    linkTo="/EmailCampaign"
                    linkText="View email campaigns"
                  />
                  <ActivityCard
                    title="Email Open Rate"
                    value="38.5%"
                    text="2.5% above average"
                    icon={Eye}
                    linkTo="/analytics"
                    linkText="View analytics"
                  />
                  <ActivityCard
                    title="WhatsApp Messages"
                    value="367"
                    text="Last 30 days"
                    icon={MessageSquare}
                    linkTo="/createWhatsapp"
                    linkText="Manage WhatsApp"
                  />
                </div>

                {/* Recent Transactions Table */}
                <div className="mt-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle>Recent Transactions</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to="/allCampaign">View all <ArrowRight className="ml-1 h-4 w-4" /></Link>
                        </Button>
                      </div>
                      <CardDescription>Your latest customer purchases</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loadingTx ? (
                        <div className="space-y-3">
                          {Array(3).fill(0).map((_, i) => (
                            <div key={i} className="flex items-center space-x-4">
                              <Skeleton className="h-12 w-12 rounded-full" />
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-[250px]" />
                                <Skeleton className="h-4 w-[200px]" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : error ? (
                        <div className="py-6 text-center">
                          <p className="text-muted-foreground">{error}</p>
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={fetchTransactions}
                          >
                            Try Again
                          </Button>
                        </div>
                      ) : transactions.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Customer</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {transactions.map((tx, i) => (
                              <TableRow 
                                key={i}
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => setSelectedUser(tx)}
                              >
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback className="bg-primary/10 text-primary">
                                        {tx.customer.substring(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="font-medium">{tx.customer}</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <span className={`h-2 w-2 rounded-full ${
                                      tx.status === 'Approved' ? 'bg-success' : 
                                      tx.status === 'Pending' ? 'bg-warning' : 'bg-muted'
                                    }`} />
                                    {tx.status}
                                  </div>
                                </TableCell>
                                <TableCell>{tx.date}</TableCell>
                                <TableCell className="text-right font-medium">{tx.amount}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="py-8 text-center">
                          <p className="text-muted-foreground">No transactions found</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <Card className="col-span-1 md:col-span-3 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <h3 className="text-lg font-semibold">Ready to engage your audience?</h3>
                          <p className="text-muted-foreground">Create a new campaign to target your customers.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button asChild>
                            <Link to="/Createemail">
                              <Mail className="mr-2 h-4 w-4" />
                              Create Email Campaign
                            </Link>
                          </Button>
                          <Button variant="outline" asChild>
                            <Link to="/createWhatsapp">
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Create WhatsApp Campaign
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Campaigns tab content */}
        <TabsContent value="campaigns">
          {/* Existing campaigns content */}
        </TabsContent>

        {/* New Messages tab content */}
        <TabsContent value="messages">
          <WhatsAppStatusDashboard />
        </TabsContent>

        {/* Users tab content */}
        <TabsContent value="users">
          {/* Existing users content */}
        </TabsContent>
      </Tabs>

      {/* User Details Popup */}
      {selectedUser && (
        <UserDetailsPopup
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;




    