import { auth } from "@/auth";
import { redirect } from "next/navigation";
import TicketScannerClient from "./ticket-scanner-client";

export const metadata = {
  title: "Validate Tickets",
  description: "Scan and validate event tickets",
};

export default async function ValidateTicketsPage() {
  const session = await auth();

  if (
    !session ||
    !(
      session.user.role === "admin" ||
      session.user.role === "manager" ||
      session.user.role === "security"
    )
  ) {
    redirect("/sign-in");
  }

  return (
    <div className="container py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ticket Validation</h1>
        <p className="text-muted-foreground mt-2">
          Scan QR codes to validate tickets at the event entrance
        </p>
      </div>

      <TicketScannerClient />
    </div>
  );
} 