// Blaces WebSocket Client for real-time pixel updates
// This client connects to the backend WebSocket server for real-time collaboration

import { useState, useEffect } from 'react';
import { blacesAPI, RGBPixel } from './blaces-api-proxy';

export interface WebSocketPixelUpdate {
  x: number;
  y: number;
  pixel: {
    r: number;
    g: number;
    b: number;
  };
}

export interface WebSocketGameInfo {
  gameId: string;
  name: string;
  width: number;
  height: number;
  connectedUsers: number;
}

export interface WebSocketMessage {
  type: 'pixel_update' | 'game_info' | 'user_joined' | 'user_left' | 'error' | 'connected';
  data: WebSocketPixelUpdate | WebSocketGameInfo | string;
}

export class BlacesWebSocketClient {
  private ws: WebSocket | null = null;
  private gameId: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private isConnecting = false;
  private shouldReconnect = true;
  
  // Pixel cache system
  private pixelCache: Map<string, { r: number; g: number; b: number }> = new Map();
  private lastPixelRefresh: number = 0;
  private refreshInterval: number = 15 * 60 * 1000; // 15 minutes in milliseconds
  private refreshTimer: NodeJS.Timeout | null = null;
  
  // Event handlers
  private onPixelUpdate?: (update: WebSocketPixelUpdate) => void;
  private onGameInfo?: (info: WebSocketGameInfo) => void;
  private onUserJoined?: (userId: string) => void;
  private onUserLeft?: (userId: string) => void;
  private onError?: (error: string) => void;
  private onConnected?: () => void;
  private onDisconnected?: () => void;
  private onPixelCacheLoaded?: (cache: Map<string, { r: number; g: number; b: number }>) => void;

  constructor(gameId: string) {
    this.gameId = gameId;
  }

  // Set event handlers
  setOnPixelUpdate(handler: (update: WebSocketPixelUpdate) => void) {
    this.onPixelUpdate = handler;
  }

  setOnGameInfo(handler: (info: WebSocketGameInfo) => void) {
    this.onGameInfo = handler;
  }

  setOnUserJoined(handler: (userId: string) => void) {
    this.onUserJoined = handler;
  }

  setOnUserLeft(handler: (userId: string) => void) {
    this.onUserLeft = handler;
  }

  setOnError(handler: (error: string) => void) {
    this.onError = handler;
  }

  setOnConnected(handler: () => void) {
    this.onConnected = handler;
  }

  setOnDisconnected(handler: () => void) {
    this.onDisconnected = handler;
  }

  setOnPixelCacheLoaded(handler: (cache: Map<string, { r: number; g: number; b: number }>) => void) {
    this.onPixelCacheLoaded = handler;
  }

  // Get pixel from cache
  getPixelFromCache(x: number, y: number): { r: number; g: number; b: number } | null {
    const key = `${x},${y}`;
    return this.pixelCache.get(key) || null;
  }

  // Get all pixels from cache
  getAllPixelsFromCache(): Map<string, { r: number; g: number; b: number }> {
    return new Map(this.pixelCache);
  }

  // Load all pixels from API and populate cache
  async loadAllPixels(): Promise<void> {
    try {
      console.log(`Loading all pixels for event ${this.gameId}...`);
      const gameData = await blacesAPI.getGameData(this.gameId);
      
      // Clear existing cache
      this.pixelCache.clear();
      
      // Populate cache with API data
      gameData.grid.forEach((pixel: RGBPixel, index: number) => {
        const width = gameData.game_info.width;
        const x = index % width;
        const y = Math.floor(index / width);
        const key = `${x},${y}`;
        this.pixelCache.set(key, { r: pixel.r, g: pixel.g, b: pixel.b });
      });
      
      this.lastPixelRefresh = Date.now();
      console.log(`Loaded ${this.pixelCache.size} pixels into cache`);
      
      // Notify listeners that cache is loaded
      this.onPixelCacheLoaded?.(this.pixelCache);
    } catch (error) {
      console.error('Failed to load pixels:', error);
      this.onError?.('Failed to load pixel data');
    }
  }

