import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel | Event Manager",
  description: "System-wide configuration and administration"
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="admin-dashboard">
      {children}
    </div>
  );
} 