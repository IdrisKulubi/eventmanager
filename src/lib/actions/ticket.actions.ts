'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { eq, and, inArray, desc, sql } from 'drizzle-orm';
import { tickets, events, ticketCategories, orders } from '@/db/schema';
import { ticketStatusEnum } from '@/db/schema';
import db from '@/db/drizzle';
import { generateTicketQR, generateTicketBarcode, TicketQRData } from '../utils/ticket-utils';
import { nanoid } from 'nanoid';

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: 'admin' | 'manager' | 'user' | 'security';
}

export interface PurchaseTicketParams {
  eventId: number;
  ticketCategoryId: number;
  seatId?: number; 
  quantity: number;
  userId: string;
}

interface OrderCreationParams {
  userId: string;
  items: {
    eventId: number;
    ticketCategoryId: number;
    seatId?: number;
    quantity: number;
    price: number;
  }[];
  total: number;
}

type TicketStatus = typeof ticketStatusEnum.enumValues[number];


async function checkTicketManagementPermission() {
  const session = await auth();
  if (!session) {
    return false;
  }

  const user = session.user as User;
  return user.role === 'admin' || user.role === 'manager' || user.role === 'security';
}


export async function getAllTicketCategories() {
  try {
    const result = await db.select({
      ticketCategory: ticketCategories,
      eventTitle: events.title,
    })
    .from(ticketCategories)
    .leftJoin(events, eq(ticketCategories.eventId, events.id))
    .orderBy(desc(ticketCategories.createdAt));
    
    return result;
  } catch (error) {
    console.error('Error fetching all ticket categories:', error);
    throw new Error('Failed to fetch ticket categories');
  }
}


export async function getTicketById(id: number) {
  try {
    const ticket = await db.select().from(tickets)
      .where(eq(tickets.id, id))
      .limit(1);
    
    if (!ticket.length) {
      return null;
    }
    
    return ticket[0];
  } catch (error) {
    console.error('Error fetching ticket:', error);
    throw new Error('Failed to fetch ticket');
  }
}

export async function getEventTickets({
  eventId,
  page = 1,
  limit = 10,
  status,
}: {
  eventId: number;
  page?: number;
  limit?: number;
  status?: TicketStatus;
}) {
  const hasPermission = await checkTicketManagementPermission();
  if (!hasPermission) {
    throw new Error('Unauthorized: You do not have permission to view tickets');
  }
  
  try {
    const offset = (page - 1) * limit;
    
    let resultsPromise;
    if (status) {
      resultsPromise = db.select({
        id: tickets.id,
        eventId: tickets.eventId,
        ticketCategoryId: tickets.ticketCategoryId,
        orderId: tickets.orderId,
        seatId: tickets.seatId,
        status: tickets.status,
        qrCode: tickets.qrCode,
        barcode: tickets.barcode,
        price: tickets.price,
        isCheckedIn: tickets.isCheckedIn,
        checkedInAt: tickets.checkedInAt,
        createdAt: tickets.createdAt,
        categoryName: ticketCategories.name
      })
        .from(tickets)
        .leftJoin(ticketCategories, eq(tickets.ticketCategoryId, ticketCategories.id))
        .where(and(
          eq(tickets.eventId, eventId),
          eq(tickets.status, status)
        ))
        .orderBy(desc(tickets.createdAt))
        .limit(limit)
        .offset(offset);
    } else {
      resultsPromise = db.select({
        id: tickets.id,
        eventId: tickets.eventId,
        ticketCategoryId: tickets.ticketCategoryId,
        orderId: tickets.orderId,
        seatId: tickets.seatId,
        status: tickets.status,
        qrCode: tickets.qrCode,
        barcode: tickets.barcode,
        price: tickets.price,
        isCheckedIn: tickets.isCheckedIn,
        checkedInAt: tickets.checkedInAt,
        createdAt: tickets.createdAt,
        categoryName: ticketCategories.name
      })
        .from(tickets)
        .leftJoin(ticketCategories, eq(tickets.ticketCategoryId, ticketCategories.id))
        .where(eq(tickets.eventId, eventId))
        .orderBy(desc(tickets.createdAt))
        .limit(limit)
        .offset(offset);
    }
    
    let countPromise;
    if (status) {
      countPromise = db
        .select({ count: sql<number>`count(*)` })
        .from(tickets)
        .where(and(
          eq(tickets.eventId, eventId),
          eq(tickets.status, status)
        ));
    } else {
      countPromise = db
        .select({ count: sql<number>`count(*)` })
        .from(tickets)
        .where(eq(tickets.eventId, eventId));
    }
    
    const [results, countResult] = await Promise.all([resultsPromise, countPromise]);
    const totalCount = countResult[0]?.count || 0;
    
    return {
      tickets: results,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        page,
        limit
      }
    };
  } catch (error) {
    console.error('Error fetching event tickets:', error);
    throw new Error('Failed to fetch event tickets');
  }
}


