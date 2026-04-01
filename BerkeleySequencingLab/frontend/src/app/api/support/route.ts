import { NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/app/api/_lib/auth';

function normalizeOptionalString(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function POST(request: Request) {
  try {
    const authResult = await requireAuthenticatedUser();

    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { supabase, user } = authResult.context;
    const body = await request.json();
    const subject = normalizeOptionalString(body.subject);
    const message = normalizeOptionalString(body.message);
    const orderId = normalizeOptionalString(body.orderId);

    if (!subject || !message) {
      return NextResponse.json(
        { error: 'subject and message are required' },
        { status: 400 }
      );
    }

    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .insert([
        {
          user_id: user.id,
          order_id: orderId,
          subject,
          status: 'open',
        },
      ])
      .select()
      .single();

    if (ticketError) {
      return NextResponse.json(
        { error: 'Failed to create support ticket', details: ticketError.message },
        { status: 500 }
      );
    }

    const { error: messageError } = await supabase
      .from('support_messages')
      .insert([
        {
          ticket_id: ticket.id,
          sender_id: user.id,
          message,
        },
      ]);

    if (messageError) {
      return NextResponse.json(
        { error: 'Ticket created but first message failed', details: messageError.message, ticketId: ticket.id },
        { status: 500 }
      );
    }

    return NextResponse.json({ ticketId: ticket.id }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
