// Next.js API route to proxy Blace API pixel placement requests
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const body = await request.json();
    
    const response = await makeRequest(`${BLACE_API_BASE}/api/games/${gameId}/pixels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to place pixel' },
        { status: response.status }
      );
    }

    // Return empty response for successful pixel placement
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Error placing pixel:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
