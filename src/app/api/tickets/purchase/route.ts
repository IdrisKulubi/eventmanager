import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import  db  from '@/db/drizzle';
import { tickets, ticketCategories } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { categoryId, quantity, eventId } = body;

    if (!categoryId || !quantity || !eventId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const category = await db.query.ticketCategories.findFirst({
      where: eq(ticketCategories.id, categoryId),
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Ticket category not found' },
        { status: 404 }
      );
    }

    if (category.maxPerOrder !== null && quantity > category.maxPerOrder) {
      return NextResponse.json(
        { error: `Maximum ${category.maxPerOrder} tickets per order` },
        { status: 400 }
      );
    }

    const orderId = Date.now().toString(); 

    const availableTickets = await db
      .select()
      .from(tickets)
      .where(and(
        eq(tickets.ticketCategoryId, categoryId),
        eq(tickets.status, 'available')
      ))
      .limit(quantity);

    if (availableTickets.length < quantity) {
      return NextResponse.json(
        { error: 'Not enough tickets available' },
        { status: 400 }
      );
    }

    const ticketIds = availableTickets.map((ticket: { id: number }) => ticket.id);
    await db
      .update(tickets)
      .set({
        status: 'reserved',
        orderId: Number(orderId),
        purchaseDate: new Date(),
      })
      .where(eq(tickets.id, ticketIds[0]));

    return NextResponse.json({
      orderId,
      message: 'Tickets purchased successfully',
    });
  } catch (error) {
    console.error('Error purchasing tickets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 