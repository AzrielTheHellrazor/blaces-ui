// API endpoint for event management
// Handles CRUD operations for events with metadata

import { NextRequest, NextResponse } from 'next/server';

// Mock database - in production, use a real database
const events = new Map<string, Record<string, unknown>>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, duration, creator, paymentTxHash } = body;

    // Validate required fields
    if (!name || !duration || !creator || !paymentTxHash) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate event ID
    const eventId = crypto.randomUUID();
    
    // Calculate expiration time
    const createdAt = Date.now();
    const expiresAt = createdAt + (duration * 60 * 1000); // Convert minutes to milliseconds

    // Create event metadata
    const eventMetadata = {
      eventId,
      name,
      description: description || '',
      duration,
      createdAt,
      expiresAt,
      paymentStatus: 'paid',
      paymentTxHash,
      gameId: eventId, // Use eventId as gameId for now
      creator,
      status: 'active',
    };

    // Store in mock database
    events.set(eventId, eventMetadata);

    return NextResponse.json(eventMetadata);
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const creator = url.searchParams.get('creator');
    
    if (creator) {
      // Get events by creator
      const creatorEvents = Array.from(events.values())
        .filter(event => event.creator === creator);
      return NextResponse.json(creatorEvents);
    }
    
    // Get all events
    const allEvents = Array.from(events.values());
    return NextResponse.json(allEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
