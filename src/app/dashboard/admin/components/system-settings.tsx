'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  getSystemSettings,
  updateSystemSettings 
} from '@/lib/actions/admin.actions';
import { 
  Loader2, 
  Settings, 
  Mail, 
  Shield, 
  Globe 
} from 'lucide-react';

// Schema for email settings
const emailSettingsSchema = z.object({
  smtpHost: z.string().min(1, 'SMTP Host is required'),
  smtpPort: z.coerce.number().int().positive(),
  smtpUsername: z.string().min(1, 'SMTP Username is required'),
  smtpPassword: z.string().min(1, 'SMTP Password is required'),
  fromEmail: z.string().email('From Email must be a valid email'),
  replyToEmail: z.string().email('Reply-To must be a valid email').optional().or(z.literal('')),
  useSSL: z.boolean().default(true),
});

// Schema for general settings
const generalSettingsSchema = z.object({
  siteName: z.string().min(1, 'Site Name is required'),
  siteDescription: z.string().optional(),
  contactEmail: z.string().email('Contact Email must be a valid email'),
  supportPhone: z.string().optional(),
  timezone: z.string().min(1, 'Timezone is required'),
  dateFormat: z.string().min(1, 'Date Format is required'),
  timeFormat: z.string().min(1, 'Time Format is required'),
  maintenanceMode: z.boolean().default(false),
  maintenanceMessage: z.string().optional(),
});

// Schema for security settings
const securitySettingsSchema = z.object({
  maxLoginAttempts: z.coerce.number().int().min(3).max(10),
  passwordMinLength: z.coerce.number().int().min(8).max(30),
  passwordRequireUppercase: z.boolean().default(true),
  passwordRequireNumbers: z.boolean().default(true),
  passwordRequireSymbols: z.boolean().default(true),
  sessionTimeoutMinutes: z.coerce.number().int().min(10).max(1440),
  useReCaptcha: z.boolean().default(false),
  reCaptchaSiteKey: z.string().optional(),
  reCaptchaSecretKey: z.string().optional(),
});

type EmailSettingsValues = z.infer<typeof emailSettingsSchema>;
type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;
type SecuritySettingsValues = z.infer<typeof securitySettingsSchema>;

