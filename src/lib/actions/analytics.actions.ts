'use server';

import { auth } from "@/auth";
import db from "@/db/drizzle";
import { eq, and, gte, lte, count, sql, desc, asc, SQL } from "drizzle-orm";
import { tickets, events, ticketCategories, orders, payments, venues, salesTargets } from "@/db/schema";
import {
  TimePeriod,
  SalesSummary,
  SalesByCategory,
  AttendanceData,
  RevenueAnalytics,
  CapacityUtilization,
  PaymentMethodDistribution,
  MonthlySalesTargets,
  DateRange,
  MonthlyTarget
} from "@/types/analytics";
import { revalidatePath } from "next/cache";

// Define User type with role property
interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: 'admin' | 'manager' | 'user' | 'security';
}

/**
 * Check authorization for analytics access
 */
async function checkAnalyticsPermission() {
  const session = await auth();
  if (!session) {
    return false;
  }

  // Only admin and manager roles can access analytics
  const user = session.user as User;
  return user.role === 'admin' || user.role === 'manager';
}

/**
 * Get total sales and revenue stats
 */
export async function getSalesSummary(dateRange?: DateRange): Promise<SalesSummary> {
  const hasPermission = await checkAnalyticsPermission();
  if (!hasPermission) {
    throw new Error('Unauthorized: You do not have permission to access analytics');
  }

  try {
    // Prepare date condition
    const dateConditions: SQL<unknown>[] = [];
    if (dateRange?.startDate) {
      dateConditions.push(gte(orders.orderDate, dateRange.startDate));
    }
    if (dateRange?.endDate) {
      dateConditions.push(lte(orders.orderDate, dateRange.endDate));
    }

    // Get total revenue from completed orders
    const revenueQuery = db.select({
      totalRevenue: sql<string>`COALESCE(SUM(${orders.total}::numeric), 0)`.as('total_revenue'),
      orderCount: count(orders.id).as('order_count'),
    })
    .from(orders)
    .where(and(
      eq(orders.status, 'completed'),
      ...dateConditions
    ));

    // Get total tickets sold
    const ticketsDateConditions: SQL<unknown>[] = [];
    if (dateRange?.startDate) {
      ticketsDateConditions.push(gte(tickets.createdAt, dateRange.startDate));
    }
    if (dateRange?.endDate) {
      ticketsDateConditions.push(lte(tickets.createdAt, dateRange.endDate));
    }
    
    const ticketsQuery = db.select({
      totalTickets: count().as('total_tickets'),
      soldTickets: sql<number>`SUM(CASE WHEN ${tickets.status} = 'sold' THEN 1 ELSE 0 END)`.as('sold_tickets'),
    })
    .from(tickets)
    .where(ticketsDateConditions.length > 0 ? and(...ticketsDateConditions) : undefined);

    // Run queries in parallel
    const [revenueResult, ticketsResult] = await Promise.all([revenueQuery, ticketsQuery]);

    const orderCount = revenueResult[0]?.orderCount || 0;
    const totalRevenue = parseFloat(revenueResult[0]?.totalRevenue || '0');
    const totalTickets = ticketsResult[0]?.totalTickets || 0;
    const soldTickets = ticketsResult[0]?.soldTickets || 0;
    
    const conversionRate = totalTickets > 0 
      ? (soldTickets / totalTickets) * 100 
      : 0;

    return {
      totalRevenue,
      orderCount,
      totalTickets,
      soldTickets,
      conversionRate
    };
  } catch (error) {
    console.error('Error fetching sales summary:', error);
    throw new Error('Failed to fetch sales summary');
  }
}

/**
 * Get sales data by category with revenue breakdown
 */