export async function getUserTickets(userId: string) {
  try {
    const userTickets = await db
      .select({
        ticket: {
          id: tickets.id,
          eventId: tickets.eventId,
          orderId: tickets.orderId,
          status: tickets.status,
          qrCode: tickets.qrCode,
          barcode: tickets.barcode,
          isCheckedIn: tickets.isCheckedIn,
        },
        event: {
          title: events.title,
          startDate: events.startDate,
          endDate: events.endDate,
          bannerImage: events.bannerImage,
        },
        category: {
          name: ticketCategories.name
        }
      })
      .from(tickets)
      .innerJoin(events, eq(tickets.eventId, events.id))
      .innerJoin(orders, eq(tickets.orderId, orders.id))
      .leftJoin(ticketCategories, eq(tickets.ticketCategoryId, ticketCategories.id))
      .where(eq(orders.userId, userId))
      .orderBy(desc(events.startDate));
      
    return userTickets;
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    throw new Error('Failed to fetch user tickets');
  }
}


export async function validateTicket(ticketId: number) {
  const hasPermission = await checkTicketManagementPermission();
  if (!hasPermission) {
    throw new Error('Unauthorized: You do not have permission to validate tickets');
  }
  
  try {
    const ticket = await getTicketById(ticketId);
    
    if (!ticket) {
      return { valid: false, message: 'Ticket not found' };
    }
    
    if (ticket.isCheckedIn) {
      return {
        valid: false, 
        message: 'Ticket already used', 
        checkedInAt: ticket.checkedInAt 
      };
    }
    
    if (ticket.status !== 'sold') {
      return { valid: false, message: `Invalid ticket status: ${ticket.status}` };
    }
    
    const event = await db.select().from(events)
      .where(eq(events.id, ticket.eventId))
      .limit(1);
    
    if (!event.length) {
      return { valid: false, message: 'Event not found' };
    }
    
    const currentDate = new Date();
    const eventStart = new Date(event[0].startDate);
    const eventEnd = new Date(event[0].endDate);
    
    if (currentDate > eventEnd) {
      return { valid: false, message: 'Event has ended' };
    }
    
   
    
    return {
      valid: true, 
      message: 'Ticket is valid',
      ticket: {
        id: ticket.id,
        eventId: ticket.eventId,
        eventTitle: event[0].title,
        eventDate: eventStart.toISOString()
      }
    };
  } catch (error) {
    console.error('Error validating ticket:', error);
    throw new Error('Failed to validate ticket');
  }
}

export async function checkInTicket(ticketId: number) {
  const hasPermission = await checkTicketManagementPermission();
  if (!hasPermission) {
    throw new Error('Unauthorized: You do not have permission to check in tickets');
  }
  
  try {
    const validation = await validateTicket(ticketId);
    
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }
    
    await db.update(tickets)
      .set({ 
        isCheckedIn: true, 
        checkedInAt: new Date()
      })
      .where(eq(tickets.id, ticketId));
    
    revalidatePath(`/dashboard/events/${validation.ticket?.eventId}/tickets`);
    return { success: true, message: 'Ticket checked in successfully' };
  } catch (error) {
    console.error('Error checking in ticket:', error);
    throw new Error('Failed to check in ticket');
  }
}


