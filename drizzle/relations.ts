import { relations } from "drizzle-orm/relations";
import { user, event, eventArtist, artist, eventAttendance, eventSeatingConfig, seatingSection, ticketCategory, venue, notification, order, payment, seat, session, ticket, eventToCategory, eventCategory, account } from "./schema";

export const eventRelations = relations(event, ({one, many}) => ({
	user: one(user, {
		fields: [event.createdById],
		references: [user.id]
	}),
	eventArtists: many(eventArtist),
	eventAttendances: many(eventAttendance),
	eventSeatingConfigs: many(eventSeatingConfig),
	ticketCategories: many(ticketCategory),
	tickets: many(ticket),
	eventToCategories: many(eventToCategory),
}));

export const userRelations = relations(user, ({many}) => ({
	events: many(event),
	notifications: many(notification),
	orders: many(order),
	sessions: many(session),
	accounts: many(account),
}));

export const eventArtistRelations = relations(eventArtist, ({one}) => ({
	event: one(event, {
		fields: [eventArtist.eventId],
		references: [event.id]
	}),
	artist: one(artist, {
		fields: [eventArtist.artistId],
		references: [artist.id]
	}),
}));

export const artistRelations = relations(artist, ({many}) => ({
	eventArtists: many(eventArtist),
}));

export const eventAttendanceRelations = relations(eventAttendance, ({one}) => ({
	event: one(event, {
		fields: [eventAttendance.eventId],
		references: [event.id]
	}),
}));

export const eventSeatingConfigRelations = relations(eventSeatingConfig, ({one}) => ({
	event: one(event, {
		fields: [eventSeatingConfig.eventId],
		references: [event.id]
	}),
	seatingSection: one(seatingSection, {
		fields: [eventSeatingConfig.sectionId],
		references: [seatingSection.id]
	}),
	ticketCategory: one(ticketCategory, {
		fields: [eventSeatingConfig.ticketCategoryId],
		references: [ticketCategory.id]
	}),
}));

export const seatingSectionRelations = relations(seatingSection, ({one, many}) => ({
	eventSeatingConfigs: many(eventSeatingConfig),
	venue: one(venue, {
		fields: [seatingSection.venueId],
		references: [venue.id]
	}),
	seats: many(seat),
}));

export const ticketCategoryRelations = relations(ticketCategory, ({one, many}) => ({
	eventSeatingConfigs: many(eventSeatingConfig),
	event: one(event, {
		fields: [ticketCategory.eventId],
		references: [event.id]
	}),
	tickets: many(ticket),
}));

export const venueRelations = relations(venue, ({many}) => ({
	seatingSections: many(seatingSection),
}));

export const notificationRelations = relations(notification, ({one}) => ({
	user: one(user, {
		fields: [notification.userId],
		references: [user.id]
	}),
}));

export const orderRelations = relations(order, ({one, many}) => ({
	user: one(user, {
		fields: [order.userId],
		references: [user.id]
	}),
	payments: many(payment),
	tickets: many(ticket),
}));

export const paymentRelations = relations(payment, ({one}) => ({
	order: one(order, {
		fields: [payment.orderId],
		references: [order.id]
	}),
}));

export const seatRelations = relations(seat, ({one, many}) => ({
	seatingSection: one(seatingSection, {
		fields: [seat.sectionId],
		references: [seatingSection.id]
	}),
	tickets: many(ticket),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const ticketRelations = relations(ticket, ({one}) => ({
	order: one(order, {
		fields: [ticket.orderId],
		references: [order.id]
	}),
	event: one(event, {
		fields: [ticket.eventId],
		references: [event.id]
	}),
	ticketCategory: one(ticketCategory, {
		fields: [ticket.ticketCategoryId],
		references: [ticketCategory.id]
	}),
	seat: one(seat, {
		fields: [ticket.seatId],
		references: [seat.id]
	}),
}));

export const eventToCategoryRelations = relations(eventToCategory, ({one}) => ({
	event: one(event, {
		fields: [eventToCategory.eventId],
		references: [event.id]
	}),
	eventCategory: one(eventCategory, {
		fields: [eventToCategory.categoryId],
		references: [eventCategory.id]
	}),
}));

export const eventCategoryRelations = relations(eventCategory, ({many}) => ({
	eventToCategories: many(eventToCategory),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));