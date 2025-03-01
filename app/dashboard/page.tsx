'use client';

import { useSession } from 'next-auth/react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { useState } from 'react';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { addDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Id } from '@/convex/_generated/dataModel';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });

  const startDate = date?.from ? new Date(date.from).setHours(0, 0, 0, 0) : undefined;
  const endDate = date?.to ? new Date(date.to).setHours(23, 59, 59, 999) : undefined;

  const organizationId = session?.user?.organizationId;
  const organization = useQuery(api.organizations.getById, 
    organizationId ? { id: organizationId as Id<"organizations"> } : 'skip'
  );

  if (!organizationId || !organization) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <DateRangePicker value={date} onChange={setDate} />
      </div>

      <DashboardStats 
        organizationId={organizationId as Id<"organizations">} 
        startDate={startDate} 
        endDate={endDate} 
      />

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Activity</TabsTrigger>
          <TabsTrigger value="behaviors">Behaviors</TabsTrigger>
          <TabsTrigger value="exams">Body Exams</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                All recent activity across your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityFeed 
                organizationId={organizationId as Id<"organizations">} 
                startDate={startDate} 
                endDate={endDate}
                type="all"
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="behaviors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Behavior Records</CardTitle>
              <CardDescription>
                Recent behavior records across your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityFeed 
                organizationId={organizationId as Id<"organizations">} 
                startDate={startDate} 
                endDate={endDate}
                type="behaviors"
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="exams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Body Exam Records</CardTitle>
              <CardDescription>
                Recent body exam records across your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityFeed 
                organizationId={organizationId as Id<"organizations">} 
                startDate={startDate} 
                endDate={endDate}
                type="exams"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 