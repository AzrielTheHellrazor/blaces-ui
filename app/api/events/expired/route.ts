// API endpoint for expired events
// Returns events that have passed their expiration time

import { NextResponse } from 'next/server';

// Mock database - in production, use a real database
const events = new Map<string, Record<string, unknown>>();

export async function GET() {
  try {
    const now = Date.now();
    
    // Find expired events
    const expiredEvents = Array.from(events.values())
      .filter(event => {
        const isExpired = now > (event.expiresAt as number);
        const isNotCompleted = event.status !== 'completed';
        return isExpired && isNotCompleted;
      });
    
    return NextResponse.json(expiredEvents);
  } catch (error) {
    console.error('Error fetching expired events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
