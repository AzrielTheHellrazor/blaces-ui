// API endpoint for individual event operations
// Handles GET, PUT, DELETE for specific events

import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

// Mock database - in production, use a real database
const events = new Map<string, Record<string, unknown>>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    // First, try to return creator if requested explicitly
    const url = new URL(request.url);
    const field = url.searchParams.get('field');
    if (field === 'creator') {
      if (!redis) {
        return NextResponse.json({ error: 'Redis not configured' }, { status: 500 });
      }
      const creator = await redis.get<string>(`blaces:event:creator:${eventId}`);
      if (!creator) {
        return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
      }
      return NextResponse.json({ eventId, creator });
    }

    const event = events.get(eventId);
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const body = await request.json();
    const { status, nftContractAddress, ipfsHash, caller } = body;
    
    const event = events.get(eventId);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // If IPFS/NFT update is requested, verify caller is the creator via Redis
    if ((nftContractAddress || ipfsHash) && redis) {
      const creator = await redis.get<string>(`blaces:event:creator:${eventId}`);
      if (!creator) {
        return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
      }
      if (!caller || creator.toLowerCase() !== String(caller).toLowerCase()) {
        return NextResponse.json({ error: 'Only event creator can finalize' }, { status: 403 });
      }
    }

    // Update event
    const updatedEvent = {
      ...event,
      ...(status && { status }),
      ...(nftContractAddress && { nftContractAddress }),
      ...(ipfsHash && { ipfsHash }),
    };
    
    events.set(eventId, updatedEvent);
    
    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const event = events.get(eventId);
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    events.delete(eventId);

    // Remove (eventId => creator) mapping from Redis if available
    try {
      if (redis) {
        const key = `blaces:event:creator:${eventId}`;
        await redis.del(key);
      }
    } catch (e) {
      // Non-fatal: log and continue
      console.warn('Failed to delete event creator from Redis:', e);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
