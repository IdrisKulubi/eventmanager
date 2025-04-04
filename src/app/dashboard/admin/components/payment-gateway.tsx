'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  getPaymentConfig, 
  updatePaymentConfig 
} from '@/lib/actions/admin.actions';
import { 
  AlertCircle, 
  Loader2, 
  Wallet, 
  ShieldAlert, 
  CreditCard 
} from 'lucide-react';

const mpesaFormSchema = z.object({
  isEnabled: z.boolean().default(false),
  environment: z.enum(['sandbox', 'live']).default('sandbox'),
  shortcode: z.string().min(1, 'Business Shortcode is required'),
  consumerKey: z.string().min(1, 'Consumer Key is required'),
  consumerSecret: z.string().min(1, 'Consumer Secret is required'),
  passkey: z.string().min(1, 'Passkey is required'),
  callbackUrl: z.string().url('Must be a valid URL'),
  timeoutSeconds: z.coerce.number().min(10).max(300).default(60),
  autoCheckStatus: z.boolean().default(true),
  maxStatusCheckAttempts: z.coerce.number().min(1).max(20).default(10),
});

const generalSettingsSchema = z.object({
  allowPartialPayments: z.boolean().default(false),
  autoConfirmOrders: z.boolean().default(true),
  paymentExpiryMinutes: z.coerce.number().min(5).max(1440).default(30),
  sendPaymentReceipts: z.boolean().default(true),
  receiptCopyEmail: z.string().email().optional().or(z.literal('')),
  refundPolicy: z.enum(['automatic', 'manual', 'none']).default('manual'),
});

type MpesaFormValues = z.infer<typeof mpesaFormSchema>;
type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;

