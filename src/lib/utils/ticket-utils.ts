import { nanoid } from 'nanoid';
import { createHash } from 'crypto';

// Interface for ticket data to be encoded in QR codes
export interface TicketQRData {
  ticketId: number;
  eventId: number;
  orderId: number;
  ticketCategoryId: number;
  seatId?: number | null;
  issuedAt: string; // ISO date string
  validUntil?: string; // ISO date string
}

/**
 * Generate a unique QR code for a ticket
 * @param ticketData The ticket data to encode in the QR code
 * @returns A string that can be used to generate a QR code
 */
export function generateTicketQR(ticketData: TicketQRData): string {
  // Create a deterministic but secure string representation of the ticket
  const ticketString = JSON.stringify(ticketData);
  
  // Create a hash of the ticket data for added security
  const hash = createHash('sha256')
    .update(`${ticketString}-${process.env.TICKET_SECRET_KEY || 'default-secret'}`)
    .digest('hex');
  
  // Combine ticket data and hash (truncated) for QR code
  const qrData = {
    ...ticketData,
    hash: hash.substring(0, 8), // Include a portion of the hash for verification
  };
  
  // Return as a URL-safe base64 encoded string
  return Buffer.from(JSON.stringify(qrData)).toString('base64url');
}

/**
 * Generate a unique barcode for a ticket
 * @returns A unique alphanumeric string
 */
export function generateTicketBarcode(): string {
  // Generate a unique ID using nanoid
  const uniqueId = nanoid(10);
  
  // Create a timestamp component for the barcode
  const timestamp = Date.now().toString(36);
  
  // Combine for final barcode
  return `TIX-${timestamp.toUpperCase()}-${uniqueId.toUpperCase()}`;
}

/**
 * Verify a ticket QR code
 * @param qrCodeData The QR code data to verify
 * @returns Boolean indicating if the QR code is valid
 */
export function verifyTicketQR(qrCodeData: string): { isValid: boolean; ticketData?: TicketQRData } {
  try {
    // Decode the base64 data
    const rawData = Buffer.from(qrCodeData, 'base64url').toString();
    const decodedData = JSON.parse(rawData);
    
    // Extract the hash from the data
    const { hash, ...ticketData } = decodedData;
    
    // Re-compute the hash for verification
    const expectedHash = createHash('sha256')
      .update(`${JSON.stringify(ticketData)}-${process.env.TICKET_SECRET_KEY || 'default-secret'}`)
      .digest('hex')
      .substring(0, 8);
    
    // Check if the hash matches
    const isValid = hash === expectedHash;
    
    return {
      isValid,
      ticketData: isValid ? ticketData as TicketQRData : undefined
    };
  } catch (error) {
    console.error('Error verifying ticket QR code:', error);
    return { isValid: false };
  }
} 