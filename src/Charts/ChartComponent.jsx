import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, Bar, ResponsiveContainer } from 'recharts';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getApiKey } from '@/configApi';

const ChartComponent = ({ eventName }) => {
  const [eventData, setEventData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('line');

  useEffect(() => {
    const fetchEventData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/events/getEvents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': getApiKey() },
          body: JSON.stringify({ eName: eventName }),
        });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        setEventData(data.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEventData();
  }, [eventName]);

  const processData = () => {
    return eventData.reduce((acc, event) => {
      const date = new Date(event.EventTime * 1000).toLocaleDateString('en-GB');
      if (date) acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
  };

  const chartData = Object.entries(processData()).map(([date, count]) => ({ date, count }));

  return (
    <Card className="bg-background">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{eventName}</CardTitle>
        <div className="flex items-center space-x-2">
          <Switch
            id={`chart-type-${eventName}`}
            checked={chartType === 'bar'}
            onCheckedChange={() => setChartType(chartType === 'line' ? 'bar' : 'line')}
          />
          <Label htmlFor={`chart-type-${eventName}`}>
            {chartType === 'line' ? 'Line Chart' : 'Bar Chart'}
          </Label>
        </div>
      </CardHeader>
      <CardContent className="h-[300px]">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-[250px] w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default ChartComponent;