export async function getSalesByCategory(dateRange?: DateRange): Promise<SalesByCategory> {
  const hasPermission = await checkAnalyticsPermission();
  if (!hasPermission) {
    throw new Error('Unauthorized: You do not have permission to access analytics');
  }

  try {
    // Prepare date condition
    const dateConditions: SQL<unknown>[] = [eq(tickets.status, 'sold')];
    if (dateRange?.startDate) {
      dateConditions.push(gte(tickets.createdAt, dateRange.startDate));
    }
    if (dateRange?.endDate) {
      dateConditions.push(lte(tickets.createdAt, dateRange.endDate));
    }

    const query = db.select({
      categoryId: ticketCategories.id,
      categoryName: ticketCategories.name,
      ticketsSold: count(tickets.id).as('tickets_sold'),
      revenue: sql<string>`COALESCE(SUM(${tickets.price}::numeric), 0)`.as('revenue'),
      isVIP: ticketCategories.isVIP,
      isEarlyBird: ticketCategories.isEarlyBird,
    })
    .from(tickets)
    .innerJoin(ticketCategories, eq(tickets.ticketCategoryId, ticketCategories.id))
    .where(and(...dateConditions))
    .groupBy(ticketCategories.id, ticketCategories.name, ticketCategories.isVIP, ticketCategories.isEarlyBird)
    .orderBy(desc(sql<string>`COALESCE(SUM(${tickets.price}::numeric), 0)`));

    const result = await query;

    const totalRevenue = result.reduce((sum, item) => sum + (parseFloat(item.revenue) || 0), 0);
    
    const categories = result.map(item => ({
      categoryName: item.categoryName || "Unknown",
      ticketsSold: Number(item.ticketsSold) || 0,
      revenue: Number(item.revenue) || 0,
      percentageOfTotal: totalRevenue > 0 
        ? ((Number(item.revenue) || 0) / totalRevenue) * 100 
        : 0
    }));

    return {
      categories,
      totalRevenue
    };
  } catch (error) {
    console.error('Error fetching sales by category:', error);
    throw new Error('Failed to fetch sales by category');
  }
}

/**
 * Get attendance data for events
 */
export async function getAttendanceData(eventId?: string): Promise<AttendanceData> {
  const hasPermission = await checkAnalyticsPermission();
  if (!hasPermission) {
    throw new Error('Unauthorized: You do not have permission to access analytics');
  }

  try {
    const baseQuery = db.select({
      eventId: events.id,
      eventTitle: events.title,
      startDate: events.startDate,
      endDate: events.endDate,
      totalTickets: count().as('total_tickets'),
      soldTickets: sql<number>`SUM(CASE WHEN ${tickets.status} = 'sold' THEN 1 ELSE 0 END)`.as('sold_tickets'),
      checkedInTickets: sql<number>`SUM(CASE WHEN ${tickets.isCheckedIn} = true THEN 1 ELSE 0 END)`.as('checked_in_tickets'),
    })
    .from(events)
    .leftJoin(tickets, eq(events.id, tickets.eventId))
    .groupBy(events.id, events.title, events.startDate, events.endDate)
    .orderBy(desc(events.startDate));
    
    // Conditionally apply event filter
    const query = eventId 
      ? baseQuery.where(eq(events.id, Number(eventId))) 
      : baseQuery;

    const results = await query;

    // Map the results to the proper type 
    const eventsData = results.map(event => ({
      eventId: String(event.eventId), // Convert to string to match interface
      eventTitle: event.eventTitle,
      totalTickets: Number(event.totalTickets),
      soldTickets: Number(event.soldTickets),
      checkedInTickets: Number(event.checkedInTickets),
      attendanceRate: Number(event.soldTickets) > 0 
        ? (Number(event.checkedInTickets) / Number(event.soldTickets)) * 100 
        : 0,
    }));
    
    // Calculate the average attendance rate
    const totalEvents = eventsData.length;
    const sumAttendanceRates = eventsData.reduce(
      (sum, event) => sum + event.attendanceRate, 0
    );
    
    const averageAttendanceRate = totalEvents > 0 
      ? sumAttendanceRates / totalEvents 
      : 0;
    
    return {
      events: eventsData,
      totalEvents,
      averageAttendanceRate
    };
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    throw new Error('Failed to fetch attendance data');
  }
}

/**
 * Get revenue analytics with trends over time
 */
