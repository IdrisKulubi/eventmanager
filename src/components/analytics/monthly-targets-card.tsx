'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TargetModal } from './target-modal';
import { formatCurrency } from '@/lib/utils';
import { RefreshCw, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getMonthlySalesTargets } from '@/lib/actions/analytics.actions';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface MonthData {
  month: string;
  target: number;
  actual: number;
  percentageAchieved: number;
}

interface YearTotal {
  target: number;
  actual: number;
  percentageAchieved: number;
}

interface MonthlyTargetsCardProps {
  months: MonthData[];
  yearTotal: YearTotal;
  selectedYear?: number;
}

// Map month name to JavaScript month index (0-11)
const monthNameToIndex: Record<string, number> = {
  'January': 0,
  'February': 1,
  'March': 2,
  'April': 3,
  'May': 4,
  'June': 5,
  'July': 6,
  'August': 7,
  'September': 8,
  'October': 9,
  'November': 10,
  'December': 11,
};

export function MonthlyTargetsCard({
  months: initialMonths,
  yearTotal: initialYearTotal,
  selectedYear = new Date().getFullYear(),
}: MonthlyTargetsCardProps) {
  const [year, setYear] = useState(selectedYear);
  const [months, setMonths] = useState(initialMonths);
  const [yearTotal, setYearTotal] = useState(initialYearTotal);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if there's any meaningful data
  const hasData = months.some(month => month.target > 0 || month.actual > 0);

  // Fetch data when year changes
  useEffect(() => {
    const fetchData = async () => {
      if (year === selectedYear) return; // Skip initial render with default data
      
      try {
        setIsLoading(true);
        setError(null);
        const result = await getMonthlySalesTargets(year);
        setMonths(result.months);
        setYearTotal(result.yearTotal);
      } catch (error) {
        console.error('Error fetching data for year:', year, error);
        setError(`Failed to load data for ${year}. Please try again.`);
        toast.error(`Failed to load data for ${year}. Please try again.`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [year, selectedYear]);

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    // This will refresh the page and refetch all server components
    router.refresh();
    
    // Also refetch our client component data
    getMonthlySalesTargets(year)
      .then((result) => {
        setMonths(result.months);
        setYearTotal(result.yearTotal);
        toast.success('Data refreshed successfully');
      })
      .catch((error) => {
        console.error('Error refreshing data:', error);
        setError('Failed to refresh data. Please try again.');
        toast.error('Failed to refresh data. Please try again.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleYearChange = (increment: number) => {
    setYear(prev => prev + increment);
  };

  const getVariant = (percentage: number) => {
    if (percentage >= 100) return 'default';
    if (percentage >= 75) return 'secondary';
    if (percentage >= 50) return 'outline';
    return 'destructive';
  };

  // Render the empty state when there's no data
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-10 text-center px-4 border rounded-md bg-muted/20">
      <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
      <h3 className="text-lg font-medium mb-1">No sales targets data</h3>
      <p className="text-muted-foreground max-w-md">
        {error || `No sales targets or actual sales data found for ${year}. You can set monthly targets to track your performance.`}
      </p>
      {!error && (
        <Button onClick={() => setYear(new Date().getFullYear())} variant="outline" className="mt-4">
          View current year
        </Button>
      )}
    </div>
  );

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                <span className="sr-only">{isOpen ? "Close" : "Open"} monthly targets</span>
              </Button>
            </CollapsibleTrigger>
            <div>
              <CardTitle className="text-lg font-medium">Monthly Sales Targets</CardTitle>
              <CardDescription>Track performance against monthly targets for {year}</CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleYearChange(-1)}
              disabled={year <= 2020 || isLoading}
            >
              ←
            </Button>
            <span className="font-medium">{year}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleYearChange(1)}
              disabled={year >= new Date().getFullYear() + 1 || isLoading}
            >
              →
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleRefresh}
              disabled={isLoading}
              title="Refresh data"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent>
            {isLoading ? (
              <TargetsCardSkeleton />
            ) : error ? (
              renderEmptyState()
            ) : !hasData ? (
              renderEmptyState()
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-lg border bg-card p-3">
                    <div className="text-sm font-medium text-muted-foreground">
                      Target
                    </div>
                    <div className="mt-1 text-2xl font-bold">
                      {formatCurrency(yearTotal.target)}
                    </div>
                  </div>
                  <div className="rounded-lg border bg-card p-3">
                    <div className="text-sm font-medium text-muted-foreground">
                      Actual
                    </div>
                    <div className="mt-1 text-2xl font-bold">
                      {formatCurrency(yearTotal.actual)}
                    </div>
                  </div>
                  <div className="rounded-lg border bg-card p-3">
                    <div className="text-sm font-medium text-muted-foreground">
                      Achievement
                    </div>
                    <div className="mt-1 text-2xl font-bold">
                      {yearTotal.percentageAchieved.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="rounded-md border overflow-auto max-h-[60vh] sm:max-h-none">
                  <div className="min-w-[600px]">
                    <div className="grid grid-cols-5 p-4 text-xs font-medium sticky top-0 bg-card border-b z-10">
                      <div>Month</div>
                      <div className="text-right">Target</div>
                      <div className="text-right">Actual</div>
                      <div className="text-right">Achievement</div>
                      <div className="text-center">Action</div>
                    </div>
                    <div className="divide-y">
                      {months.map((month, i) => (
                        <div key={i} className="grid grid-cols-5 p-4 text-sm items-center">
                          <div>{month.month}</div>
                          <div className="text-right">{formatCurrency(month.target)}</div>
                          <div className="text-right">{formatCurrency(month.actual)}</div>
                          <div className="text-right">
                            <Badge variant={getVariant(month.percentageAchieved)}>
                              {month.percentageAchieved.toFixed(1)}%
                            </Badge>
                          </div>
                          <div className="flex justify-center">
                            <TargetModal
                              year={year}
                              month={monthNameToIndex[month.month]}
                              currentTarget={month.target}
                              onSuccess={handleRefresh}
                              variant="dropdown"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// Skeleton loader component for when data is being fetched
function TargetsCardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Summary cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-3">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>

      {/* Table header skeleton */}
      <div className="rounded-md border overflow-auto">
        <div className="min-w-[600px]">
          <div className="grid grid-cols-5 p-4 text-xs font-medium sticky top-0 bg-card border-b">
            <Skeleton className="h-4 w-12" />
            <div className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></div>
            <div className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></div>
            <div className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></div>
            <div className="text-center"><Skeleton className="h-4 w-12 mx-auto" /></div>
          </div>
          <div className="divide-y">
            {/* Generate 6 row skeletons instead of 12 for faster display */}
            {[...Array(6)].map((_, i) => (
              <div key={i} className="grid grid-cols-5 p-4 text-sm items-center">
                <Skeleton className="h-5 w-20" />
                <div className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></div>
                <div className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></div>
                <div className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></div>
                <div className="flex justify-center"><Skeleton className="h-8 w-8 rounded-full" /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 