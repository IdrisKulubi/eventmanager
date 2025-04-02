import './load-env';
import db from "./drizzle";
import { tickets } from "./schema";
import { nanoid } from 'nanoid';
import QRCode from 'qrcode';
import { sql } from "drizzle-orm";

async function generateQRCode(ticketId: number): Promise<string> {
  // Include the ticketId in the data to ensure uniqueness
  const data = {
    ticketId,
    timestamp: Date.now(),
  };
  
  try {
    const qrCode = await QRCode.toDataURL(JSON.stringify(data));
    return qrCode;
  } catch (err) {
    console.error("Error generating QR code:", err);
    throw err;
  }
}

async function main() {
  try {
    // Get all ticket categories for the Black Concert
    const categories = await db.query.ticketCategories.findMany();
    
    console.log(`Found ${categories.length} ticket categories`);

    // For each category, create the specified number of tickets
    for (const category of categories) {
      console.log(`Creating ${category.quantity} tickets for category: ${category.name}`);
      
      // Create tickets in batches of 50 to avoid memory issues
      const batchSize = 50;
      const batches = Math.ceil(category.quantity / batchSize);

      for (let i = 0; i < batches; i++) {
        const remainingTickets = category.quantity - (i * batchSize);
        const currentBatchSize = Math.min(batchSize, remainingTickets);

        const ticketValues = await Promise.all(
          Array.from({ length: currentBatchSize }, async () => {
            const barcode = nanoid(12).toUpperCase();
            const ticketId = Date.now() + i * batchSize + currentBatchSize; // Ensure unique IDs
            const qrCode = await generateQRCode(ticketId);
            return {
              eventId: category.eventId,
              ticketCategoryId: category.id,
              price: category.price,
              status: 'available',
              barcode,
              qrCode,
            };
          })
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await db.insert(tickets).values(ticketValues as any);
        
        console.log(`✅ Created batch ${i + 1}/${batches} for category ${category.name}`);
      }
    }

    // Get total tickets created
    const totalTickets = await db.select({ count: sql`count(*)` }).from(tickets);
    console.log(`✅ Total tickets created: ${totalTickets[0].count}`);

  } catch (error) {
    console.error("Error seeding tickets:", error);
    throw error;
  }
}

main().catch((err) => {
  console.error("Error running ticket seed script:", err);
  process.exit(1);
}); 