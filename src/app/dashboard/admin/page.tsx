import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "./components/user-management";
import { PaymentGateway } from "./components/payment-gateway";
import { SystemSettings } from "./components/system-settings";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string;
  image?: string | null;
}

export const metadata: Metadata = {
  title: "Admin Panel | Event Manager",
  description: "System-wide configuration and advanced settings"
};

export default async function AdminPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/sign-in');
  }

  const user = session.user as User;
  if (user.role !== 'admin') {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="mb-4">You don&apos;t have permission to access the Admin Configuration Panel.</p>
        <p>This area is restricted to administrators only.</p>
      </div>
    );
  }
  
  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Configuration Panel</h1>
        <p className="text-muted-foreground mt-2 max-w-3xl">
          Manage system-wide settings, user permissions, and integrations. Changes made here affect the entire platform.
        </p>
      </div>
      
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full max-w-3xl grid-cols-3">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="payment">Payment Gateway</TabsTrigger>
          <TabsTrigger value="system">System Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="mt-6">
          <UserManagement />
        </TabsContent>
        
        <TabsContent value="payment" className="mt-6">
          <PaymentGateway />
        </TabsContent>
        
        <TabsContent value="system" className="mt-6">
          <SystemSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
} 