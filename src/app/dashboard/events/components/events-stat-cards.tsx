"use server";

import { events } from "@/db/schema";
import { count, eq, and, gte } from "drizzle-orm";
import { CalendarIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { Card, CardContent,  CardHeader, CardTitle } from "@/components/ui/card";
import db from "@/db/drizzle";

export default async function EventsStatCards() {
  const publishedCount = await db
    .select({ count: count() })
    .from(events)
    .where(eq(events.status, "published"));
    
  const draftCount = await db
    .select({ count: count() })
    .from(events)
    .where(eq(events.status, "draft"));
    
  const cancelledCount = await db
    .select({ count: count() })
    .from(events)
    .where(eq(events.status, "cancelled"));
    
  const totalCount = await db
    .select({ count: count() })
    .from(events);
    
  const now = new Date();
  const upcomingCount = await db
    .select({ count: count() })
    .from(events)
    .where(
      and(
        eq(events.status, "published"),
        gte(events.startDate, now)
      )
    );
    
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5 mt-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCount[0].count}</div>
          <p className="text-xs text-muted-foreground">
            All events in the system
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Published</CardTitle>
          <CheckCircleIcon className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{publishedCount[0].count}</div>
          <p className="text-xs text-muted-foreground">
            Live events visible to the public
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
          <CalendarIcon className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{upcomingCount[0].count}</div>
          <p className="text-xs text-muted-foreground">
            Future events with dates after today
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Drafts</CardTitle>
          <ClockIcon className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{draftCount[0].count}</div>
          <p className="text-xs text-muted-foreground">
            Events not yet published
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
          <XCircleIcon className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{cancelledCount[0].count}</div>
          <p className="text-xs text-muted-foreground">
            Events that have been cancelled
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 