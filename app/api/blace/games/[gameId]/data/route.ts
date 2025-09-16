// Next.js API route to proxy Blace API game data requests
import { NextRequest, NextResponse } from 'next/server';

const BLACE_API_BASE = process.env.API_BASE_URL;

if (!BLACE_API_BASE) {
  throw new Error('API_BASE_URL environment variable is required');
}

// Disable SSL verification for this process
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function makeRequest(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return response;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    
    const response = await makeRequest(`${BLACE_API_BASE}/api/games/${gameId}/data`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Game data not found' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching game data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
