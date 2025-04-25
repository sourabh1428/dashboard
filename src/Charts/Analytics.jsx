import React from 'react';
import ChartComponent from './ChartComponent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Analytics = () => {
  const eventNames = ["Product Purchase"];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Events</TabsTrigger>
          {eventNames.map((name, index) => (
            <TabsTrigger key={index} value={name}>{name}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventNames.map((name, index) => (
              <ChartComponent key={index} eventName={name} />
            ))}
          </div>
        </TabsContent>
        {eventNames.map((name, index) => (
          <TabsContent key={index} value={name}>
            <Card className="w-full">
              <CardContent>
                <ChartComponent eventName={name} />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Analytics;