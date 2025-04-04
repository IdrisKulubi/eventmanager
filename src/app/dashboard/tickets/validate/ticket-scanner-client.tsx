"use client";

import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validateTicket, checkInTicket } from "@/lib/actions/ticket.actions";
import { verifyTicketQR } from "@/lib/utils/ticket-utils";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, QrCode, TicketCheck, Clock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function TicketScannerClient() {
  const [scanning, setScanning] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ticket?: any;
    checkedInAt?: Date;
  } | null>(null);
  const [autoCheckIn, setAutoCheckIn] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanner = async () => {
    if (!scannerDivRef.current) return;

    try {
      setScanning(true);
      setValidationResult(null);
      setCheckedIn(false);

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader");
      }

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        async (decodedText: string) => {
          await handleQrCodeScan(decodedText);
        },
        (errorMessage: string) => {
          // Handle QR code scan error silently
          console.log(errorMessage);
        }
      );
    } catch (error) {
      console.error("Error starting scanner:", error);
      toast.error("Failed to start camera. Please check permissions.");
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop();
      setScanning(false);
    }
  };

  const handleQrCodeScan = async (qrData: string) => {
    try {
      // Pause scanning while processing
      if (scannerRef.current) {
        await scannerRef.current.pause();
      }

      // Try to verify QR code format first
      const { isValid, ticketData } = verifyTicketQR(qrData);
      
      if (!isValid || !ticketData) {
        setValidationResult({
          valid: false,
          message: "Invalid QR code format",
        });
        return;
      }
      
      // Extract ticket ID from QR data
      const ticketId = ticketData.ticketId;
      setTicketId(ticketId.toString());
      
      // Validate ticket
      await validateTicketById(ticketId);
    } catch (error) {
      console.error("Error handling QR scan:", error);
      setValidationResult({
        valid: false,
        message: "Error processing QR code",
      });
    }
  };

  const validateTicketById = async (id: number | string) => {
    setLoading(true);
    setValidationResult(null);
    setCheckedIn(false);

    try {
      const result = await validateTicket(Number(id));
      setValidationResult({
        ...result,
        checkedInAt: result.checkedInAt || undefined
      });

      // Auto check-in if enabled and ticket is valid
      if (autoCheckIn && result.valid) {
        await handleCheckIn();
      }
    } catch (error) {
      console.error("Error validating ticket:", error);
      toast.error("Failed to validate ticket");
      setValidationResult({
        valid: false,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
      
      // Resume scanning after a delay if still in scanning mode
      setTimeout(() => {
        if (scanning && scannerRef.current) {
          scannerRef.current.resume();
        }
      }, 3000);
    }
  };

  const handleCheckIn = async () => {
    if (!ticketId || !validationResult?.valid) return;

    setLoading(true);
    try {
      const result = await checkInTicket(Number(ticketId));
      
      if (result.success) {
        toast.success("Ticket checked in successfully");
        setCheckedIn(true);
      } else {
        toast.error(result.message || "Failed to check in ticket");
      }
    } catch (error) {
      console.error("Error checking in ticket:", error);
      toast.error("Failed to check in ticket");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId) return;
    validateTicketById(ticketId);
  };

  return (
    <Tabs defaultValue="scan" className="w-full max-w-3xl mx-auto">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="scan">
          <QrCode className="mr-2 h-4 w-4" />
          Scan QR Code
        </TabsTrigger>
        <TabsTrigger value="manual">
          <TicketCheck className="mr-2 h-4 w-4" />
          Manual Entry
        </TabsTrigger>
      </TabsList>

      <TabsContent value="scan" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Scan Ticket QR Code</CardTitle>
            <CardDescription>
              Point the camera at a ticket QR code to validate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <Switch
                id="auto-check-in"
                checked={autoCheckIn}
                onCheckedChange={setAutoCheckIn}
              />
              <Label htmlFor="auto-check-in">Auto check-in valid tickets</Label>
            </div>

            <div
              id="qr-reader"
              ref={scannerDivRef}
              className="w-full max-w-xs h-64 mx-auto overflow-hidden rounded-lg border border-input"
            ></div>
          </CardContent>
          <CardFooter className="flex justify-center">
            {!scanning ? (
              <Button onClick={startScanner}>
                <QrCode className="mr-2 h-4 w-4" />
                Start Scanning
              </Button>
            ) : (
              <Button onClick={stopScanner} variant="destructive">
                <XCircle className="mr-2 h-4 w-4" />
                Stop Scanning
              </Button>
            )}
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="manual" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Manual Ticket Validation</CardTitle>
            <CardDescription>
              Enter the ticket ID or scan barcode
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter ticket ID"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={loading || !ticketId}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Validate"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {validationResult && (
        <Card className={`mt-6 ${validationResult.valid ? "border-green-500" : "border-red-500"}`}>
          <CardHeader className={`${validationResult.valid ? "bg-green-50 dark:bg-green-950/20" : "bg-red-50 dark:bg-red-950/20"} rounded-t-lg`}>
            <CardTitle className="flex items-center">
              {validationResult.valid ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Valid Ticket
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                  Invalid Ticket
                </>
              )}
            </CardTitle>
            <CardDescription>
              {validationResult.message}
              {validationResult.checkedInAt && (
                <div className="mt-1 flex items-center text-amber-600">
                  <Clock className="h-4 w-4 mr-1" />
                  Previously checked in at {new Date(validationResult.checkedInAt).toLocaleString()}
                </div>
              )}
            </CardDescription>
          </CardHeader>
          {validationResult.valid && validationResult.ticket && (
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">Event:</div>
                <div>{validationResult.ticket.eventTitle}</div>
                <div className="font-medium">Event Date:</div>
                <div>{new Date(validationResult.ticket.eventDate).toLocaleDateString()}</div>
                <div className="font-medium">Ticket ID:</div>
                <div>{validationResult.ticket.id}</div>
              </div>
            </CardContent>
          )}
          {validationResult.valid && !checkedIn && (
            <CardFooter>
              <Button
                onClick={handleCheckIn}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <TicketCheck className="mr-2 h-4 w-4" />
                )}
                Check In Attendee
              </Button>
            </CardFooter>
          )}
          {checkedIn && (
            <CardFooter className="bg-green-50 dark:bg-green-950/20 rounded-b-lg">
              <div className="w-full text-center text-green-700 dark:text-green-400 font-medium">
                <CheckCircle className="h-4 w-4 inline-block mr-2" />
                Attendee successfully checked in!
              </div>
            </CardFooter>
          )}
        </Card>
      )}
    </Tabs>
  );
} 