export async function getRevenueAnalytics(
  period: TimePeriod = 'monthly', 
  dateRange?: DateRange
): Promise<RevenueAnalytics> {
  const hasPermission = await checkAnalyticsPermission();
  if (!hasPermission) {
    throw new Error('Unauthorized: You do not have permission to access analytics');
  }

  try {
    // Define time grouping based on period
    let timeGroup;
    if (period === 'daily') {
      timeGroup = sql`DATE(${orders.orderDate})`;
    } else if (period === 'weekly') {
      timeGroup = sql`DATE_TRUNC('week', ${orders.orderDate})`;
    } else {
      timeGroup = sql`DATE_TRUNC('month', ${orders.orderDate})`;
    }

    // Prepare date conditions
    const dateConditions: SQL<unknown>[] = [eq(orders.status, 'completed')];
    if (dateRange?.startDate) {
      dateConditions.push(gte(orders.orderDate, dateRange.startDate));
    }
    if (dateRange?.endDate) {
      dateConditions.push(lte(orders.orderDate, dateRange.endDate));
    }

    const query = db.select({
      period: timeGroup.as('time_period'),
      revenue: sql<string>`COALESCE(SUM(${orders.total}::numeric), 0)`.as('revenue'),
      orderCount: count(orders.id).as('order_count'),
    })
    .from(orders)
    .where(and(...dateConditions))
    .groupBy(timeGroup)
    .orderBy(asc(timeGroup));

    const results = await query;

    // Transform results to match the expected type
    const timeSeriesData = results.map(item => ({
      period: item.period instanceof Date 
        ? item.period.toISOString().split('T')[0] 
        : String(item.period),
      revenue: parseFloat(item.revenue),
    }));

    const totalRevenue = timeSeriesData.reduce(
      (sum, dataPoint) => sum + dataPoint.revenue, 0
    );
    
    const averageRevenue = timeSeriesData.length > 0 
      ? totalRevenue / timeSeriesData.length 
      : 0;
    
    // Calculate growth rate (simple comparison between first and last period)
    let growthRate = 0;
    if (timeSeriesData.length >= 2) {
      const firstRevenue = timeSeriesData[0].revenue;
      const lastRevenue = timeSeriesData[timeSeriesData.length - 1].revenue;
      
      if (firstRevenue > 0) {
        growthRate = ((lastRevenue - firstRevenue) / firstRevenue) * 100;
      }
    }

    return {
      timeSeriesData,
      totalRevenue,
      averageRevenue,
      growthRate
    };
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    throw new Error('Failed to fetch revenue analytics');
  }
}

/**
 * Get venue capacity utilization data
 */
export async function getCapacityUtilization(eventId?: number): Promise<CapacityUtilization> {
  const hasPermission = await checkAnalyticsPermission();
  if (!hasPermission) {
    throw new Error('Unauthorized: You do not have permission to access analytics');
  }

  try {
    // Define the query result type
    type VenueQueryResult = {
      eventId: number;
      eventTitle: string;
      eventDate: Date;
      venueId: number | null;
      venueName: string | null;
      capacity: number | null;
      maxTickets: number | null;
      soldTickets: number;
    };

    // Prepare base query with proper type annotation
    const baseQuery = db.select({
      eventId: events.id,
      eventTitle: events.title,
      eventDate: events.startDate,
      venueId: venues.id,
      venueName: venues.name,
      capacity: venues.capacity,
      maxTickets: events.maxTickets,
      soldTickets: sql<number>`SUM(CASE WHEN ${tickets.status} = 'sold' THEN 1 ELSE 0 END)`.as('sold_tickets'),
    })
    .from(events)
    .leftJoin(venues, eq(events.venueId, venues.id))
    .leftJoin(tickets, eq(events.id, tickets.eventId))
    .groupBy(events.id, events.title, events.startDate, venues.id, venues.name, venues.capacity)
    .orderBy(desc(events.startDate));

    // Conditionally apply event filter with proper type annotation
    const query = eventId
      ? baseQuery.where(eq(events.id, eventId))
      : baseQuery;

    const results = await query;

    // Define venue data type for the mapped result
    type VenueData = {
      eventId: string;
      eventTitle: string;
      venueCapacity: number;
      ticketsSold: number;
      utilizationRate: number;
    };

    // Transform results to match expected type - renamed to venueData to avoid collision
    const venueData: VenueData[] = results.map((event: VenueQueryResult) => {
      // Use max tickets if available, otherwise use venue capacity
      const venueCapacity = Number(event.maxTickets) || Number(event.capacity) || 0;
      const ticketsSold = Number(event.soldTickets) || 0;
      
      return {
        eventId: String(event.eventId), // Convert to string to match interface
        eventTitle: event.eventTitle,
        venueCapacity,
        ticketsSold,
        utilizationRate: venueCapacity > 0 
          ? (ticketsSold / venueCapacity) * 100 
          : 0,
      };
    });
    
    // Calculate average utilization rate
    const totalEvents = venueData.length;
    const sumUtilizationRates = venueData.reduce(
      (sum: number, venue: VenueData) => sum + venue.utilizationRate, 0
    );
    
    const averageUtilizationRate = totalEvents > 0 
      ? sumUtilizationRates / totalEvents 
      : 0;

    return {
      venues: venueData,
      averageUtilizationRate
    };
  } catch (error) {
    console.error('Error fetching capacity utilization:', error);
    throw new Error('Failed to fetch capacity utilization');
  }
}

