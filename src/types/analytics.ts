// Analytics data types

// Common type for time periods
export type TimePeriod = 'daily' | 'weekly' | 'monthly';

// Sales Summary
export interface SalesSummary {
  totalRevenue: number;
  orderCount: number;
  totalTickets: number;
  soldTickets: number;
  conversionRate: number;
}

// Sales by Category
export interface CategorySales {
  categoryName: string;
  ticketsSold: number;
  revenue: number;
  percentageOfTotal: number;
}

export interface SalesByCategory {
  categories: CategorySales[];
  totalRevenue: number;
}

// Attendance Data
export interface EventAttendance {
  eventId: string;
  eventTitle: string;
  totalTickets: number;
  soldTickets: number;
  checkedInTickets: number;
  attendanceRate: number;
}

export interface AttendanceData {
  events: EventAttendance[];
  totalEvents: number;
  averageAttendanceRate: number;
}

// Revenue Analytics
export interface RevenuePoint {
  period: string;
  revenue: number;
}

export interface RevenueAnalytics {
  timeSeriesData: RevenuePoint[];
  totalRevenue: number;
  averageRevenue: number;
  growthRate: number;
}

// Capacity Utilization
export interface VenueUtilization {
  eventId: string;
  eventTitle: string;
  venueCapacity: number;
  ticketsSold: number;
  utilizationRate: number;
}

export interface CapacityUtilization {
  venues: VenueUtilization[];
  averageUtilizationRate: number;
}

// Payment Method Distribution
export interface PaymentMethodData {
  method: string;
  count: number;
  total: number;
  percentage: number;
}

export interface PaymentMethodDistribution {
  methods: PaymentMethodData[];
  totalPayments: number;
  totalAmount: number;
}

// Monthly Sales Targets
export interface MonthlySalesTarget {
  month: string;
  target: number;
  actual: number;
  percentageAchieved: number;
}

export interface MonthlySalesTargets {
  months: MonthlySalesTarget[];
  yearTotal: {
    target: number;
    actual: number;
    percentageAchieved: number;
  };
}

// Date range for filtering
export interface DateRange {
  startDate?: Date;
  endDate?: Date;
} 