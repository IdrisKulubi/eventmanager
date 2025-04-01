export default function STKPushQueryLoading({ number }: { number: string }) {
  return (
    <div className="space-y-4 text-center border rounded-lg p-6 max-w-md mx-auto shadow-sm">
      <h2 className="text-xl font-semibold animate-pulse">PROCESSING PAYMENT...</h2>
      <div className="relative mx-auto h-16 w-16 animate-spin">
        <div className="h-full w-full rounded-full border-4 border-t-primary"></div>
      </div>
      <div className="space-y-2">
        <p>STK push sent to {number}</p>
        <p className="font-medium">Enter PIN on your phone to confirm payment</p>
        <p className="text-sm text-muted-foreground">
          Please check your phone for the M-PESA payment prompt.
          Do not close this page until the transaction is complete.
        </p>
      </div>
    </div>
  );
} 