/**
 * Get payment method distribution data
 */
export async function getPaymentMethodDistribution(dateRange?: DateRange): Promise<PaymentMethodDistribution> {
  const hasPermission = await checkAnalyticsPermission();
  if (!hasPermission) {
    throw new Error('Unauthorized: You do not have permission to access analytics');
  }

  try {
    // Prepare date conditions
    const dateConditions: SQL<unknown>[] = [eq(payments.status, 'completed')];
    if (dateRange?.startDate) {
      dateConditions.push(gte(payments.createdAt, dateRange.startDate));
    }
    if (dateRange?.endDate) {
      dateConditions.push(lte(payments.createdAt, dateRange.endDate));
    }

    const query = db.select({
      method: payments.method,
      count: count(payments.id).as('count'),
      total: sql<string>`COALESCE(SUM(${payments.amount}::numeric), 0)`.as('total'),
    })
    .from(payments)
    .where(and(...dateConditions))
    .groupBy(payments.method);

    const results = await query;

    const totalAmount = results.reduce(
      (sum, item) => sum + (parseFloat(item.total) || 0), 0
    );
    
    const totalPayments = results.reduce(
      (sum, item) => sum + (Number(item.count) || 0), 0
    );
    
    const methods = results.map(item => ({
      method: item.method || "Unknown",
      count: Number(item.count) || 0,
      total: Number(item.total) || 0,
      percentage: totalPayments > 0 
        ? ((Number(item.count) || 0) / totalPayments) * 100 
        : 0
    }));

    return {
      methods,
      totalPayments,
      totalAmount
    };
  } catch (error) {
    console.error('Error fetching payment method distribution:', error);
    throw new Error('Failed to fetch payment method distribution');
  }
}

/**
 * Get monthly sales targets and actuals
 */
