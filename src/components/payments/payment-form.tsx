/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { sendStkPush } from "@/lib/actions/payment.actions";
import { stkPushQueryWithIntervals } from "@/lib/actions/payment.actions";
import { Loader2 } from "lucide-react";
import STKPushQueryLoading from "./stk-push-query-loading";
import PaymentSuccess from "./payment-success";

const paymentFormSchema = z.object({
  mpesa_phone: z.string().min(10, {
    message: "Phone number must be at least 10 characters.",
  }),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  amount: z.coerce.number().min(1, {
    message: "Amount must be at least 1.",
  }),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface PaymentFormProps {
  orderId: number;
  orderNumber: string;
  orderTotal: number;
  onSuccess?: () => void;
}

export default function PaymentForm({
  orderId,
  orderNumber,
  orderTotal,
  onSuccess,
}: PaymentFormProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [stkQueryLoading, setStkQueryLoading] = useState<boolean>(false);

  // Create form with default values
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      mpesa_phone: "",
      name: "",
      amount: orderTotal,
    },
  });

  const dataFromForm = form.getValues();

  const handleSubmit = async () => {
    setLoading(true);

    const formData = {
      mpesa_number: dataFromForm.mpesa_phone.trim(),
      name: dataFromForm.name.trim(),
      amount: dataFromForm.amount,
      orderId: orderId,
      orderNumber: orderNumber,
    };

    // Validate phone number using Kenyan phone number pattern
    const kenyanPhoneNumberRegex =
      /^(07\d{8}|01\d{8}|2547\d{8}|2541\d{8}|\+2547\d{8}|\+2541\d{8})$/;

    if (!kenyanPhoneNumberRegex.test(formData.mpesa_number)) {
      setLoading(false);
      form.setError("mpesa_phone", { message: "Invalid M-PESA phone number format" });
      return;
    }

    try {
      const { data: stkData, error: stkError } = await sendStkPush(formData);

      if (stkError) {
        setLoading(false);
        console.error("STK Push error:", stkError);
        form.setError("root", { message: stkError });
        return;
      }

      const checkoutRequestId = stkData.CheckoutRequestID;
      
      // Start polling for payment status
      setStkQueryLoading(true);
      await stkPushQueryWithIntervals(checkoutRequestId);

      // Note: The payment status will be checked by the callback
      // For this UI, we'll just show the loading state
    } catch (error) {
      console.error("Error sending STK push:", error);
      setLoading(false);
      form.setError("root", { message: "Failed to process payment. Please try again." });
    }
  };

  const onFormSubmit = (data: PaymentFormValues) => {
    // Form is valid, proceed with payment
    handleSubmit();
  };

  return (
    <>
      {stkQueryLoading ? (
        <STKPushQueryLoading number={dataFromForm.mpesa_phone} />
      ) : success ? (
        <PaymentSuccess />
      ) : (
        <div className="space-y-6 max-w-md mx-auto">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">M-PESA Payment</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Pay securely using M-PESA. An STK push will be sent to your phone.
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onFormSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mpesa_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>M-PESA Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="07XXXXXXXX or 2547XXXXXXXX"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the phone number registered with M-PESA. You will
                      receive a prompt on this phone.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (KES)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        readOnly={true}
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.formState.errors.root && (
                <div className="text-destructive text-sm font-medium">
                  {form.formState.errors.root.message}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading || stkQueryLoading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Pay Now with M-PESA"
                )}
              </Button>
            </form>
          </Form>
        </div>
      )}
    </>
  );
} 