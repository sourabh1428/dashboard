import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Loader2, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { format, parseISO } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Helper to get API key from localStorage
const getApiKey = () => {
  return localStorage.getItem('apiKey');
};

const StatusBadge = ({ status }) => {
  const getStatusIcon = () => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'read':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'sent':
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'read':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'sent':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium border ${getStatusColor()}`}>
      {getStatusIcon()}
      {status || 'Unknown'}
    </span>
  );
};

const WhatsAppStatusDashboard = () => {
  const [timeRange, setTimeRange] = useState('7');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch stats
        const statsResponse = await axios.get(`/dashboard/whatsapp/messages/stats?days=${timeRange}`, {
          headers: {
            'x-api-key': getApiKey(),
          },
        });

        // Fetch recent messages
        const messagesResponse = await axios.get(`/dashboard/whatsapp/messages/recent?page=${pagination.page}&limit=${pagination.limit}`, {
          headers: {
            'x-api-key': getApiKey(),
          },
        });

        setStats(statsResponse.data);
        setMessages(messagesResponse.data.messages);
        setPagination(messagesResponse.data.pagination);
      } catch (error) {
        console.error('Error fetching WhatsApp data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange, pagination.page, pagination.limit, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Prepare chart data
  const prepareStatusChartData = () => {
    if (!stats?.statusCounts) return null;

    const statusColors = {
      sent: 'rgba(245, 158, 11, 0.7)',
      delivered: 'rgba(16, 185, 129, 0.7)',
      read: 'rgba(59, 130, 246, 0.7)',
      failed: 'rgba(239, 68, 68, 0.7)',
    };

    const labels = Object.keys(stats.statusCounts);
    const data = labels.map(label => stats.statusCounts[label]);
    const backgroundColor = labels.map(label => statusColors[label] || 'rgba(156, 163, 175, 0.7)');

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor,
          borderColor: backgroundColor.map(color => color.replace('0.7', '1')),
          borderWidth: 1,
        },
      ],
    };
  };

  const prepareDailyChartData = () => {
    if (!stats?.dailyCounts || stats.dailyCounts.length === 0) return null;

    const labels = stats.dailyCounts.map(item => format(parseISO(item._id), 'MMM d'));
    
    return {
      labels,
      datasets: [
        {
          label: 'Sent',
          data: stats.dailyCounts.map(item => item.sent),
          backgroundColor: 'rgba(245, 158, 11, 0.7)',
          borderColor: 'rgb(245, 158, 11)',
          borderWidth: 1,
        },
        {
          label: 'Delivered',
          data: stats.dailyCounts.map(item => item.delivered),
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 1,
        },
        {
          label: 'Read',
          data: stats.dailyCounts.map(item => item.read),
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
        },
        {
          label: 'Failed',
          data: stats.dailyCounts.map(item => item.failed),
          backgroundColor: 'rgba(239, 68, 68, 0.7)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 1,
        },
      ],
    };
  };

  const formatTime = seconds => {
    if (!seconds && seconds !== 0) return 'N/A';
    if (seconds < 60) return `${Math.round(seconds)} sec`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes} min ${remainingSeconds} sec`;
  };

  const renderSummaryCards = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              Object.values(stats?.statusCounts || {}).reduce((sum, count) => sum + count, 0)
            )}
          </div>
          <p className="text-xs text-muted-foreground">Last {timeRange} days</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              (() => {
                const delivered = stats?.statusCounts?.delivered || 0;
                const total = Object.values(stats?.statusCounts || {}).reduce((sum, count) => sum + count, 0);
                return total ? `${Math.round((delivered / total) * 100)}%` : 'N/A';
              })()
            )}
          </div>
          <p className="text-xs text-muted-foreground">Messages successfully delivered</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Read Rate</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              (() => {
                const read = stats?.statusCounts?.read || 0;
                const total = Object.values(stats?.statusCounts || {}).reduce((sum, count) => sum + count, 0);
                return total ? `${Math.round((read / total) * 100)}%` : 'N/A';
              })()
            )}
          </div>
          <p className="text-xs text-muted-foreground">Messages that were read</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Avg. Delivery Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              formatTime(stats?.deliveryMetrics?.avgDeliveryTime)
            )}
          </div>
          <p className="text-xs text-muted-foreground">Average time to deliver</p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">WhatsApp Message Status</h2>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 24 hours</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading && !stats ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {renderSummaryCards()}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Message Status Distribution</CardTitle>
                <CardDescription>Breakdown by delivery status</CardDescription>
              </CardHeader>
              <CardContent>
                {prepareStatusChartData() ? (
                  <div className="h-64">
                    <Pie data={prepareStatusChartData()} options={{ maintainAspectRatio: false }} />
                  </div>
                ) : (
                  <div className="flex h-64 items-center justify-center">
                    <p className="text-sm text-muted-foreground">No data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Message Activity</CardTitle>
                <CardDescription>Message counts by day</CardDescription>
              </CardHeader>
              <CardContent>
                {prepareDailyChartData() ? (
                  <div className="h-64">
                    <Bar
                      data={prepareDailyChartData()}
                      options={{
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                          },
                        },
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex h-64 items-center justify-center">
                    <p className="text-sm text-muted-foreground">No data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
              <CardDescription>Latest WhatsApp message delivery status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Template</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent At</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivered At</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {messages.length > 0 ? (
                      messages.map((message) => (
                        <tr key={message._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{message.recipient}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{message.templateId}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={message.status} />
                            {message.failedReason && (
                              <p className="text-xs text-red-500 mt-1">{message.failedReason}</p>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {message.sentAt ? format(new Date(message.sentAt), 'MMM d, yyyy HH:mm:ss') : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {message.deliveredAt ? format(new Date(message.deliveredAt), 'MMM d, yyyy HH:mm:ss') : 'N/A'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                          No messages found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-500">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} messages
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === 1}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === pagination.pages}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default WhatsAppStatusDashboard; 