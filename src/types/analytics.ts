
export type TimePeriod = 'daily' | 'weekly' | 'monthly';

export interface SalesSummary {
  totalRevenue: number;
  orderCount: number;
  totalTickets: number;
  soldTickets: number;
  conversionRate: number;
}

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

export interface MonthlyTarget {
  month: number; 
  target: number;
}

export interface DateRange {
  startDate?: Date;
  endDate?: Date;
} 