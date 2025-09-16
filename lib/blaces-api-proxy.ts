// Blaces API Client using Next.js proxy routes
// This solves the CORS issue by using server-side proxy

export interface RGBPixel {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

export interface GameInfo {
  id: string; // UUID
  name: string;
  width: number;
  height: number;
  created_at: number; // Unix timestamp
}

export interface CreateGameRequest {
  name: string;
  width: number; // minimum 0
  height: number; // minimum 0
}

export interface PutPixelRequest {
  x: number; // 0-based, minimum 0
  y: number; // 0-based, minimum 0
  pixel: RGBPixel;
}

export interface GridData {
  game_info: GameInfo;
  grid: RGBPixel[]; // Vector of pixels in row-major order
}

export class BlacesAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public endpoint: string
  ) {
    super(message);
    this.name = 'BlacesAPIError';
  }
}

export class BlacesAPIProxyClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl; // Use relative URLs for Next.js API routes
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/api/blaces${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new BlacesAPIError(
          errorData.error || `API request failed: ${response.statusText}`,
          response.status,
          endpoint
        );
      }

      // Handle empty responses (like successful pixel placement)
      const contentLength = response.headers.get('content-length');
      const contentType = response.headers.get('content-type');
      
      if (response.status === 200 && (contentLength === '0' || !contentType?.includes('application/json'))) {
        return {} as T;
      }

      // Try to parse JSON, but handle empty responses gracefully
      const text = await response.text();
      if (!text.trim()) {
        return {} as T;
      }
      
      return JSON.parse(text);
    } catch (error) {
      if (error instanceof BlacesAPIError) {
        throw error;
      }
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new BlacesAPIError(
          'Network error: Unable to connect to the server. Please check your internet connection and try again.',
          0,
          endpoint
        );
      }
      
      throw new BlacesAPIError(
        `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
        0,
        endpoint
      );
    }
  }

  /**
   * Get information about all available games
   */
  async getAllGamesInfo(): Promise<GameInfo[]> {
    return this.makeRequest<GameInfo[]>('/games');
  }

  /**
   * Create a new game
   */
  async createGame(request: CreateGameRequest): Promise<GameInfo> {
    return this.makeRequest<GameInfo>('/games', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get information about a specific game
   */
  async getGameInfo(gameId: string): Promise<GameInfo> {
    return this.makeRequest<GameInfo>(`/games/${gameId}/info`);
  }

  /**
   * Get the grid data for a specific game
   */
  async getGameData(gameId: string): Promise<GridData> {
    return this.makeRequest<GridData>(`/games/${gameId}/data`);
  }

  /**
   * Place a pixel on the game grid
   */
  async putPixel(gameId: string, request: PutPixelRequest): Promise<void> {
    await this.makeRequest<void>(`/games/${gameId}/pixels`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get or create a game by name
   * If a game with the given name exists, returns it; otherwise creates a new one
   */
  async getOrCreateGame(name: string, width: number = 20, height: number = 20): Promise<GameInfo> {
    try {
      const allGames = await this.getAllGamesInfo();
      const existingGame = allGames.find(game => game.name === name);
      
      if (existingGame) {
        return existingGame;
      }
    } catch (error) {
      console.warn('Failed to fetch existing games, creating new one:', error);
    }

    return this.createGame({ name, width, height });
  }
}

// Default client instance using proxy
export const blacesAPI = new BlacesAPIProxyClient();
