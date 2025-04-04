import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  getSalesSummary,
  getSalesByCategory,
  getAttendanceData,
  getRevenueAnalytics,
  getCapacityUtilization,
  getPaymentMethodDistribution,
  getMonthlySalesTargets
} from "@/lib/actions/analytics.actions";
import { formatCurrency } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  BarChart,
  PieChart
} from "@/components/charts";
import { MonthlyTargetsCard } from '@/components/analytics/monthly-targets-card';
import { HelpCircle } from "lucide-react";

// Define user type
interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string;
  image?: string | null;
}

export const metadata: Metadata = {
  title: "Analytics | Event Manager",
  description: "View and analyze ticket sales and event performance"
};

export const dynamic = 'force-dynamic';

// Skeleton for summary cards
function SummaryCardSkeleton() {
  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-4 w-32" />
      </CardContent>
    </Card>
  );
}

// Empty state component
function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center px-4 border rounded-md bg-muted/20">
      <HelpCircle className="h-12 w-12 text-muted-foreground mb-3" />
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      <p className="text-muted-foreground max-w-md">{message}</p>
    </div>
  );
}

// Loading component for summary cards
function SummaryCardsLoading() {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      <SummaryCardSkeleton />
      <SummaryCardSkeleton />
      <SummaryCardSkeleton />
      <SummaryCardSkeleton />
    </div>
  );
}