export async function createOrder(orderData: OrderCreationParams) {
  try {
    const orderNumber = `ORD-${Date.now().toString(36)}-${nanoid(6).toUpperCase()}`;
    
    const [newOrder] = await db.insert(orders)
      .values({
        userId: orderData.userId,
        orderNumber: orderNumber,
        total: orderData.total.toString(), 
        status: 'pending',
        orderDate: new Date(),
      })
      .returning();
    
    const ticketsToCreate = orderData.items.flatMap(item => {
      const tickets = [];
      
      for (let i = 0; i < item.quantity; i++) {
        tickets.push({
          eventId: item.eventId,
          ticketCategoryId: item.ticketCategoryId,
          seatId: item.seatId,
          orderId: newOrder.id,
          status: 'reserved' as TicketStatus, 
          price: item.price.toString(), 
          purchaseDate: new Date(),
        });
      }
      
      return tickets;
    });
    
    const createdTickets = [];
    for (const ticketData of ticketsToCreate) {
      const [ticket] = await db.insert(tickets)
        .values(ticketData)
        .returning({ id: tickets.id });
      
      createdTickets.push(ticket);
    }
    
    return {
      success: true,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      ticketIds: createdTickets.map(t => t.id)
    };
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error('Failed to create order');
  }
}


export async function finalizeTicketsAfterPayment(orderId: number) {
  try {
    const orderTickets = await db.select().from(tickets)
      .where(eq(tickets.orderId, orderId));
    
    if (!orderTickets.length) {
      throw new Error('No tickets found for this order');
    }
    
    const ticketUpdates = await Promise.all(orderTickets.map(async (ticket) => {
      const qrData: TicketQRData = {
        ticketId: ticket.id,
        eventId: ticket.eventId,
        orderId: ticket.orderId!,
        ticketCategoryId: ticket.ticketCategoryId!,
        seatId: ticket.seatId ?? null,
        issuedAt: new Date().toISOString(),
      };
      
      const qrCode = generateTicketQR(qrData);
      const barcode = generateTicketBarcode();
      
      return db.update(tickets)
        .set({
          qrCode,
          barcode,
          status: 'sold',
        })
        .where(eq(tickets.id, ticket.id))
        .returning();
    }));
    
    await db.update(orders)
      .set({ status: 'completed' })
      .where(eq(orders.id, orderId));
    
    const updatedTickets = ticketUpdates.flat();
    
    return {
      success: true,
      tickets: updatedTickets
    };
  } catch (error) {
    console.error('Error finalizing tickets:', error);
    throw new Error('Failed to finalize tickets');
  }
}


export async function getAvailableTickets(eventId: number) {
  try {
    const resultsPromise = db
      .select({
        category: ticketCategories,
    })
    .from(ticketCategories)
      .where(eq(ticketCategories.eventId, eventId));
    
    const countPromise = db
      .select({
        categoryId: tickets.ticketCategoryId,
        count: sql<number>`count(*)`.as('ticket_count')
      })
      .from(tickets)
      .where(
        and(
          inArray(tickets.status, ['reserved', 'sold']),
          eq(tickets.eventId, eventId)
        )
      )
      .groupBy(tickets.ticketCategoryId);
      
    const [categories, counts] = await Promise.all([resultsPromise, countPromise]);
    
    const countMap = new Map();
    counts.forEach(item => {
      countMap.set(item.categoryId, item.count);
    });
    
    const now = new Date();
    
    return categories.map(item => {
      const total = Number(item.category.quantity);
      const sold = Number(countMap.get(item.category.id) || 0);
      const available = Math.max(0, total - sold);
      
      const availableFrom = item.category.availableFrom ? new Date(item.category.availableFrom) : null;
      const availableTo = item.category.availableTo ? new Date(item.category.availableTo) : null;
      
      const isAvailableNow = 
        (!availableFrom || now >= availableFrom) &&
        (!availableTo || now <= availableTo);
      
      return {
        ...item.category,
        sold,
        available,
        isAvailableNow,
        hasEnded: availableTo ? now > availableTo : false,
        hasStarted: availableFrom ? now >= availableFrom : true,
      };
    });
  } catch (error) {
    console.error('Error fetching available tickets:', error);
    throw new Error('Failed to fetch available tickets');
  }
}


