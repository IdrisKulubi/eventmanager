import './load-env';
import db from "./drizzle";
import { events, ticketCategories } from "./schema";
import { sql } from "drizzle-orm";

async function main() {
  try {
    // Create the Black Concert event
    const [event] = await db.insert(events).values({
      title: "Black Ticket Concert",
      description: "Experience the incredible energy of Strathmore's finest artists and DJs in a spectacular showcase of talent",
      bannerImage: "https://utfs.io/f/haPSPGXk5oMNfKFnquUq5uwIjU1DOtPi8NFb47AWR0KVHa2G",
      startDate: new Date("2024-05-23T18:00:00Z"), // 6 PM EAT
      endDate: new Date("2024-05-23T23:00:00Z"), // 11 PM EAT
      status: "published",
      isPublic: true,
      isFeatured: true,
    }).returning();

    console.log("✅ Event created:", event);

    // Create ticket categories for the event
    const ticketCats = await db.insert(ticketCategories).values([
      {
        eventId: event.id,
        name: "Stratizens Regular",
        description: "Regular ticket for Strathmore students",
        price: "500",
        quantity: 500,
        availableFrom: new Date("2024-04-01T00:00:00Z"),
        availableTo: new Date("2024-05-23T15:00:00Z"),
        isEarlyBird: false,
        isVIP: false,
        maxPerOrder: 1,
      },
      {
        eventId: event.id,
        name: "Stratizens Group of 4",
        description: "Group ticket for 4 Strathmore students",
        price: "1800",
        quantity: 125,
        availableFrom: new Date("2024-04-01T00:00:00Z"),
        availableTo: new Date("2024-05-23T15:00:00Z"),
        isEarlyBird: true,
        isVIP: false,
        maxPerOrder: 1,
      },
      {
        eventId: event.id,
        name: "Stratizens Group of 6",
        description: "Group ticket for 6 Strathmore students",
        price: "2400",
        quantity: 83,
        availableFrom: new Date("2024-04-01T00:00:00Z"),
        availableTo: new Date("2024-05-23T15:00:00Z"),
        isEarlyBird: true,
        isVIP: false,
        maxPerOrder: 1,
      },
      {
        eventId: event.id,
        name: "Non-Stratizens Regular",
        description: "Regular ticket for non-Strathmore students",
        price: "700",
        quantity: 300,
        availableFrom: new Date("2024-04-01T00:00:00Z"),
        availableTo: new Date("2024-05-23T15:00:00Z"),
        isEarlyBird: false,
        isVIP: false,
        maxPerOrder: 1,
      },
      {
        eventId: event.id,
        name: "Non-Stratizens Group of 4",
        description: "Group ticket for 4 non-Strathmore students",
        price: "2600",
        quantity: 75,
        availableFrom: new Date("2024-04-01T00:00:00Z"),
        availableTo: new Date("2024-05-23T15:00:00Z"),
        isEarlyBird: true,
        isVIP: false,
        maxPerOrder: 1,
      },
      {
        eventId: event.id,
        name: "Non-Stratizens Group of 6",
        description: "Group ticket for 6 non-Strathmore students",
        price: "3600",
        quantity: 50,
        availableFrom: new Date("2024-04-01T00:00:00Z"),
        availableTo: new Date("2024-05-23T15:00:00Z"),
        isEarlyBird: true,
        isVIP: false,
        maxPerOrder: 1,
      },
    ]).returning();

    console.log("✅ Ticket categories created:", ticketCats.length);
    console.log("✅ Seed data inserted successfully");
  } catch (error) {
    console.error("Error seeding data:", error);
    throw error;
  }
}

main().catch((err) => {
  console.error("Error running seed script:", err);
  process.exit(1);
}); 