  // Setup periodic pixel refresh
  private setupPeriodicRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    
    this.refreshTimer = setInterval(() => {
      const now = Date.now();
      if (now - this.lastPixelRefresh >= this.refreshInterval) {
        console.log('Refreshing pixel cache...');
        this.loadAllPixels();
      }
    }, 60000); // Check every minute
  }

  // Update pixel in cache from WebSocket
  private updatePixelInCache(x: number, y: number, pixel: { r: number; g: number; b: number }): void {
    const key = `${x},${y}`;
    this.pixelCache.set(key, pixel);
  }

  // Connect to WebSocket server
  async connect(): Promise<void> {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    this.shouldReconnect = true;

    try {
      // First, load all pixels into cache
      await this.loadAllPixels();
      
      // Setup periodic refresh
      this.setupPeriodicRefresh();
      
      // Get the WebSocket URL from environment or construct it
      const wsUrl = this.getWebSocketUrl();
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        
        // Send game ID to join the game room
        this.send({
          type: 'join_game',
          gameId: this.gameId
        });
        
        this.onConnected?.();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: Record<string, unknown> = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          this.onError?.('Invalid message format received');
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnecting = false;
        this.onDisconnected?.();
        
        if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        // In development, only log to console if backend is not running
        if (process.env.NODE_ENV === 'development') {
          console.warn('WebSocket connection failed - backend may not be running');
        } else {
          console.error('WebSocket error:', error);
          this.onError?.('WebSocket connection error');
        }
        this.isConnecting = false;
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.isConnecting = false;
      this.onError?.('Failed to create WebSocket connection');
    }
  }

  // Disconnect from WebSocket server
  disconnect(): void {
    this.shouldReconnect = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    // Clear refresh timer
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  // Send a message to the server
  send(message: Record<string, unknown>): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Cannot send message:', message);
    }
  }

  // Send pixel update to server
  sendPixelUpdate(x: number, y: number, pixel: { r: number; g: number; b: number }): void {
    this.send({
      type: 'pixel_update',
      gameId: this.gameId,
      x,
      y,
      pixel,
      timestamp: Date.now()
    });
  }

  // Get connection status
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  // Get connection state
  getConnectionState(): string {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'closed';
      default:
        return 'unknown';
    }
  }

  // Private methods
  private getWebSocketUrl(): string {
    // Try to get WebSocket URL from environment variable
    const wsBaseUrl = process.env.NEXT_PUBLIC_WS_URL;
    
    if (wsBaseUrl) {
      return `${wsBaseUrl}/${this.gameId}`;
    }
    
    // Always use the specified WebSocket server for events
    return `wss://blace.thefuture.finance/ws/${this.gameId}`;
  }

  private handleMessage(message: Record<string, unknown>): void {
    // Handle pixel update messages with the new format: {"x":0,"y":0,"pixel":{"r":0,"g":0,"b":0}}
    if (message.x !== undefined && message.y !== undefined && message.pixel) {
      const pixelUpdate: WebSocketPixelUpdate = {
        x: message.x as number,
        y: message.y as number,
        pixel: message.pixel as { r: number; g: number; b: number }
      };
      
      // Update pixel in cache
      this.updatePixelInCache(pixelUpdate.x, pixelUpdate.y, pixelUpdate.pixel);
      
      // Notify listeners
      this.onPixelUpdate?.(pixelUpdate);
    } else if (message.type) {
      // Handle other message types if needed
      switch (message.type) {
        case 'game_info':
          this.onGameInfo?.(message.data as WebSocketGameInfo);
          break;
        case 'user_joined':
          this.onUserJoined?.(message.data as string);
          break;
        case 'user_left':
          this.onUserLeft?.(message.data as string);
          break;
        case 'error':
          this.onError?.(message.data as string);
          break;
        case 'connected':
          console.log('WebSocket server confirmed connection');
          break;
        default:
          console.warn('Unknown WebSocket message type:', message.type);
      }
    } else {
      console.warn('Unknown WebSocket message format:', message);
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
    
    console.log(`Scheduling WebSocket reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (this.shouldReconnect) {
        this.connect();
      }
    }, delay);
  }
}

// Hook for using WebSocket in React components
export function useBlacesWebSocket(gameId: string) {
  const [client, setClient] = useState<BlacesWebSocketClient | null>(null);
  const [connectionState, setConnectionState] = useState<string>('disconnected');
  const [error, setError] = useState<string>('');
  const [pixelCache, setPixelCache] = useState<Map<string, { r: number; g: number; b: number }> | null>(null);

  useEffect(() => {
    const wsClient = new BlacesWebSocketClient(gameId);
    
    // Set up event handlers
    wsClient.setOnConnected(() => {
      setConnectionState('connected');
      setError('');
    });
    
    wsClient.setOnDisconnected(() => {
      setConnectionState('disconnected');
    });
    
    wsClient.setOnError((errorMessage) => {
      setError(errorMessage);
      setConnectionState('error');
    });

    wsClient.setOnPixelCacheLoaded((cache) => {
      setPixelCache(new Map(cache));
    });

    setClient(wsClient);
    
    // Connect (this will load pixels first, then connect WebSocket)
    wsClient.connect();

    // Cleanup on unmount
    return () => {
      wsClient.disconnect();
    };
  }, [gameId]);

  return {
    client,
    connectionState,
    error,
    pixelCache,
    isConnected: client?.isConnected() ?? false
  };
}