// Suspense-wrapped analytics content component
async function AnalyticsContent() {
  // Fetch analytics data
  const salesSummary = await getSalesSummary();
  const salesByCategory = await getSalesByCategory();
  const attendanceData = await getAttendanceData();
  const revenueAnalytics = await getRevenueAnalytics('monthly', {
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31')
  });
  const capacityData = await getCapacityUtilization();
  const paymentMethods = await getPaymentMethodDistribution();
  const monthlySalesTargets = await getMonthlySalesTargets();
  
  const categoryChartData = salesByCategory.categories.map(category => ({
    name: category.categoryName,
    value: category.revenue
  }));

  const attendanceChartData = attendanceData.events.map(event => ({
    name: event.eventTitle,
    total: event.totalTickets,
    sold: event.soldTickets,
    checkedIn: event.checkedInTickets
  }));

  const revenueChartData = revenueAnalytics.timeSeriesData.map(item => ({
    name: item.period,
    revenue: item.revenue
  }));

  const capacityChartData = capacityData.venues.map(venue => ({
    name: venue.eventTitle,
    capacity: venue.venueCapacity,
    sold: venue.ticketsSold,
    utilization: venue.utilizationRate
  }));

  const paymentChartData = paymentMethods.methods.map(method => ({
    name: method.method,
    value: method.total
  }));

  const monthlySalesChartData = monthlySalesTargets.months.map(month => ({
    name: month.month,
    target: month.target,
    actual: month.actual
  }));

  // Check if data is empty
  const hasSalesCategories = salesByCategory.categories.length > 0;
  const hasAttendanceData = attendanceData.events.length > 0;
  const hasRevenueData = revenueAnalytics.timeSeriesData.length > 0;
  const hasCapacityData = capacityData.venues.length > 0;
  const hasPaymentData = paymentMethods.methods.length > 0;

  return (
    <>
      {/* Sales summary cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(salesSummary.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {salesSummary.orderCount} orders
            </p>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesSummary.soldTickets}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(salesSummary.conversionRate)}% ticket conversion rate
            </p>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(attendanceData.averageAttendanceRate)}%
            </div>
            <p className="text-xs text-muted-foreground">Average check-in rate</p>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Capacity Utilization</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(capacityData.averageUtilizationRate)}%
            </div>
            <p className="text-xs text-muted-foreground">Average venue capacity filled</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabbed analytics sections */}
      <Tabs defaultValue="sales" className="w-full space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-3xl">
          <TabsTrigger value="sales">Sales Reports</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="capacity">Capacity</TabsTrigger>
        </TabsList>
        
        {/* Sales Reports Tab */}
        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>
                  Ticket sales distribution across different categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hasSalesCategories ? (
                  <PieChart
                    data={categoryChartData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    height={280}
                  />
                ) : (
                  <EmptyState 
                    title="No sales data available" 
                    message="There are no ticket sales or categories to display. Start selling tickets to see your sales distribution."
                  />
                )}
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Monthly Sales vs Targets</CardTitle>
                <CardDescription>
                  Performance against monthly targets
                </CardDescription>
              </CardHeader>
              <CardContent>
                {monthlySalesChartData.some(data => data.actual > 0 || data.target > 0) ? (
                  <BarChart
                    data={monthlySalesChartData}
                    categories={["target", "actual"]}
                    colors={["#3B82F6", "#10B981"]}
                    index="name"
                    height={280}
                  />
                ) : (
                  <EmptyState 
                    title="No sales targets data" 
                    message="Set monthly sales targets to track your performance against actual sales."
                  />
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Monthly Targets Card */}
          <MonthlyTargetsCard
            months={monthlySalesTargets.months}
            yearTotal={monthlySalesTargets.yearTotal}
            selectedYear={new Date().getFullYear()}
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
              <CardDescription>
                Detailed breakdown of sales and revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasSalesCategories ? (
                <div className="rounded-md border">
                  <div className="grid grid-cols-4 p-4 text-xs font-medium">
                    <div>Category</div>
                    <div className="text-right">Tickets Sold</div>
                    <div className="text-right">Revenue</div>
                    <div className="text-right">% of Total</div>
                  </div>
                  <div className="divide-y">
                    {salesByCategory.categories.map((category, i) => (
                      <div key={i} className="grid grid-cols-4 p-4 text-sm">
                        <div>{category.categoryName}</div>
                        <div className="text-right">{category.ticketsSold}</div>
                        <div className="text-right">{formatCurrency(category.revenue)}</div>
                        <div className="text-right">
                          <Badge variant={
                            category.percentageOfTotal > 30 ? "default" :
                            category.percentageOfTotal > 15 ? "secondary" : "outline"
                          }>
                            {Math.round(category.percentageOfTotal)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState 
                  title="No category sales data" 
                  message="There are no ticket sales to display. Start selling tickets to see your sales data by category."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance by Event</CardTitle>
              <CardDescription>
                Sold vs checked-in tickets per event
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasAttendanceData ? (
                <BarChart
                  data={attendanceChartData}
                  categories={["sold", "checkedIn"]}
                  colors={["#3B82F6", "#10B981"]}
                  index="name"
                  height={350}
                />
              ) : (
                <EmptyState 
                  title="No attendance data available" 
                  message="There are no events with attendance data to display. Check-in attendees at your events to see attendance statistics."
                />
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Event Attendance Details</CardTitle>
              <CardDescription>
                Detailed attendance statistics by event
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasAttendanceData ? (
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 p-4 text-xs font-medium">
                    <div>Event</div>
                    <div className="text-right">Total Tickets</div>
                    <div className="text-right">Sold</div>
                    <div className="text-right">Checked In</div>
                    <div className="text-right">Attendance Rate</div>
                  </div>
                  <div className="divide-y">
                    {attendanceData.events.map((event, i) => (
                      <div key={i} className="grid grid-cols-5 p-4 text-sm">
                        <div className="truncate">{event.eventTitle}</div>
                        <div className="text-right">{event.totalTickets}</div>
                        <div className="text-right">{event.soldTickets}</div>
                        <div className="text-right">{event.checkedInTickets}</div>
                        <div className="text-right">
                          <Badge variant={
                            event.attendanceRate > 80 ? "default" :
                            event.attendanceRate > 50 ? "secondary" : "destructive"
                          }>
                            {Math.round(event.attendanceRate)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState 
                  title="No attendance details" 
                  message="There are no events with attendance data to display. Check-in attendees at your events to see attendance details."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>
                Revenue over time {hasRevenueData && revenueAnalytics.growthRate > 0 ? 
                  `(${Math.round(revenueAnalytics.growthRate)}% growth)` : 
                  hasRevenueData ? `(${Math.abs(Math.round(revenueAnalytics.growthRate))}% decline)` : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasRevenueData ? (
                <LineChart
                  data={revenueChartData}
                  categories={["revenue"]}
                  colors={["#10B981"]}
                  index="name"
                  height={350}
                />
              ) : (
                <EmptyState 
                  title="No revenue data available" 
                  message="There is no revenue data to display. Complete orders will appear in your revenue trends."
                />
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Distribution by payment type
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center items-center">
                {hasPaymentData ? (
                  <PieChart
                    data={paymentChartData}
                    dataKey="value"
                    nameKey="name"
                    height={280}
                    colors={["#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981"]}
                  />
                ) : (
                  <EmptyState 
                    title="No payment data" 
                    message="There is no payment method data to display. Completed payments will appear in this chart."
                  />
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>
                  Breakdown by payment method
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hasPaymentData ? (
                  <div className="rounded-md border">
                    <div className="grid grid-cols-4 p-4 text-xs font-medium">
                      <div>Method</div>
                      <div className="text-right">Count</div>
                      <div className="text-right">Total</div>
                      <div className="text-right">Percentage</div>
                    </div>
                    <div className="divide-y">
                      {paymentMethods.methods.map((method, i) => (
                        <div key={i} className="grid grid-cols-4 p-4 text-sm">
                          <div>{method.method}</div>
                          <div className="text-right">{method.count}</div>
                          <div className="text-right">{formatCurrency(method.total)}</div>
                          <div className="text-right">{Math.round(method.percentage)}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <EmptyState 
                    title="No payment details" 
                    message="There is no payment data to display. Completed payments will appear in this breakdown."
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Capacity Tab */}
        <TabsContent value="capacity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Venue Capacity Utilization</CardTitle>
              <CardDescription>
                Capacity vs. actual attendance by venue
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasCapacityData ? (
                <BarChart
                  data={capacityChartData}
                  categories={["capacity", "sold"]}
                  colors={["#3B82F6", "#10B981"]}
                  index="name"
                  height={350}
                />
              ) : (
                <EmptyState 
                  title="No capacity data available" 
                  message="There are no events with venue capacity data to display. Create events with venues to see capacity utilization."
                />
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Venue Utilization Details</CardTitle>
              <CardDescription>
                Detailed capacity statistics by venue
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasCapacityData ? (
                <div className="rounded-md border">
                  <div className="grid grid-cols-4 p-4 text-xs font-medium">
                    <div>Event</div>
                    <div className="text-right">Venue Capacity</div>
                    <div className="text-right">Tickets Sold</div>
                    <div className="text-right">Utilization Rate</div>
                  </div>
                  <div className="divide-y">
                    {capacityData.venues.map((venue, i) => (
                      <div key={i} className="grid grid-cols-4 p-4 text-sm">
                        <div className="truncate">{venue.eventTitle}</div>
                        <div className="text-right">{venue.venueCapacity}</div>
                        <div className="text-right">{venue.ticketsSold}</div>
                        <div className="text-right">
                          <Badge variant={
                            venue.utilizationRate > 90 ? "default" :
                            venue.utilizationRate > 60 ? "secondary" : "outline"
                          }>
                            {Math.round(venue.utilizationRate)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState 
                  title="No venue utilization details" 
                  message="There are no events with venue capacity data to display. Create events with venues to see venue utilization details."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

export default async function AnalyticsPage() {
  // Check authorization
  const session = await auth();
  
  if (!session) {
    redirect('/sign-in');
  }

  // Verify admin or manager role
  const user = session.user as User;
  if (user.role !== 'admin' && user.role !== 'manager') {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p>You don&apos;t have permission to access this page.</p>
      </div>
    );
  }
  
  return (
    <div className="container py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Track ticket sales, revenue, and event performance.
          </p>
        </div>
      </div>
      
      <Suspense fallback={<SummaryCardsLoading />}>
        <AnalyticsContent />
      </Suspense>
    </div>
  );
} 