export async function getMonthlySalesTargets(year: number = new Date().getFullYear()): Promise<MonthlySalesTargets> {
  const hasPermission = await checkAnalyticsPermission();
  if (!hasPermission) {
    throw new Error('Unauthorized: You do not have permission to access analytics');
  }

  try {
    const startDate = new Date(year, 0, 1); // January 1st of the year
    const endDate = new Date(year, 11, 31); // December 31st of the year
    
    // Get actual sales by month
    const actualsQuery = db.select({
      month: sql`DATE_TRUNC('month', ${orders.orderDate})::date`,
      actual: sql<number>`COALESCE(SUM(${orders.total}::int), 0)`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.status, "completed"),
        gte(orders.orderDate, startDate),
        lte(orders.orderDate, endDate)
      )
    )
    .groupBy(sql`DATE_TRUNC('month', ${orders.orderDate})::date`)
    .orderBy(sql`DATE_TRUNC('month', ${orders.orderDate})::date`);
    
    // Get custom targets from the salesTargets table
    const targetsQuery = db.select({
      month: salesTargets.month,
      target: salesTargets.target,
    })
    .from(salesTargets)
    .where(eq(salesTargets.year, year))
    .orderBy(asc(salesTargets.month));
    
    // Execute both queries in parallel
    const [actualsResults, targetsResults] = await Promise.all([actualsQuery, targetsQuery]);
    
    // Map month number to target amount
    const targetsByMonth = new Map<number, number>();
    targetsResults.forEach(target => {
      targetsByMonth.set(target.month, Number(target.target));
    });
    
    // Map month to actual sales
    const actualByMonth = new Map<number, number>();
    actualsResults.forEach(item => {
      if (item.month instanceof Date) {
        const date = item.month;
        const monthIndex = date.getMonth();
        actualByMonth.set(monthIndex, Number(item.actual) || 0);
      }
    });
    
    // Generate monthly data with targets
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Default seasonal factors as fallback if no target is set
    const seasonalFactors = [
      0.7, 0.8, 1.0, 1.1, 1.2, 1.5, // Jan-Jun
      1.5, 1.4, 1.2, 1.0, 1.3, 1.5  // Jul-Dec
    ];
    
    const baseTarget = 25000; // Base monthly target for fallback
    
    const months = monthNames.map((monthName, index) => {
      const actual = actualByMonth.get(index) || 0;
      
      // Use custom target if set, otherwise calculate a default
      const target = targetsByMonth.has(index + 1) 
        ? targetsByMonth.get(index + 1) || 0
        : Math.round(baseTarget * seasonalFactors[index]);
      
      return {
        month: monthName,
        target,
        actual,
        percentageAchieved: target > 0 ? (actual / target) * 100 : 0
      };
    });
    
    // Calculate year totals
    const yearTotal = {
      target: months.reduce((sum, month) => sum + month.target, 0),
      actual: months.reduce((sum, month) => sum + month.actual, 0),
      percentageAchieved: 0
    };
    
    yearTotal.percentageAchieved = yearTotal.target > 0 
      ? (yearTotal.actual / yearTotal.target) * 100 
      : 0;
    
    return {
      months,
      yearTotal
    };
  } catch (error) {
    console.error("Error in getMonthlySalesTargets:", error);
    throw new Error("Failed to fetch monthly sales targets");
  }
}

/**
 * Set a monthly sales target
 */
export async function setMonthlySalesTarget({
  year,
  month,
  target
}: {
  year: number;
  month: number; // 1-12 for January-December
  target: number;
}): Promise<{ success: boolean }> {
  const hasPermission = await checkAnalyticsPermission();
  if (!hasPermission) {
    throw new Error('Unauthorized: You do not have permission to set sales targets');
  }

  if (month < 1 || month > 12) {
    throw new Error('Invalid month value. Must be between 1-12.');
  }
  
  if (target < 0) {
    throw new Error('Target value cannot be negative.');
  }

  try {
    const session = await auth();
    const user = session?.user as User;
    
    // Check if a target for this year/month already exists
    const existingTarget = await db.select()
      .from(salesTargets)
      .where(and(
        eq(salesTargets.year, year),
        eq(salesTargets.month, month)
      ))
      .limit(1);
    
    if (existingTarget.length > 0) {
      // Update existing target
      await db.update(salesTargets)
        .set({
          target: target.toString(),
          updatedAt: new Date(),
          createdById: user.id
        })
        .where(and(
          eq(salesTargets.year, year),
          eq(salesTargets.month, month)
        ));
    } else {
      // Create new target
      await db.insert(salesTargets)
        .values({
          year,
          month,
          target: target.toString(),
          createdById: user.id,
          createdAt: new Date(),
          updatedAt: new Date()
        });
    }
    
    // Revalidate the dashboard page
    revalidatePath('/dashboard/analytics');
    
    return { success: true };
  } catch (error) {
    console.error("Error setting monthly sales target:", error);
    throw new Error("Failed to set monthly sales target");
  }
}

/**
 * Get all sales targets for a specific year
 */
export async function getYearlySalesTargets(year: number): Promise<MonthlyTarget[]> {
  const hasPermission = await checkAnalyticsPermission();
  if (!hasPermission) {
    throw new Error('Unauthorized: You do not have permission to access sales targets');
  }

  try {
    const targets = await db.select({
      id: salesTargets.id,
      year: salesTargets.year,
      month: salesTargets.month,
      target: salesTargets.target,
    })
    .from(salesTargets)
    .where(eq(salesTargets.year, year))
    .orderBy(asc(salesTargets.month));
    
    return targets.map(target => ({
      month: target.month,
      target: Number(target.target)
    }));
  } catch (error) {
    console.error("Error fetching yearly sales targets:", error);
    throw new Error("Failed to fetch yearly sales targets");
  }
} 