export async function updateTicketCategory({
  id,
  name,
  description,
  price,
  quantity,
  isVIP,
  isEarlyBird
}: {
  id: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  isVIP?: boolean;
  isEarlyBird?: boolean;
}) {
  const hasPermission = await checkTicketManagementPermission();
  if (!hasPermission) {
    throw new Error('Unauthorized: You do not have permission to update ticket categories');
  }

  try {
    const currentCategory = await db.select()
      .from(ticketCategories)
      .where(eq(ticketCategories.id, id))
      .limit(1);
    
    if (!currentCategory.length) {
      throw new Error('Ticket category not found');
    }
    
    const eventId = currentCategory[0].eventId;
    
    await db.update(ticketCategories)
      .set({
        name,
        description,
        price: price.toString(),
        quantity,
        isVIP: isVIP || false,
        isEarlyBird: isEarlyBird || false,
        updatedAt: new Date()
      })
      .where(eq(ticketCategories.id, id));
    
    revalidatePath(`/dashboard/events/${eventId}`);
    revalidatePath(`/dashboard/events/${eventId}/tickets`);
    
    return { success: true };
  } catch (error) {
    console.error('Error updating ticket category:', error);
    throw new Error('Failed to update ticket category');
  }
}

export async function getTicketCategoriesByEventId(eventId: number) {
  try {
    const categories = await db.select()
      .from(ticketCategories)
      .where(eq(ticketCategories.eventId, eventId))
      .orderBy(desc(ticketCategories.createdAt));
    
    return categories;
  } catch (error) {
    console.error('Error fetching ticket categories for event:', error);
    throw new Error('Failed to fetch ticket categories');
  }
}


export async function deleteTicketCategory(id: number) {
  const hasPermission = await checkTicketManagementPermission();
  if (!hasPermission) {
    throw new Error('Unauthorized: You do not have permission to delete ticket categories');
  }

  try {
    const currentCategory = await db.select()
      .from(ticketCategories)
      .where(eq(ticketCategories.id, id))
      .limit(1);
    
    if (!currentCategory.length) {
      throw new Error('Ticket category not found');
    }
    
    const eventId = currentCategory[0].eventId;

    const associatedTickets = await db.select()
      .from(tickets)
      .where(eq(tickets.ticketCategoryId, id))
      .limit(1);

    if (associatedTickets.length > 0) {
      throw new Error('Cannot delete category with associated tickets');
    }
    
    await db.delete(ticketCategories)
      .where(eq(ticketCategories.id, id));
    
    revalidatePath(`/dashboard/events/${eventId}`);
    revalidatePath(`/dashboard/events/${eventId}/tickets`);
    
    return { success: true, message: 'Ticket category deleted successfully' };
  } catch (error) {
    console.error('Error deleting ticket category:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to delete ticket category');
  }
}


export async function createTicketCategory({
  eventId,
  name,
  description,
  price,
  quantity,
  isVIP,
  isEarlyBird,
  availableFrom,
  availableTo
}: {
  eventId: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  isVIP?: boolean;
  isEarlyBird?: boolean;
  availableFrom: Date;
  availableTo: Date;
}) {
  const hasPermission = await checkTicketManagementPermission();
  if (!hasPermission) {
    throw new Error('Unauthorized: You do not have permission to create ticket categories');
  }

  try {
    const [newCategory] = await db.insert(ticketCategories)
      .values({
        eventId,
        name,
        description,
        price: price.toString(), 
        quantity,
        isVIP: isVIP || false,
        isEarlyBird: isEarlyBird || false,
        availableFrom,
        availableTo,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    revalidatePath(`/dashboard/events/${eventId}`);
    revalidatePath(`/dashboard/events/${eventId}/tickets`);
    
    return { success: true, category: newCategory };
  } catch (error) {
    console.error('Error creating ticket category:', error);
    throw new Error('Failed to create ticket category');
  }
}


export async function getTicketCategoryById(id: number) {
  try {
    const category = await db.select()
      .from(ticketCategories)
      .where(eq(ticketCategories.id, id))
      .limit(1);
    
    if (!category.length) {
      return null;
    }
    
    return category[0];
  } catch (error) {
    console.error('Error fetching ticket category:', error);
    throw new Error('Failed to fetch ticket category');
  }
} 