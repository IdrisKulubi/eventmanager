import { processMpesaCallback } from "@/lib/actions/payment.actions";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // Set maximum duration for this route to 60 seconds

// List of Safaricom IP addresses for whitelisting
const MPESA_WHITELIST_IPS = [
  '196.201.214.200',
  '196.201.214.206',
  '196.201.213.114',
  '196.201.214.207',
  '196.201.214.208',
  '196.201.213.44',
  '196.201.212.127',
  '196.201.212.138',
  '196.201.212.129',
  '196.201.212.136',
  '196.201.212.74',
  '196.201.212.69',
  // Include localhost/testing IPs if needed
  '127.0.0.1',
  '::1',
];

// Secret key from .env to verify callback requests
const CALLBACK_SECRET_KEY = process.env.MPESA_CALLBACK_SECRET_KEY;

/**
 * Handle M-PESA STK Push callbacks
 */
export async function POST(request: NextRequest) {
  try {
    // Extract and check client IP for whitelisting
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const ipToCheck = clientIp?.split(',')[0].trim();
    
    // Skip IP validation in development environment
    if (process.env.NODE_ENV === 'production') {
      if (!ipToCheck || !MPESA_WHITELIST_IPS.includes(ipToCheck)) {
        console.error(`Blocked callback from non-whitelisted IP: ${ipToCheck}`);
        return NextResponse.json(
          { ResultCode: 1, ResultDesc: "IP not authorized" },
          { status: 403 }
        );
      }
    }
    
    // Validate the URL path secret key if configured
    const { pathname } = new URL(request.url);
    const pathParts = pathname.split('/');
    const securityKey = pathParts[pathParts.length - 1];
    
    if (CALLBACK_SECRET_KEY && securityKey !== CALLBACK_SECRET_KEY) {
      console.error(`Invalid security key in callback URL: ${securityKey}`);
      return NextResponse.json(
        { ResultCode: 1, ResultDesc: "Invalid security key" },
        { status: 403 }
      );
    }
    
    // Parse the callback data
    const callbackData = await request.json();
    console.log("Received M-PESA callback:", JSON.stringify(callbackData, null, 2));

    // Validate callback data structure
    if (!callbackData?.Body?.stkCallback) {
      console.error("Invalid callback data structure");
      return NextResponse.json(
        { ResultCode: 1, ResultDesc: "Invalid callback data structure" },
        { status: 400 }
      );
    }

    // Process the callback
    const result = await processMpesaCallback(callbackData);

    // M-PESA expects a specific response format
    if (result.success) {
      return NextResponse.json(
        {
          ResultCode: 0,
          ResultDesc: "Callback processed successfully",
        },
        { status: 200 }
      );
    } else {
      console.error("Failed to process callback:", result.error);
      return NextResponse.json(
        {
          ResultCode: 1,
          ResultDesc: result.error || "Failed to process callback",
        },
        { status: 200 } // Still return 200 to acknowledge receipt
      );
    }
  } catch (error) {
    console.error("Error handling M-PESA callback:", error);
    
    // Always return 200 to M-PESA even if there's an error, to acknowledge receipt
    return NextResponse.json(
      {
        ResultCode: 1,
        ResultDesc: "Error processing callback",
      },
      { status: 200 }
    );
  }
}

/**
 * Handle GET requests (for testing the endpoint is active)
 */
export async function GET() {
  return NextResponse.json(
    {
      message: "M-PESA callback endpoint is active",
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
} 