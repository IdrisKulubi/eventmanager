import { pgTable, text, timestamp, integer, primaryKey, serial, numeric, boolean, pgEnum, json, uniqueIndex } from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

// Enum types
export const eventStatusEnum = pgEnum('event_status', ['draft', 'published', 'cancelled', 'completed']);
export const ticketStatusEnum = pgEnum('ticket_status', ['available', 'reserved', 'sold', 'cancelled', 'used', 'expired']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed', 'failed', 'refunded']);
export const paymentMethodEnum = pgEnum('payment_method', ['mpesa', 'other']);
export const userRoleEnum = pgEnum('user_role', ['user', 'admin', 'manager', 'security', 'business_intelligence']);

// First define all tables 
export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"), // Password field for email/password auth
  role: userRoleEnum("role").default("user"),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  phone: text("phone"),
  dateOfBirth: timestamp("date_of_birth", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Auth.js tables
export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// Venues table
export const venues = pgTable("venue", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  capacity: integer("capacity").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  contactInfo: text("contact_info"),
  coordinates: json("coordinates").$type<{ lat: number; lng: number }>(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Events table
export const events = pgTable("event", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  bannerImage: text("banner_image"),
  venueId: integer("venue_id").references(() => venues.id, { onDelete: "set null" }),
  startDate: timestamp("start_date", { mode: "date" }).notNull(),
  endDate: timestamp("end_date", { mode: "date" }).notNull(),
  status: eventStatusEnum("status").default("draft"),
  isPublic: boolean("is_public").default(true),
  createdById: text("created_by_id").references(() => users.id, { onDelete: "set null" }),
  ageRestriction: integer("age_restriction"),
  maxTickets: integer("max_tickets"),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Ticket categories table
export const ticketCategories = pgTable("ticket_category", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  availableFrom: timestamp("available_from", { mode: "date" }).notNull(),
  availableTo: timestamp("available_to", { mode: "date" }).notNull(),
  isEarlyBird: boolean("is_early_bird").default(false),
  isVIP: boolean("is_vip").default(false),
  maxPerOrder: integer("max_per_order"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Seating sections table
export const seatingSections = pgTable("seating_section", {
  id: serial("id").primaryKey(),
  venueId: integer("venue_id").references(() => venues.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  capacity: integer("capacity").notNull(),
  isReserved: boolean("is_reserved").default(false),
  layout: json("layout").$type<{
    rows: number;
    seatsPerRow: number;
    sectionMap: string[][];
  }>(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Seats table
export const seats = pgTable("seat", {
  id: serial("id").primaryKey(),
  sectionId: integer("section_id").references(() => seatingSections.id, { onDelete: "cascade" }).notNull(),
  row: text("row").notNull(),
  number: text("number").notNull(),
  isAccessible: boolean("is_accessible").default(false),
  isVIP: boolean("is_vip").default(false),
  status: text("status").default("available"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
}, (table) => {
  return {
    sectionRowNumber: uniqueIndex("section_row_number_idx").on(table.sectionId, table.row, table.number)
  };
});

// Event seating configuration
export const eventSeatingConfig = pgTable("event_seating_config", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id, { onDelete: "cascade" }).notNull(),
  sectionId: integer("section_id").references(() => seatingSections.id, { onDelete: "cascade" }).notNull(),
  ticketCategoryId: integer("ticket_category_id").references(() => ticketCategories.id, { onDelete: "set null" }),
  price: numeric("price", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
}, (table) => {
  return {
    eventSectionUnique: uniqueIndex("event_section_unique_idx").on(table.eventId, table.sectionId)
  };
});

// Orders table
export const orders = pgTable("order", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  orderNumber: text("order_number").notNull().unique(),
  status: orderStatusEnum("status").default("pending"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  tax: numeric("tax", { precision: 10, scale: 2 }),
  discount: numeric("discount", { precision: 10, scale: 2 }),
  orderDate: timestamp("order_date", { mode: "date" }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Tickets table
export const tickets = pgTable("ticket", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id, { onDelete: "set null" }),
  eventId: integer("event_id").references(() => events.id, { onDelete: "cascade" }).notNull(),
  ticketCategoryId: integer("ticket_category_id").references(() => ticketCategories.id, { onDelete: "set null" }),
  seatId: integer("seat_id").references(() => seats.id, { onDelete: "set null" }),
  qrCode: text("qr_code").unique(),
  barcode: text("barcode").unique(),
  status: ticketStatusEnum("status").default("available"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  purchaseDate: timestamp("purchase_date", { mode: "date" }),
  isCheckedIn: boolean("is_checked_in").default(false),
  checkedInAt: timestamp("checked_in_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Payments table (M-PESA integration)
export const payments = pgTable("payment", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id, { onDelete: "cascade" }).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("KES"),
  status: paymentStatusEnum("status").default("pending"),
  method: paymentMethodEnum("method").default("mpesa"),
  paymentDate: timestamp("payment_date", { mode: "date" }),
  
  // M-PESA specific fields
  mpesaReceiptNumber: text("mpesa_receipt_number").unique(),
  mpesaPhoneNumber: text("mpesa_phone_number"),
  mpesaTransactionDate: text("mpesa_transaction_date"),
  checkoutRequestId: text("checkout_request_id"),
  merchantRequestId: text("merchant_request_id"),
  
  // For handling callbacks and status checks
  callbackMetadata: json("callback_metadata"),
  resultCode: integer("result_code"),
  resultDescription: text("result_description"),
  
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Artists/Performers table
export const artists = pgTable("artist", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  bio: text("bio"),
  imageUrl: text("image_url"),
  socialLinks: json("social_links").$type<{ 
    instagram?: string;
    twitter?: string;
    facebook?: string;
    website?: string;
  }>(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Event-Artist relationship (many-to-many)
export const eventArtists = pgTable("event_artist", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id, { onDelete: "cascade" }).notNull(),
  artistId: integer("artist_id").references(() => artists.id, { onDelete: "cascade" }).notNull(),
  isHeadliner: boolean("is_headliner").default(false),
  performanceOrder: integer("performance_order"),
  performanceTime: timestamp("performance_time", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
}, (table) => {
  return {
    eventArtistUnique: uniqueIndex("event_artist_unique_idx").on(table.eventId, table.artistId)
  };
});

// Analytics - Event attendance
export const eventAttendance = pgTable("event_attendance", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id, { onDelete: "cascade" }).notNull(),
  totalTickets: integer("total_tickets").notNull(),
  ticketsSold: integer("tickets_sold").notNull(),
  attendeesCheckedIn: integer("attendees_checked_in").notNull(),
  revenue: numeric("revenue", { precision: 10, scale: 2 }).notNull(),
  dateRecorded: timestamp("date_recorded", { mode: "date" }).defaultNow().notNull(),
});

// Event categories
export const eventCategories = pgTable("event_category", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// Event to category relationship (many-to-many)
export const eventToCategory = pgTable("event_to_category", {
  eventId: integer("event_id").references(() => events.id, { onDelete: "cascade" }).notNull(),
  categoryId: integer("category_id").references(() => eventCategories.id, { onDelete: "cascade" }).notNull(),
}, (table) => {
  return {
    primaryKey: primaryKey({ columns: [table.eventId, table.categoryId] })
  };
});

// Notifications
export const notifications = pgTable("notification", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  type: text("type").notNull(),  // "event_update", "ticket_purchased", "payment_confirmation", etc.
  relatedEntityId: text("related_entity_id"), 
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});