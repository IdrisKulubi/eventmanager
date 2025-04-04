'use server';

import { auth } from "@/auth";
import { payments, orders } from "@/db/schema";
import db from "@/db/drizzle";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { finalizeTicketsAfterPayment } from "./ticket.actions";
import axios from "axios";
import { stkPushQuery } from "./stkPushQuery";

interface MPesaCallbackItem {
  Name: string;
  Value: string | number;
}

interface STKRequestBody {
  BusinessShortCode: string;
  Password: string;
  Timestamp: string;
  TransactionType: string;
  Amount: number;
  PartyA: string;
  PartyB: string;
  PhoneNumber: string;
  CallBackURL: string;
  AccountReference: string;
  TransactionDesc: string;
}

interface MPesaCallbackData {
  Body: {
    stkCallback: {
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: MPesaCallbackItem[];
      };
    };
  };
}


export async function sendStkPush(data: {
  mpesa_number: string;
  amount: number;
  orderId: number;
  orderNumber: string;
  name?: string;
}) {
  try {
    const session = await auth();
    if (!session) {
      return { error: "Authentication required" };
    }

    // Validate the order belongs to the user
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, data.orderId),
    });

    if (!order) {
      return { error: "Order not found" };
    }

    if (order.userId !== session.user.id) {
      return { error: "Not authorized to pay for this order" };
    }

    let phoneNumber = data.mpesa_number.trim();
    if (phoneNumber.startsWith('0')) {
      phoneNumber = '254' + phoneNumber.substring(1);
    }
    if (!phoneNumber.startsWith('254')) {
      phoneNumber = '254' + phoneNumber;
    }

    const mpesaEnv = process.env.MPESA_ENVIRONMENT;
    const MPESA_BASE_URL =
      mpesaEnv === "live"
        ? "https://api.safaricom.co.ke"
        : "https://sandbox.safaricom.co.ke";

    // Generate timestamp and password
    const date = new Date();
    const timestamp =
      date.getFullYear() +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      ("0" + date.getDate()).slice(-2) +
      ("0" + date.getHours()).slice(-2) +
      ("0" + date.getMinutes()).slice(-2) +
      ("0" + date.getSeconds()).slice(-2);

    const shortCode = process.env.MPESA_SHORTCODE!;
    const passkey = process.env.MPESA_PASSKEY!;
    const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

    // Prepare the request body
    const requestBody: STKRequestBody = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: data.amount,
      PartyA: phoneNumber,
      PartyB: shortCode,
      PhoneNumber: phoneNumber,
      CallBackURL: process.env.MPESA_CALLBACK_URL || `${process.env.NEXT_PUBLIC_API_URL}/api/payments/mpesa-callback`,
      AccountReference: data.orderNumber,
      TransactionDesc: `Payment for order ${data.orderNumber}`,
    };

    // Get access token for M-PESA API
    const tokenAuth = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString("base64");

    const tokenResponse = await axios.get(
      `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${tokenAuth}`,
        },
      }
    );

    const token = tokenResponse.data.access_token;

    const stkResponse = await axios.post(
      `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const stkResult = stkResponse.data;

    
    const [payment] = await db.insert(payments)
      .values({
        orderId: data.orderId,
        amount: data.amount.toString(), 
        method: 'mpesa',
        status: 'pending',
        mpesaPhoneNumber: phoneNumber,
        checkoutRequestId: stkResult.CheckoutRequestID,
        merchantRequestId: stkResult.MerchantRequestID,
      })
      .returning();

    return {
      data: stkResult,
      payment
    };
  } catch (error) {
    console.error("Error initiating M-PESA payment:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Unknown error occurred" };
  }
}


export async function stkPushQueryWithIntervals(checkoutRequestId: string, maxAttempts = 10) {
  let attempts = 0;
  
  const checkStatus = async () => {
    attempts++;
    try {
      const { data, error } = await stkPushQuery(checkoutRequestId);
      
      if (error) {
        console.error("Error querying STK push:", error);
        return { success: false, error: "Failed to query payment status" };
      }
      
      if (data.ResultCode === 0) {
        return { success: true, data };
      }
      
      if (data.ResultCode !== null && data.ResultCode !== undefined && data.ResultCode !== 1032) {
        return { success: false, data };
      }
      
      if (attempts >= maxAttempts) {
        return { success: false, error: "Max attempts reached" };
      }
      
      await new Promise(resolve => setTimeout(resolve, 5000));
      return await checkStatus();
    } catch (error) {
      console.error("Error in STK push query:", error);
      return { success: false, error: "Failed to check payment status" };
    }
  };
  
  return await checkStatus();
}


export async function processMpesaCallback(callbackData: MPesaCallbackData) {
  try {
    const { Body } = callbackData;
    const { stkCallback } = Body;
    const { CheckoutRequestID, ResultCode, ResultDesc } = stkCallback;

    const paymentRecord = await db.query.payments.findFirst({
      where: eq(payments.checkoutRequestId, CheckoutRequestID),
    });

    if (!paymentRecord) {
      throw new Error(`Payment record not found for CheckoutRequestID: ${CheckoutRequestID}`);
    }

    if (ResultCode === 0) {
      const callbackMetadata = stkCallback.CallbackMetadata?.Item || [];
      const mpesaReceiptNumber = callbackMetadata.find((item: MPesaCallbackItem) => item.Name === 'MpesaReceiptNumber')?.Value;
      const transactionDate = callbackMetadata.find((item: MPesaCallbackItem) => item.Name === 'TransactionDate')?.Value;
      
     
      await db.update(payments)
        .set({
          status: 'completed',
          mpesaReceiptNumber: mpesaReceiptNumber?.toString(),
          mpesaTransactionDate: transactionDate?.toString(),
          callbackMetadata: stkCallback.CallbackMetadata,
          resultCode: ResultCode,
          resultDescription: ResultDesc,
          paymentDate: new Date(),
        })
        .where(eq(payments.id, paymentRecord.id));

      await db.update(orders)
        .set({ status: 'completed' })
        .where(eq(orders.id, paymentRecord.orderId));

      // Generate and assign tickets
      await finalizeTicketsAfterPayment(paymentRecord.orderId);

      // Revalidate relevant paths
      revalidatePath(`/dashboard/orders/${paymentRecord.orderId}`);
      revalidatePath(`/orders/${paymentRecord.orderId}`);
      revalidatePath(`/tickets`);
    } else {
      // Payment failed
      await db.update(payments)
        .set({
          status: 'failed',
          callbackMetadata: stkCallback.CallbackMetadata || null,
          resultCode: ResultCode,
          resultDescription: ResultDesc,
        })
        .where(eq(payments.id, paymentRecord.id));

      await db.update(orders)
        .set({ status: 'failed' })
        .where(eq(orders.id, paymentRecord.orderId));

      // Revalidate paths
      revalidatePath(`/dashboard/orders/${paymentRecord.orderId}`);
      revalidatePath(`/orders/${paymentRecord.orderId}`);
    }

    return {
      success: true,
      message: `Payment ${ResultCode === 0 ? 'completed' : 'failed'} successfully`,
      orderId: paymentRecord.orderId,
    };
  } catch (error) {
    console.error("Error processing M-PESA callback:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}


export async function checkPaymentStatus(orderId: number) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Authentication required");
    }

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });

    if (!order) {
      throw new Error("Order not found");
    }

    const isAdmin = session.user.role === 'admin' || session.user.role === 'manager';
    if (order.userId !== session.user.id && !isAdmin) {
      throw new Error("Not authorized to check this order");
    }

    // Get payment details
    const payment = await db.query.payments.findFirst({
      where: eq(payments.orderId, orderId),
      orderBy: (payments, { desc }) => [desc(payments.createdAt)]
    });

    if (!payment) {
      return {
        success: false,
        message: "No payment found for this order",
        status: "not_found"
      };
    }

    return {
      success: true,
      status: payment.status,
      paymentDetails: {
        method: payment.method,
        amount: payment.amount,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        paymentDate: payment.paymentDate,
        receiptNumber: payment.mpesaReceiptNumber,
        checkoutRequestId: payment.checkoutRequestId,
      }
    };
  } catch (error) {
    console.error("Error checking payment status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
} 