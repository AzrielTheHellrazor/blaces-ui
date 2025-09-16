// Blaces WebSocket Client for real-time pixel updates
// This client connects to the backend WebSocket server for real-time collaboration

import { useState, useEffect } from 'react';

export interface WebSocketPixelUpdate {
  gameId: string;
  x: number;
  y: number;
  pixel: {
    r: number;
    g: number;
    b: number;
  };
  timestamp: number;
  userId?: string;
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
  
  // Event handlers
  private onPixelUpdate?: (update: WebSocketPixelUpdate) => void;
  private onGameInfo?: (info: WebSocketGameInfo) => void;
  private onUserJoined?: (userId: string) => void;
  private onUserLeft?: (userId: string) => void;
  private onError?: (error: string) => void;
  private onConnected?: () => void;
  private onDisconnected?: () => void;

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

  // Connect to WebSocket server
  async connect(): Promise<void> {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    this.shouldReconnect = true;

    try {
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
          const message: WebSocketMessage = JSON.parse(event.data);
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
        console.error('WebSocket error:', error);
        this.isConnecting = false;
        this.onError?.('WebSocket connection error');
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
      return `${wsBaseUrl}/ws`;
    }
    
    // Fallback: construct from current location
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    
    // For development, construct WebSocket URL from current host
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      return `${protocol}//${host}/ws`;
    }
    
    return `${protocol}//${host}/ws`;
  }

  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'pixel_update':
        this.onPixelUpdate?.(message.data as WebSocketPixelUpdate);
        break;
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

    setClient(wsClient);
    
    // Connect
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
    isConnected: client?.isConnected() ?? false
  };
}
