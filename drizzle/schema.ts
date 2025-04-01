import { pgTable, unique, text, timestamp, foreignKey, serial, integer, boolean, uniqueIndex, json, numeric, primaryKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const eventStatus = pgEnum("event_status", ['draft', 'published', 'cancelled', 'completed'])
export const orderStatus = pgEnum("order_status", ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'])
export const paymentMethod = pgEnum("payment_method", ['mpesa', 'other'])
export const paymentStatus = pgEnum("payment_status", ['pending', 'completed', 'failed', 'refunded'])
export const ticketStatus = pgEnum("ticket_status", ['available', 'reserved', 'sold', 'cancelled', 'used', 'expired'])
export const userRole = pgEnum("user_role", ['user', 'admin', 'manager', 'security', 'business_intelligence'])


export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	password: text(),
	role: userRole().default('user'),
	emailVerified: timestamp({ mode: 'string' }),
	image: text(),
	phone: text(),
	dateOfBirth: timestamp("date_of_birth", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const event = pgTable("event", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	description: text(),
	bannerImage: text("banner_image"),
	venueId: integer("venue_id"),
	startDate: timestamp("start_date", { mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }).notNull(),
	status: eventStatus().default('draft'),
	isPublic: boolean("is_public").default(true),
	createdById: text("created_by_id"),
	ageRestriction: integer("age_restriction"),
	maxTickets: integer("max_tickets"),
	isFeatured: boolean("is_featured").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdById],
			foreignColumns: [user.id],
			name: "event_created_by_id_user_id_fk"
		}).onDelete("set null"),
]);

export const eventArtist = pgTable("event_artist", {
	id: serial().primaryKey().notNull(),
	eventId: integer("event_id").notNull(),
	artistId: integer("artist_id").notNull(),
	isHeadliner: boolean("is_headliner").default(false),
	performanceOrder: integer("performance_order"),
	performanceTime: timestamp("performance_time", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("event_artist_unique_idx").using("btree", table.eventId.asc().nullsLast().op("int4_ops"), table.artistId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.eventId],
			foreignColumns: [event.id],
			name: "event_artist_event_id_event_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.artistId],
			foreignColumns: [artist.id],
			name: "event_artist_artist_id_artist_id_fk"
		}).onDelete("cascade"),
]);

export const artist = pgTable("artist", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	bio: text(),
	imageUrl: text("image_url"),
	socialLinks: json("social_links"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const eventAttendance = pgTable("event_attendance", {
	id: serial().primaryKey().notNull(),
	eventId: integer("event_id").notNull(),
	totalTickets: integer("total_tickets").notNull(),
	ticketsSold: integer("tickets_sold").notNull(),
	attendeesCheckedIn: integer("attendees_checked_in").notNull(),
	revenue: numeric({ precision: 10, scale:  2 }).notNull(),
	dateRecorded: timestamp("date_recorded", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.eventId],
			foreignColumns: [event.id],
			name: "event_attendance_event_id_event_id_fk"
		}).onDelete("cascade"),
]);

export const eventSeatingConfig = pgTable("event_seating_config", {
	id: serial().primaryKey().notNull(),
	eventId: integer("event_id").notNull(),
	sectionId: integer("section_id").notNull(),
	ticketCategoryId: integer("ticket_category_id"),
	price: numeric({ precision: 10, scale:  2 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("event_section_unique_idx").using("btree", table.eventId.asc().nullsLast().op("int4_ops"), table.sectionId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.eventId],
			foreignColumns: [event.id],
			name: "event_seating_config_event_id_event_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.sectionId],
			foreignColumns: [seatingSection.id],
			name: "event_seating_config_section_id_seating_section_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.ticketCategoryId],
			foreignColumns: [ticketCategory.id],
			name: "event_seating_config_ticket_category_id_ticket_category_id_fk"
		}).onDelete("set null"),
]);

export const seatingSection = pgTable("seating_section", {
	id: serial().primaryKey().notNull(),
	venueId: integer("venue_id").notNull(),
	name: text().notNull(),
	description: text(),
	capacity: integer().notNull(),
	isReserved: boolean("is_reserved").default(false),
	layout: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.venueId],
			foreignColumns: [venue.id],
			name: "seating_section_venue_id_venue_id_fk"
		}).onDelete("cascade"),
]);

export const ticketCategory = pgTable("ticket_category", {
	id: serial().primaryKey().notNull(),
	eventId: integer("event_id").notNull(),
	name: text().notNull(),
	description: text(),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
	quantity: integer().notNull(),
	availableFrom: timestamp("available_from", { mode: 'string' }).notNull(),
	availableTo: timestamp("available_to", { mode: 'string' }).notNull(),
	isEarlyBird: boolean("is_early_bird").default(false),
	isVip: boolean("is_vip").default(false),
	maxPerOrder: integer("max_per_order"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.eventId],
			foreignColumns: [event.id],
			name: "ticket_category_event_id_event_id_fk"
		}).onDelete("cascade"),
]);

export const eventCategory = pgTable("event_category", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("event_category_name_unique").on(table.name),
]);

