import { nanoid } from 'nanoid';
import { createHash } from 'crypto';

export interface TicketQRData {
  ticketId: number;
  eventId: number;
  orderId: number;
  ticketCategoryId: number;
  seatId?: number | null;
  issuedAt: string; 
  validUntil?: string; 
}

/**
 * Generate a unique QR code for a ticket
 * @param ticketData The ticket data to encode in the QR code
 * @returns A string that can be used to generate a QR code
 */
export function generateTicketQR(ticketData: TicketQRData): string {
  const ticketString = JSON.stringify(ticketData);
  
  const hash = createHash('sha256')
    .update(`${ticketString}-${process.env.TICKET_SECRET_KEY || 'default-secret'}`)
    .digest('hex');
  
  const qrData = {
    ...ticketData,
    hash: hash.substring(0, 8), 
  };
  
  return Buffer.from(JSON.stringify(qrData)).toString('base64url');
}

/**
 * Generate a unique barcode for a ticket
 * @returns A unique alphanumeric string
 */
export function generateTicketBarcode(): string {
  const uniqueId = nanoid(10);
  
  const timestamp = Date.now().toString(36);
  
  return `TIX-${timestamp.toUpperCase()}-${uniqueId.toUpperCase()}`;
}

/**
 * Verify a ticket QR code
 * @param qrCodeData The QR code data to verify
 * @returns Boolean indicating if the QR code is valid
 */
export function verifyTicketQR(qrCodeData: string): { isValid: boolean; ticketData?: TicketQRData } {
  try {
    const rawData = Buffer.from(qrCodeData, 'base64url').toString();
    const decodedData = JSON.parse(rawData);
    
    const { hash, ...ticketData } = decodedData;
    
    const expectedHash = createHash('sha256')
      .update(`${JSON.stringify(ticketData)}-${process.env.TICKET_SECRET_KEY || 'default-secret'}`)
      .digest('hex')
      .substring(0, 8);
    
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