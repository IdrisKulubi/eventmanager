'use server';

import { revalidatePath } from 'next/cache';
import { getRequiredAuthSession } from '@/lib/auth';
import { systemSettings, users } from '@/db/schema';
import { eq, count } from 'drizzle-orm';
import { z } from 'zod';
import db from '@/db/drizzle';

// Types for system settings
type EmailSettings = {
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  fromEmail: string;
  replyToEmail?: string;
  useSSL: boolean;
};

type GeneralSettings = {
  siteName: string;
  siteDescription?: string;
  contactEmail: string;
  supportPhone?: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
};

type SecuritySettings = {
  maxLoginAttempts: number;
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSymbols: boolean;
  sessionTimeoutMinutes: number;
  useReCaptcha: boolean;
  reCaptchaSiteKey?: string;
  reCaptchaSecretKey?: string;
};

type SystemSettingsData = {
  email?: EmailSettings;
  general?: GeneralSettings;
  security?: SecuritySettings;
};

// Define a Zod schema for validation
const SystemSettingsUpdateSchema = z.object({
  type: z.enum(['email', 'general', 'security']),
  settings: z.record(z.any()),
});

/**
 * Get all system settings
 * @returns Object containing system settings or error
 */
export async function getSystemSettings() {
  try {
    // Verify the user is authenticated and has admin role
    const session = await getRequiredAuthSession();
    if (session.user.role !== 'admin') {
      return { error: 'Unauthorized: Admin access required' };
    }

    // Fetch settings from database
    const settingsRecord = await db.query.systemSettings.findFirst();
    
    if (!settingsRecord) {
      return { 
        settings: {
          email: {
            smtpHost: '',
            smtpPort: 587,
            smtpUsername: '',
            smtpPassword: '',
            fromEmail: '',
            replyToEmail: '',
            useSSL: true,
          },
          general: {
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
          security: {
            maxLoginAttempts: 5,
            passwordMinLength: 8,
            passwordRequireUppercase: true,
            passwordRequireNumbers: true,
            passwordRequireSymbols: true,
            sessionTimeoutMinutes: 60,
            useReCaptcha: false,
            reCaptchaSiteKey: '',
            reCaptchaSecretKey: '',
          }
        } 
      };
    }

    // Parse the settings JSON
    const settings: SystemSettingsData = {};
    
    if (settingsRecord.emailSettings) {
      settings.email = JSON.parse(settingsRecord.emailSettings);
    }
    
    if (settingsRecord.generalSettings) {
      settings.general = JSON.parse(settingsRecord.generalSettings);
    }
    
    if (settingsRecord.securitySettings) {
      settings.security = JSON.parse(settingsRecord.securitySettings);
    }

    return { settings };
  } catch (error) {
    console.error('Error getting system settings:', error);
    return { error: 'Failed to retrieve system settings' };
  }
}

/**
 * Update system settings
 * @param data The settings data to update
 * @returns Object indicating success or error
 */
export async function updateSystemSettings(data: z.infer<typeof SystemSettingsUpdateSchema>) {
  try {
    // Validate input data
    const validatedData = SystemSettingsUpdateSchema.parse(data);
    
    // Verify the user is authenticated and has admin role
    const session = await getRequiredAuthSession();
    if (session.user.role !== 'admin') {
      return { error: 'Unauthorized: Admin access required' };
    }

    // Fetch existing settings
    const existingSettings = await db.query.systemSettings.findFirst();
    
    // Prepare update data based on settings type
    const updateData: Record<string, string> = {};
    
    switch (validatedData.type) {
      case 'email':
        updateData.emailSettings = JSON.stringify(validatedData.settings);
        break;
      case 'general':
        updateData.generalSettings = JSON.stringify(validatedData.settings);
        break;
      case 'security':
        updateData.securitySettings = JSON.stringify(validatedData.settings);
        break;
    }
    
    // Update or insert settings
    if (existingSettings) {
      await db
        .update(systemSettings)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(systemSettings.id, existingSettings.id));
    } else {
      await db.insert(systemSettings).values({
        ...updateData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    // Revalidate relevant paths
    revalidatePath('/dashboard/admin');
    
    return { success: true };
  } catch (error) {
    console.error('Error updating system settings:', error);
    
    if (error instanceof z.ZodError) {
      return { error: 'Invalid settings data format', details: error.format() };
    }
    
    return { error: 'Failed to update system settings' };
  }
}

/**
 * Get users with pagination
 * @param page Page number
 * @param limit Number of users per page
 * @returns Paginated list of users
 */
export async function getUsers(page = 1, limit = 10) {
  try {
    // Verify the user is authenticated and has admin role
    const session = await getRequiredAuthSession();
    if (session.user.role !== 'admin') {
      return { error: 'Unauthorized: Admin access required' };
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Fetch users with pagination
    const usersData = await db.query.users.findMany({
      limit,
      offset,
      orderBy: users.createdAt,
    });
    
    // Get total count for pagination
    const totalCountResult = await db.select({ count: count() }).from(users);
    const totalCount = totalCountResult[0].count;
    const totalPages = Math.ceil(totalCount / limit);
    
    return {
      users: usersData,
      total: totalCount,
      page,
      limit,
      totalPages
    };
  } catch (error) {
    console.error('Error getting users:', error);
    return { error: 'Failed to retrieve users' };
  }
}

/**
 * Update user role
 * @param userId User ID
 * @param role New role
 * @returns Object indicating success or error
 */
export async function updateUserRole(userId: string, role: string) {
  try {
    // Verify the user is authenticated and has admin role
    const session = await getRequiredAuthSession();
    if (session.user.role !== 'admin') {
      return { error: 'Unauthorized: Admin access required' };
    }

    // Logic to update user role would go here
    // This is a stub for now
    console.log(`Updating user ${userId} to role ${role}`);
    
    // Revalidate relevant paths
    revalidatePath('/dashboard/admin');
    
    return { success: true };
  } catch (error) {
    console.error('Error updating user role:', error);
    return { error: 'Failed to update user role' };
  }
}

/**
 * Get payment gateway configuration
 * @returns Payment gateway configuration or error
 */
export async function getPaymentConfig() {
  try {
    // Verify the user is authenticated and has admin role
    const session = await getRequiredAuthSession();
    if (session.user.role !== 'admin') {
      return { error: 'Unauthorized: Admin access required' };
    }

    // Logic to fetch payment config would go here
    // This is a stub for now
    
    return {
      config: {
        mpesa: {
          isEnabled: false,
          environment: 'sandbox',
          shortcode: '',
          consumerKey: '',
          consumerSecret: '',
          passkey: '',
          callbackUrl: '',
          timeoutSeconds: 60,
          autoCheckStatus: true,
          maxStatusCheckAttempts: 3,
        },
        general: {
          allowPartialPayments: false,
          autoConfirmOrders: true,
          paymentExpiryMinutes: 30,
          sendPaymentReceipts: true,
          receiptCopyEmail: '',
          refundPolicy: 'manual',
        }
      }
    };
  } catch (error) {
    console.error('Error getting payment configuration:', error);
    return { error: 'Failed to retrieve payment configuration' };
  }
}

/**
 * Update payment gateway configuration
 * @param type Type of payment settings
 * @param config Configuration data
 * @returns Object indicating success or error
 */
export async function updatePaymentConfig(type: string, config: Record<string, unknown>) {
  try {
    // Verify the user is authenticated and has admin role
    const session = await getRequiredAuthSession();
    if (session.user.role !== 'admin') {
      return { error: 'Unauthorized: Admin access required' };
    }

    // Logic to update payment config would go here
    // This is a stub for now
    console.log(`Updating ${type} payment config:`, config);
    
    // Revalidate relevant paths
    revalidatePath('/dashboard/admin');
    
    return { success: true };
  } catch (error) {
    console.error('Error updating payment configuration:', error);
    return { error: 'Failed to update payment configuration' };
  }
}

/**
 * Get all users without pagination
 * @returns All users or error
 */
export async function getAllUsers() {
  try {
    // Verify the user is authenticated and has admin role
    const session = await getRequiredAuthSession();
    if (session.user.role !== 'admin') {
      return { error: 'Unauthorized: Admin access required' };
    }

    // Fetch all users from database
    const usersData = await db.query.users.findMany({
      orderBy: users.createdAt,
    });
    
    return { users: usersData };
  } catch (error) {
    console.error('Error fetching all users:', error);
    return { error: 'Failed to retrieve users' };
  }
}

/**
 * Delete a user
 * @param userId User ID to delete
 * @returns Object indicating success or error
 */
export async function deleteUser(userId: string) {
  try {
    // Verify the user is authenticated and has admin role
    const session = await getRequiredAuthSession();
    if (session.user.role !== 'admin') {
      return { error: 'Unauthorized: Admin access required' };
    }

    // Logic to delete user would go here
    // This is a stub for now
    console.log(`Deleting user with ID: ${userId}`);
    
    // Revalidate relevant paths
    revalidatePath('/dashboard/admin');
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { error: 'Failed to delete user' };
  }
} 