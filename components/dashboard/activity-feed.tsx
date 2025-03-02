'use client';

import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ClipboardList, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityFeedProps {
  organizationId: Id<'organizations'>;
  startDate?: number;
  endDate?: number;
  type?: 'all' | 'behaviors' | 'exams';
}

export function ActivityFeed({ 
  organizationId, 
  startDate, 
  endDate,
  type = 'all'
}: ActivityFeedProps) {
  const [limit] = useState(10);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Using any type with ESLint exception
  const [combinedActivity, setCombinedActivity] = useState<any[]>([]);

  // Fetch behaviors
  const behaviors = useQuery(
    api.behaviors.getByOrganization,
    type === 'exams' ? 'skip' : {
      organizationId,
      limit,
      cursor,
      startDate,
      endDate,
    }
  );

  // Fetch body exams
  const bodyExams = useQuery(
    api.bodyExams.getByOrganization,
    type === 'behaviors' ? 'skip' : {
      organizationId,
      limit,
      cursor,
      startDate,
      endDate,
    }
  );

  // Combine and sort activities
  useEffect(() => {
    if (!behaviors && !bodyExams) return;

    let combined: any[] = [];

    if (behaviors && type !== 'exams') {
      const behaviorItems = behaviors.page.map((item: any) => ({
        ...item,
        type: 'behavior',
      }));
      combined = [...combined, ...behaviorItems];
    }

    if (bodyExams && type !== 'behaviors') {
      const examItems = bodyExams.page.map((item: any) => ({
        ...item,
        type: 'bodyExam',
      }));
      combined = [...combined, ...examItems];
    }

    // Sort by createdAt in descending order
    combined.sort((a, b) => b.createdAt - a.createdAt);

    setCombinedActivity(combined);
  }, [behaviors, bodyExams, type]);

  // Load more function
  const loadMore = async () => {
    if ((!behaviors?.continueCursor && !bodyExams?.continueCursor) || isLoadingMore) return;
    
    setIsLoadingMore(true);
    
    // Use the earliest continue cursor
    if (behaviors?.continueCursor && bodyExams?.continueCursor) {
      setCursor(behaviors.continueCursor);
    } else if (behaviors?.continueCursor) {
      setCursor(behaviors.continueCursor);
    } else if (bodyExams?.continueCursor) {
      setCursor(bodyExams.continueCursor);
    }
    
    setIsLoadingMore(false);
  };

  // Loading state
  if (!behaviors && !bodyExams) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // No data state
  if (combinedActivity.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="rounded-full bg-muted p-3">
          <ClipboardList className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No activity found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          There are no records for the selected time period.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {combinedActivity.map((activity) => (
          <ActivityItem key={`${activity.type}-${activity._id}`} activity={activity} />
        ))}
      </div>
      
      {/* {(behaviors?.continueCursor || bodyExams?.continueCursor) && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load more'
            )}
          </Button>
        </div>
      )} */}
    </div>
  );
}

interface ActivityItemProps {
  activity: any;
}

function ActivityItem({ activity }: ActivityItemProps) {
  const animalId = activity.animalId as Id<'animals'>;
  const staffId = activity.staffId as Id<'staff'>;
  
  const animal = useQuery(api.animals.getById, { id: animalId });
  const staff = useQuery(api.staff.getById, { id: staffId });
  
  if (!animal || !staff) {
    return (
      <div className="flex items-start gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  const date = new Date(activity.createdAt);
  const formattedDate = format(date, 'MMM d, yyyy h:mm a');
  
  const staffInitials = staff.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="flex items-start gap-4">
      <Avatar className="h-10 w-10 border">
        <AvatarFallback>{staffInitials}</AvatarFallback>
      </Avatar>
      <div className="space-y-1">
        <p className="text-sm font-medium leading-none">
          <span className="font-semibold">{staff.name}</span> recorded{' '}
          {activity.type === 'behavior' ? (
            <>
              a <span className="font-medium">{activity.behavior}</span> behavior
            </>
          ) : (
            <>a body exam</>
          )}{' '}
          for <span className="font-medium">{animal.name}</span>
        </p>
        <div className="flex items-center text-xs text-muted-foreground">
          <span>{formattedDate}</span>
          <span className="mx-1">•</span>
          <span className={cn(
            "flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-medium",
            activity.type === 'behavior' 
              ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
              : "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
          )}>
            {activity.type === 'behavior' ? (
              <>
                <ClipboardList className="h-3 w-3" />
                Behavior
              </>
            ) : (
              <>
                <FileText className="h-3 w-3" />
                Body Exam
              </>
            )}
          </span>
        </div>
        {activity.description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {activity.description}
          </p>
        )}
        {activity.location && activity.type === 'behavior' && (
          <p className="mt-1 text-xs text-muted-foreground">
            Location: {activity.location}
          </p>
        )}
        {activity.diagnosis && activity.type === 'bodyExam' && (
          <p className="mt-1 text-sm">
            Diagnosis: {activity.diagnosis}
          </p>
        )}
        {activity.weight && activity.type === 'bodyExam' && (
          <p className="mt-1 text-xs text-muted-foreground">
            Weight: {activity.weight} kg
          </p>
        )}
      </div>
    </div>
  );
} 