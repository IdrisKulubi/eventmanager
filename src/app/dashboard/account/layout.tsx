import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account | Event Manager",
  description: "Manage your user account and profile settings",
};

interface AccountLayoutProps {
  children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <div className="account-container">
      {children}
    </div>
  );
} 