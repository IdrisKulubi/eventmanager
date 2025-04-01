import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics | Event Manager",
  description: "View and analyze your event performance data and metrics",
};

interface AnalyticsLayoutProps {
  children: React.ReactNode;
}

export default function AnalyticsLayout({ children }: AnalyticsLayoutProps) {
  return (
    <div className="analytics-dashboard">
      {children}
    </div>
  );
} 