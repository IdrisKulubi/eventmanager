import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { 
  CalendarDays, 
  Mail, 
  Phone, 
  User as UserIcon, 
  Shield, 
  Clock 
} from "lucide-react";

export const metadata: Metadata = {
  title: "Account | Event Manager",
  description: "Manage your account settings and profile information",
};

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string;
  image?: string | null;
  phone?: string | null;
  emailVerified?: Date | null;
  createdAt?: Date;
}

export default async function AccountPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/sign-in");
  }

  const user = session.user as User;

  const getRoleBadgeVariant = (role: string = "user") => {
    switch (role) {
      case "admin":
        return "destructive";
      case "manager":
        return "default";
      case "security":
        return "secondary";
      case "business_intelligence":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Account</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your account information and settings
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Profile Card */}
        <Card className="col-span-12 lg:col-span-4">
          <CardHeader className="pb-3">
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Your personal information and profile details
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center space-y-6">
            <div className="relative w-32 h-32">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-muted">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || "Profile"}
                    className="object-cover"
                    priority
                    width={128}
                    height={128}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-semibold bg-primary/10 text-primary">
                    {user.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>
              <Badge
                variant={getRoleBadgeVariant(user.role)}
                className="absolute -bottom-1 right-0 capitalize px-3 py-1"
              >
                {user.role || "User"}
              </Badge>
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-semibold">{user.name || "Unnamed User"}</h3>
              <p className="text-muted-foreground text-sm">Account ID: {user.id.substring(0, 8)}...</p>
            </div>

            {/* <Button variant="outline" className="w-full">
              Edit Profile
            </Button> */}
          </CardContent>
        </Card>

        {/* Account Details */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Your personal account details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center">
                    <UserIcon className="w-4 h-4 mr-2" />
                    Full Name
                  </p>
                  <p className="font-medium">{user.name || "Not provided"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Address
                  </p>
                  <p className="font-medium">{user.email || "Not provided"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Phone Number
                  </p>
                  <p className="font-medium">{user.phone || "Not provided"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Account Role
                  </p>
                  <p className="font-medium capitalize">{user.role || "User"}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Account Created
                  </p>
                  <p className="font-medium">
                    {user.createdAt 
                      ? new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric'
                        })
                      : "Unknown"
                    }
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center">
                    <CalendarDays className="w-4 h-4 mr-2" />
                    Email Verified
                  </p>
                  <p className="font-medium">
                    {user.emailVerified 
                      ? new Date(user.emailVerified).toLocaleDateString('en-US', {
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric'
                        })
                      : "Not verified"
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>
                Manage your account settings and security options
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Button variant="outline">Change Password</Button>
              <Button variant="outline">Two-Factor Authentication</Button>
              <Button variant="outline">Notification Preferences</Button>
              <Button variant="outline">Privacy Settings</Button>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  );
} 