export function SystemSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentTab, setCurrentTab] = useState('general');
  
  // Initialize forms with default values
  const emailForm = useForm<EmailSettingsValues>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: {
      smtpHost: '',
      smtpPort: 587,
      smtpUsername: '',
      smtpPassword: '',
      fromEmail: '',
      replyToEmail: '',
      useSSL: true,
    },
  });
  
  const generalForm = useForm<GeneralSettingsValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      siteName: 'Event Manager',
      siteDescription: '',
      contactEmail: '',
      supportPhone: '',
      timezone: 'UTC',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: 'HH:mm',
      maintenanceMode: false,
      maintenanceMessage: '',
    },
  });
  
  const securityForm = useForm<SecuritySettingsValues>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      passwordRequireUppercase: true,
      passwordRequireNumbers: true,
      passwordRequireSymbols: true,
      sessionTimeoutMinutes: 60,
      useReCaptcha: false,
      reCaptchaSiteKey: '',
      reCaptchaSecretKey: '',
    },
  });

  // Fetch current system settings
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const result = await getSystemSettings();
        if (result.error) {
          toast.error(result.error);
        } else if (result.settings) {
          // Update email settings form
          if (result.settings.email) {
            emailForm.reset({
              ...result.settings.email,
            });
          }
          
          // Update general settings form
          if (result.settings.general) {
            generalForm.reset({
              ...result.settings.general,
            });
          }
          
          // Update security settings form
          if (result.settings.security) {
            securityForm.reset({
              ...result.settings.security,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load system settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [emailForm, generalForm, securityForm]);

  const onEmailSubmit = async (values: EmailSettingsValues) => {
    handleSubmit('email', values);
  };

  const onGeneralSubmit = async (values: GeneralSettingsValues) => {
    handleSubmit('general', values);
  };

  const onSecuritySubmit = async (values: SecuritySettingsValues) => {
    handleSubmit('security', values);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (type: string, values: any    ) => {
    setIsSaving(true);
    try {
      const result = await updateSystemSettings({
        type: type as 'email' | 'general' | 'security',
        settings: values,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} settings updated successfully`);
      }
    } catch (error) {
      console.error(`Error updating ${type} settings:`, error);
      toast.error(`Failed to update ${type} settings`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>Configure system-wide settings</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading system settings...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Settings</CardTitle>
        <CardDescription>Configure system-wide preferences and behavior</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="general">
              <Settings className="mr-2 h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="mr-2 h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="mr-2 h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>
          
          {/* General Settings Tab */}
          <TabsContent value="general">
            <div className="space-y-6 py-4">
              <div className="flex items-start space-x-4">
                <Globe className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="text-lg font-medium">General System Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure basic site settings and preferences
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <Form {...generalForm}>
                <form onSubmit={generalForm.handleSubmit(onGeneralSubmit)} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Site Name */}
                    <FormField
                      control={generalForm.control}
                      name="siteName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Site Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Contact Email */}
                    <FormField
                      control={generalForm.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Site Description */}
                  <FormField
                    control={generalForm.control}
                    name="siteDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid gap-6 md:grid-cols-3">
                    {/* Support Phone */}
                    <FormField
                      control={generalForm.control}
                      name="supportPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Support Phone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Timezone */}
                    <FormField
                      control={generalForm.control}
                      name="timezone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timezone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Date Format */}
                    <FormField
                      control={generalForm.control}
                      name="dateFormat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date Format</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Maintenance Mode */}
                  <FormField
                    control={generalForm.control}
                    name="maintenanceMode"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between space-x-2 rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Maintenance Mode</FormLabel>
                          <FormDescription>
                            Enable maintenance mode to temporarily disable the site
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
                  
                  {/* Maintenance Message */}
                  {generalForm.watch('maintenanceMode') && (
                    <FormField
                      control={generalForm.control}
                      name="maintenanceMessage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maintenance Message</FormLabel>
                          <FormControl>
                            <Textarea rows={3} {...field} />
                          </FormControl>
                          <FormDescription>
                            This message will be displayed to users during maintenance
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isSaving || !generalForm.formState.isDirty}
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
          
          {/* Email Settings Tab */}
          <TabsContent value="email">
            <div className="space-y-6 py-4">
              <div className="flex items-start space-x-4">
                <Mail className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="text-lg font-medium">Email Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure email delivery and notification settings
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* SMTP Host */}
                    <FormField
                      control={emailForm.control}
                      name="smtpHost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Host</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* SMTP Port */}
                    <FormField
                      control={emailForm.control}
                      name="smtpPort"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Port</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* SMTP Username */}
                    <FormField
                      control={emailForm.control}
                      name="smtpUsername"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Username</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* SMTP Password */}
                    <FormField
                      control={emailForm.control}
                      name="smtpPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* From Email */}
                    <FormField
                      control={emailForm.control}
                      name="fromEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From Email</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Email address used in the &quot;From&quot; field
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Reply-To Email */}
                    <FormField
                      control={emailForm.control}
                      name="replyToEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reply-To Email (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Email address for replies
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Use SSL */}
                  <FormField
                    control={emailForm.control}
                    name="useSSL"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between space-x-2 rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Use SSL/TLS</FormLabel>
                          <FormDescription>
                            Enable secure connection for email delivery
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
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isSaving || !emailForm.formState.isDirty}
                    >
                      {isSaving && currentTab === 'email' && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Email Settings
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </TabsContent>
          
          {/* Security Settings Tab */}
          <TabsContent value="security">
            <div className="space-y-6 py-4">
              <div className="flex items-start space-x-4">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="text-lg font-medium">Security Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure security and authentication settings
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <Form {...securityForm}>
                <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Max Login Attempts */}
                    <FormField
                      control={securityForm.control}
                      name="maxLoginAttempts"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Login Attempts</FormLabel>
                          <FormControl>
                            <Input type="number" min="3" max="10" {...field} />
                          </FormControl>
                          <FormDescription>
                            Number of failed attempts before temporary lockout
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Session Timeout */}
                    <FormField
                      control={securityForm.control}
                      name="sessionTimeoutMinutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Session Timeout (minutes)</FormLabel>
                          <FormControl>
                            <Input type="number" min="10" max="1440" {...field} />
                          </FormControl>
                          <FormDescription>
                            How long until an inactive session expires
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Password Requirements */}
                  <div className="rounded-lg border p-4 space-y-4">
                    <h4 className="text-sm font-medium">Password Requirements</h4>
                    
                    <FormField
                      control={securityForm.control}
                      name="passwordMinLength"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Password Length</FormLabel>
                          <FormControl>
                            <Input type="number" min="8" max="30" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid gap-4 md:grid-cols-3">
                      <FormField
                        control={securityForm.control}
                        name="passwordRequireUppercase"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div>
                              <FormLabel>Require uppercase</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={securityForm.control}
                        name="passwordRequireNumbers"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div>
                              <FormLabel>Require numbers</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={securityForm.control}
                        name="passwordRequireSymbols"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div>
                              <FormLabel>Require symbols</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  {/* Google reCAPTCHA */}
                  <div className="rounded-lg border p-4 space-y-4">
                    <FormField
                      control={securityForm.control}
                      name="useReCaptcha"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Google reCAPTCHA</FormLabel>
                            <FormDescription>
                              Protect forms with reCAPTCHA verification
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
                    
                    {securityForm.watch('useReCaptcha') && (
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={securityForm.control}
                          name="reCaptchaSiteKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>reCAPTCHA Site Key</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={securityForm.control}
                          name="reCaptchaSecretKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>reCAPTCHA Secret Key</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isSaving || !securityForm.formState.isDirty}
                    >
                      {isSaving && currentTab === 'security' && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Security Settings
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 