export const venue = pgTable("venue", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	address: text().notNull(),
	city: text().notNull(),
	capacity: integer().notNull(),
	description: text(),
	imageUrl: text("image_url"),
	contactInfo: text("contact_info"),
	coordinates: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const notification = pgTable("notification", {
	id: serial().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	title: text().notNull(),
	message: text().notNull(),
	isRead: boolean("is_read").default(false),
	type: text().notNull(),
	relatedEntityId: text("related_entity_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "notification_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const order = pgTable("order", {
	id: serial().primaryKey().notNull(),
	userId: text("user_id"),
	orderNumber: text("order_number").notNull(),
	status: orderStatus().default('pending'),
	total: numeric({ precision: 10, scale:  2 }).notNull(),
	tax: numeric({ precision: 10, scale:  2 }),
	discount: numeric({ precision: 10, scale:  2 }),
	orderDate: timestamp("order_date", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "order_user_id_user_id_fk"
		}).onDelete("set null"),
	unique("order_order_number_unique").on(table.orderNumber),
]);

export const payment = pgTable("payment", {
	id: serial().primaryKey().notNull(),
	orderId: integer("order_id").notNull(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	currency: text().default('KES'),
	status: paymentStatus().default('pending'),
	method: paymentMethod().default('mpesa'),
	paymentDate: timestamp("payment_date", { mode: 'string' }),
	mpesaReceiptNumber: text("mpesa_receipt_number"),
	mpesaPhoneNumber: text("mpesa_phone_number"),
	mpesaTransactionDate: text("mpesa_transaction_date"),
	checkoutRequestId: text("checkout_request_id"),
	merchantRequestId: text("merchant_request_id"),
	callbackMetadata: json("callback_metadata"),
	resultCode: integer("result_code"),
	resultDescription: text("result_description"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [order.id],
			name: "payment_order_id_order_id_fk"
		}).onDelete("cascade"),
	unique("payment_mpesa_receipt_number_unique").on(table.mpesaReceiptNumber),
]);

export const seat = pgTable("seat", {
	id: serial().primaryKey().notNull(),
	sectionId: integer("section_id").notNull(),
	row: text().notNull(),
	number: text().notNull(),
	isAccessible: boolean("is_accessible").default(false),
	isVip: boolean("is_vip").default(false),
	status: text().default('available'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("section_row_number_idx").using("btree", table.sectionId.asc().nullsLast().op("int4_ops"), table.row.asc().nullsLast().op("int4_ops"), table.number.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.sectionId],
			foreignColumns: [seatingSection.id],
			name: "seat_section_id_seating_section_id_fk"
		}).onDelete("cascade"),
]);

export const session = pgTable("session", {
	sessionToken: text().primaryKey().notNull(),
	userId: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_userId_user_id_fk"
		}).onDelete("cascade"),
]);

export const ticket = pgTable("ticket", {
	id: serial().primaryKey().notNull(),
	orderId: integer("order_id"),
	eventId: integer("event_id").notNull(),
	ticketCategoryId: integer("ticket_category_id"),
	seatId: integer("seat_id"),
	qrCode: text("qr_code"),
	barcode: text(),
	status: ticketStatus().default('available'),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
	purchaseDate: timestamp("purchase_date", { mode: 'string' }),
	isCheckedIn: boolean("is_checked_in").default(false),
	checkedInAt: timestamp("checked_in_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [order.id],
			name: "ticket_order_id_order_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.eventId],
			foreignColumns: [event.id],
			name: "ticket_event_id_event_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.ticketCategoryId],
			foreignColumns: [ticketCategory.id],
			name: "ticket_ticket_category_id_ticket_category_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.seatId],
			foreignColumns: [seat.id],
			name: "ticket_seat_id_seat_id_fk"
		}).onDelete("set null"),
	unique("ticket_qr_code_unique").on(table.qrCode),
	unique("ticket_barcode_unique").on(table.barcode),
]);

export const eventToCategory = pgTable("event_to_category", {
	eventId: integer("event_id").notNull(),
	categoryId: integer("category_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.eventId],
			foreignColumns: [event.id],
			name: "event_to_category_event_id_event_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [eventCategory.id],
			name: "event_to_category_category_id_event_category_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.eventId, table.categoryId], name: "event_to_category_event_id_category_id_pk"}),
]);

export const verificationToken = pgTable("verificationToken", {
	identifier: text().notNull(),
	token: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	primaryKey({ columns: [table.identifier, table.token], name: "verificationToken_identifier_token_pk"}),
]);

export const account = pgTable("account", {
	userId: text().notNull(),
	type: text().notNull(),
	provider: text().notNull(),
	providerAccountId: text().notNull(),
	refreshToken: text("refresh_token"),
	accessToken: text("access_token"),
	expiresAt: integer("expires_at"),
	tokenType: text("token_type"),
	scope: text(),
	idToken: text("id_token"),
	sessionState: text("session_state"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_userId_user_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.provider, table.providerAccountId], name: "account_provider_providerAccountId_pk"}),
]);