export function PaymentGateway() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [currentTab, setCurrentTab] = useState('mpesa');

  const mpesaForm = useForm<MpesaFormValues>({
    resolver: zodResolver(mpesaFormSchema),
    defaultValues: {
      isEnabled: false,
      environment: 'sandbox',
      shortcode: '',
      consumerKey: '',
      consumerSecret: '',
      passkey: '',
      callbackUrl: '',
      timeoutSeconds: 60,
      autoCheckStatus: true,
      maxStatusCheckAttempts: 10,
    },
  });

  const generalSettingsForm = useForm<GeneralSettingsValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      allowPartialPayments: false,
      autoConfirmOrders: true,
      paymentExpiryMinutes: 30,
      sendPaymentReceipts: true,
      receiptCopyEmail: '',
      refundPolicy: 'manual',
    },
  });

  useEffect(() => {
    const fetchPaymentConfig = async () => {
      setIsLoading(true);
      try {
        const result = await getPaymentConfig();
        if (result.error) {
          toast.error(result.error);
        } else if (result.config) {
          if (result.config.mpesa) {
            mpesaForm.reset({
              isEnabled: result.config.mpesa.isEnabled,
              environment: result.config.mpesa.environment as 'sandbox' | 'live',
              shortcode: result.config.mpesa.shortcode,
              consumerKey: result.config.mpesa.consumerKey,
              consumerSecret: result.config.mpesa.consumerSecret,
              passkey: result.config.mpesa.passkey,
              callbackUrl: result.config.mpesa.callbackUrl,
              timeoutSeconds: result.config.mpesa.timeoutSeconds,
              autoCheckStatus: result.config.mpesa.autoCheckStatus,
              maxStatusCheckAttempts: result.config.mpesa.maxStatusCheckAttempts,
            });
          }

          if (result.config.general) {
            generalSettingsForm.reset({
              allowPartialPayments: result.config.general.allowPartialPayments,
              autoConfirmOrders: result.config.general.autoConfirmOrders,
              paymentExpiryMinutes: result.config.general.paymentExpiryMinutes,
              sendPaymentReceipts: result.config.general.sendPaymentReceipts,
              receiptCopyEmail: result.config.general.receiptCopyEmail || '',
              refundPolicy: result.config.general.refundPolicy as 'automatic' | 'manual' | 'none',
            });
          }
        }
      } catch (error) {
        console.error('Error fetching payment config:', error);
        toast.error('Failed to load payment configuration');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentConfig();
  }, [mpesaForm, generalSettingsForm]);

  const onMpesaSubmit = async (values: MpesaFormValues) => {
    setIsSaving(true);
    try {
      const result = await updatePaymentConfig('mpesa', values);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('M-PESA configuration updated successfully');
      }
    } catch (error) {
      console.error('Error updating M-PESA config:', error);
      toast.error('Failed to update M-PESA configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const onGeneralSettingsSubmit = async (values: GeneralSettingsValues) => {
    setIsSaving(true);
    try {
      const result = await updatePaymentConfig('general', values);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('General payment settings updated successfully');
      }
    } catch (error) {
      console.error('Error updating general payment settings:', error);
      toast.error('Failed to update general payment settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Gateway Configuration</CardTitle>
          <CardDescription>Configure payment methods and settings</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading payment configurations...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Gateway Configuration</CardTitle>
        <CardDescription>Configure payment methods and transaction settings</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="mpesa">
              <Wallet className="mr-2 h-4 w-4" />
              M-PESA Integration
            </TabsTrigger>
            <TabsTrigger value="general">
              <CreditCard className="mr-2 h-4 w-4" />
              General Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="mpesa">
            <div className="space-y-6 py-4">
              <div className="flex items-start space-x-4">
                <Wallet className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="text-lg font-medium">M-PESA Integration Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure your Safaricom M-PESA integration for payment processing
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <Alert variant={mpesaForm.watch('environment') === 'live' ? 'destructive' : 'default'}>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>
                  {mpesaForm.watch('environment') === 'live' 
                    ? 'Live Environment' 
                    : 'Sandbox Environment'}
                </AlertTitle>
                <AlertDescription>
                  {mpesaForm.watch('environment') === 'live'
                    ? 'You are configuring the LIVE environment. Any changes will affect real transactions and payments.'
                    : 'You are in sandbox mode. No real transactions will be processed.'}
                </AlertDescription>
              </Alert>
              
              <Form {...mpesaForm}>
                <form onSubmit={mpesaForm.handleSubmit(onMpesaSubmit)} className="space-y-6">
                  {/* Enable M-PESA */}
                  <FormField
                    control={mpesaForm.control}
                    name="isEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Enable M-PESA Payments</FormLabel>
                          <FormDescription>
                            Allow customers to pay using M-PESA
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={mpesaForm.control}
                    name="environment"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Environment</FormLabel>
                          <FormDescription>
                            Select sandbox for testing or live for production
                          </FormDescription>
                        </div>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Button
                              type="button"
                              variant={field.value === 'sandbox' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => field.onChange('sandbox')}
                            >
                              Sandbox
                            </Button>
                            <Button
                              type="button"
                              variant={field.value === 'live' ? 'destructive' : 'outline'}
                              size="sm"
                              onClick={() => field.onChange('live')}
                            >
                              Live
                            </Button>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={mpesaForm.control}
                      name="shortcode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Shortcode</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Your M-PESA business shortcode
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Timeut Seconds */}
                    <FormField
                      control={mpesaForm.control}
                      name="timeoutSeconds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timeout (seconds)</FormLabel>
                          <FormControl>
                            <Input type="number" min="10" max="300" {...field} />
                          </FormControl>
                          <FormDescription>
                            How long to wait for STK push response
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Consumer Key */}
                    <FormField
                      control={mpesaForm.control}
                      name="consumerKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Consumer Key</FormLabel>
                          <FormControl>
                            <Input 
                              type={showSecrets ? 'text' : 'password'} 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Consumer Secret */}
                    <FormField
                      control={mpesaForm.control}
                      name="consumerSecret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Consumer Secret</FormLabel>
                          <FormControl>
                            <Input 
                              type={showSecrets ? 'text' : 'password'} 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Passkey */}
                  <FormField
                    control={mpesaForm.control}
                    name="passkey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Passkey</FormLabel>
                        <FormControl>
                          <Input 
                            type={showSecrets ? 'text' : 'password'} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Show/Hide secrets toggle */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-secrets"
                      checked={showSecrets}
                      onCheckedChange={(checked) => setShowSecrets(!!checked)}
                    />
                    <label
                      htmlFor="show-secrets"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Show sensitive values
                    </label>
                  </div>
                  
                  {/* Callback URL */}
                  <FormField
                    control={mpesaForm.control}
                    name="callbackUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Callback URL</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          URL where M-PESA will send transaction results
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Auto Check Status */}
                    <FormField
                      control={mpesaForm.control}
                      name="autoCheckStatus"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Auto-check transaction status
                            </FormLabel>
                            <FormDescription>
                              Automatically poll for transaction status after initiating STK push
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {/* Max Status Check Attempts */}
                    <FormField
                      control={mpesaForm.control}
                      name="maxStatusCheckAttempts"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Status Check Attempts</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="20" 
                              disabled={!mpesaForm.watch('autoCheckStatus')}
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum number of status check attempts
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isSaving || !mpesaForm.formState.isDirty}
                    >
                      {isSaving && currentTab === 'mpesa' && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save M-PESA Settings
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </TabsContent>
          
          {/* General Payment Settings Tab */}
          <TabsContent value="general">
            <div className="space-y-6 py-4">
              <div className="flex items-start space-x-4">
                <CreditCard className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="text-lg font-medium">General Payment Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure system-wide payment behavior and policies
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <Form {...generalSettingsForm}>
                <form onSubmit={generalSettingsForm.handleSubmit(onGeneralSettingsSubmit)} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Allow Partial Payments */}
                    <FormField
                      control={generalSettingsForm.control}
                      name="allowPartialPayments"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Allow Partial Payments
                            </FormLabel>
                            <FormDescription>
                              Allow customers to make partial payments for orders
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {/* Auto-confirm Orders */}
                    <FormField
                      control={generalSettingsForm.control}
                      name="autoConfirmOrders"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Auto-confirm Orders
                            </FormLabel>
                            <FormDescription>
                              Automatically confirm orders when payment is completed
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Payment Expiry Time */}
                  <FormField
                    control={generalSettingsForm.control}
                    name="paymentExpiryMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Expiry Time (minutes)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="5" 
                            max="1440" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          How long a payment session remains valid before expiring
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Send Payment Receipts */}
                    <FormField
                      control={generalSettingsForm.control}
                      name="sendPaymentReceipts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Send Payment Receipts
                            </FormLabel>
                            <FormDescription>
                              Send email receipts to customers after successful payment
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {/* Receipt Copy Email */}
                    <FormField
                      control={generalSettingsForm.control}
                      name="receiptCopyEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Receipt Copy Email (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="finance@yourdomain.com" 
                              disabled={!generalSettingsForm.watch('sendPaymentReceipts')}
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Send a copy of all receipts to this email
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={generalSettingsForm.control}
                    name="refundPolicy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Refund Policy</FormLabel>
                        <div className="flex space-x-2">
                          <Button
                            type="button"
                            variant={field.value === 'automatic' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => field.onChange('automatic')}
                          >
                            Automatic
                          </Button>
                          <Button
                            type="button"
                            variant={field.value === 'manual' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => field.onChange('manual')}
                          >
                            Manual
                          </Button>
                          <Button
                            type="button"
                            variant={field.value === 'none' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => field.onChange('none')}
                          >
                            None
                          </Button>
                        </div>
                        <FormDescription>
                          {field.value === 'automatic' && 'Automatically process refunds for eligible cancellations'}
                          {field.value === 'manual' && 'Require manual approval for all refunds'}
                          {field.value === 'none' && 'No refunds allowed (all sales are final)'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isSaving || !generalSettingsForm.formState.isDirty}
                    >
                      {isSaving && currentTab === 'general' && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save General Settings
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t bg-muted/50 flex justify-between">
        <div className="flex items-center text-sm text-muted-foreground">
          <ShieldAlert className="mr-2 h-4 w-4" />
          Changes to payment settings may affect live transactions
        </div>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </CardFooter>
    </Card>
  );
} 