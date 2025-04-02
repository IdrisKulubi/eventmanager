import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PaymentSuccessProps {
  redirectUrl?: string;
  receiptNumber?: string;
}

export default function PaymentSuccess({ 
  redirectUrl = "/tickets", 
  receiptNumber 
}: PaymentSuccessProps) {
  return (
    <div className="space-y-4 text-center border rounded-lg p-6 max-w-md mx-auto shadow-sm">
      <div className="flex justify-center">
        <CheckCircle className="h-16 w-16 text-green-500" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Payment Successful!</h2>
        <p>Thank you for your purchase.</p>
        
        {receiptNumber && (
          <div className="text-sm bg-muted p-2 rounded-md my-4">
            <p className="font-medium">M-PESA Receipt Number:</p>
            <p className="text-primary font-mono">{receiptNumber}</p>
          </div>
        )}
        
        <p className="text-sm text-muted-foreground">
          Your tickets have been generated and are now available in your account.
        </p>
      </div>
      
      <div className="pt-4">
        <Button asChild className="w-full">
          <Link href={redirectUrl}>View Your Tickets</Link>
        </Button>
      </div>
    </div>
  );
} 