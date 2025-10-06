// Key-Value Storage System for Event Metadata
// This handles event duration, payment status, and lifecycle management

export interface EventMetadata {
  eventId: string;
  name: string;
  description: string;
  duration: number; // Duration in minutes
  createdAt: number; // Unix timestamp
  expiresAt: number; // Unix timestamp when event expires
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentTxHash?: string;
  gameId: string;
  creator: string; // Wallet address
  status: 'active' | 'expired' | 'minting' | 'completed';
  nftContractAddress?: string;
  ipfsHash?: string;
}

export interface CreateEventRequest {
  name: string;
  description: string;
  duration: number; // Duration in minutes
  creator: string; // Wallet address
  paymentTxHash: string;
}

export interface UpdateEventRequest {
  eventId: string;
  status?: 'active' | 'expired' | 'minting' | 'completed';
  nftContractAddress?: string;
  ipfsHash?: string;
}

export class EventStorage {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    if (baseUrl) {
      this.baseUrl = baseUrl;
    } else if (process.env.NEXT_PUBLIC_EVENTS_API_BASE_URL) {
      // Use dedicated EVENTS API base if provided
      this.baseUrl = process.env.NEXT_PUBLIC_EVENTS_API_BASE_URL;
    } else {
      // Default to same-origin for Next.js app routes
      this.baseUrl = '';
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `API request failed: ${response.statusText} (URL: ${url})`
        );
      }

      const contentLength = response.headers.get('content-length');
      const contentType = response.headers.get('content-type');
      
      if (response.status === 200 && (contentLength === '0' || !contentType?.includes('application/json'))) {
        return {} as T;
      }

      const text = await response.text();
      if (!text.trim()) {
        return {} as T;
      }
      
      return JSON.parse(text);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error(
          'Network error: Unable to connect to the server. Please check your internet connection and try again.'
        );
      }
      
      throw new Error(
        `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Create a new event with metadata
   */
  async createEvent(request: CreateEventRequest): Promise<EventMetadata> {
    return this.makeRequest<EventMetadata>('/api/events', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get event metadata by ID
   */
  async getEvent(eventId: string): Promise<EventMetadata> {
    return this.makeRequest<EventMetadata>(`/api/events/${eventId}`);
  }

  /**
   * Update event metadata
   */
  async updateEvent(request: UpdateEventRequest): Promise<EventMetadata> {
    return this.makeRequest<EventMetadata>(`/api/events/${request.eventId}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get all events by creator
   */
  async getEventsByCreator(creator: string): Promise<EventMetadata[]> {
    return this.makeRequest<EventMetadata[]>(`/api/events/creator/${creator}`);
  }

  /**
   * Check if event is expired
   */
  async isEventExpired(eventId: string): Promise<boolean> {
    const event = await this.getEvent(eventId);
    return Date.now() > event.expiresAt;
  }

  /**
   * Get events that need status updates (expired events)
   */
  async getExpiredEvents(): Promise<EventMetadata[]> {
    return this.makeRequest<EventMetadata[]>('/api/events/expired');
  }
}

// Default storage instance
export const eventStorage = new EventStorage();

