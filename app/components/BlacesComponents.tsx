"use client";

import { useState, useEffect } from "react";
import { Button } from "./DemoComponents";
import { Icon } from "./DemoComponents";
import { Card } from "./DemoComponents";
import QRCode from "qrcode";

// Utility function to generate random event code
function generateEventCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Color palette for the canvas
const COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', 
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#008000', '#FFC0CB', '#A52A2A', '#808080', '#FFD700'
];



export function BlacesHome() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card title="Blaces - Collaborative Canvas">
        <p className="text-foreground-muted mb-6 text-center">
          Create or join collaborative pixel art events
        </p>
        
        <div className="space-y-4">
          <Button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/create-event';
              }
            }}
            className="w-full"
            icon={<Icon name="plus" size="sm" />}
          >
            Create Event
          </Button>
          
          <Button
            variant="outline"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/join-event';
              }
            }}
            className="w-full"
            icon={<Icon name="arrow-right" size="sm" />}
          >
            Join Event
          </Button>
        </div>
      </Card>
    </div>
  );
}



export function CreateEvent() {
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventCode, setEventCode] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");

  const handleCreate = async () => {
    if (!eventName.trim()) return;
    
    const code = generateEventCode();
    setEventCode(code);
    
    // Generate QR code
    try {
      const eventUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/event/${code}`;
      const qrDataUrl = await QRCode.toDataURL(eventUrl, {
        width: 128,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
    
    setShowQR(true);
  };

  const eventUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/event/${eventCode}`;

  return (
    <div className="space-y-6 animate-fade-in">
      {!showQR ? (
        <Card title="Create New Event">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Event Name
              </label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Enter event name..."
                className="w-full px-3 py-2 bg-card-bg border border-card-border rounded-lg text-foreground placeholder-foreground-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Event Description
              </label>
              <textarea
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="Enter event description..."
                rows={3}
                className="w-full px-3 py-2 bg-card-bg border border-card-border rounded-lg text-foreground placeholder-foreground-muted focus:outline-none focus:ring-1 focus:ring-accent resize-none"
              />
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = '/';
                  }
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!eventName.trim()}
                className="flex-1"
              >
                Create
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card title="Event Created!">
          <div className="space-y-4 text-center">
            <div className="bg-card-bg p-4 rounded-lg border border-card-border">
              <div className="text-sm text-foreground-muted mb-1">
                Event ID:
              </div>
              <div className="text-2xl font-mono font-bold text-accent">
                {eventCode}
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-card-border">
              <div className="text-sm text-foreground-muted mb-2">
                QR Code
              </div>
              <div className="w-32 h-32 mx-auto flex items-center justify-center">
                {qrCodeDataUrl ? (
                  <img 
                    src={qrCodeDataUrl} 
                    alt="QR Code" 
                    className="w-full h-full"
                  />
                ) : (
                  <div className="text-xs text-gray-500">Generating QR Code...</div>
                )}
              </div>
              {qrCodeDataUrl && (
                <div className="mt-2 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = qrCodeDataUrl;
                      link.download = `blaces-event-${eventCode}.png`;
                      link.click();
                    }}
                    className="w-full"
                  >
                    Download QR Code
                  </Button>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Shareable Link
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={eventUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-card-bg border border-card-border rounded-l-lg text-foreground text-sm"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(eventUrl)}
                  className="rounded-l-none"
                >
                  Copy
                </Button>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = '/';
                  }
                }}
                className="flex-1"
              >
                Back to Home
              </Button>
              <Button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = eventUrl;
                  }
                }}
                className="flex-1"
              >
                Join Event
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}



export function JoinEvent() {
  const [eventId, setEventId] = useState("");

  const handleJoin = () => {
    if (!eventId.trim()) return;
    if (typeof window !== 'undefined') {
      window.location.href = `/event/${eventId.trim()}`;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card title="Join Event">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Event ID
            </label>
            <input
              type="text"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              placeholder="Enter 8-character event code..."
              maxLength={8}
              className="w-full px-3 py-2 bg-card-bg border border-card-border rounded-lg text-foreground placeholder-foreground-muted focus:outline-none focus:ring-1 focus:ring-accent font-mono text-center text-lg"
            />
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/';
                }
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleJoin}
              disabled={!eventId.trim() || eventId.length !== 8}
              className="flex-1"
            >
              Join Event
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

type CanvasProps = {
  eventId: string;
};

export function Canvas({ eventId }: CanvasProps) {
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [pixels, setPixels] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize canvas with 40x40 pixels for better performance
  useEffect(() => {
    const savedPixels = localStorage.getItem(`blaces-${eventId}`);
    if (savedPixels) {
      setPixels(JSON.parse(savedPixels));
    } else {
      // Initialize empty canvas
      const emptyCanvas = Array(40).fill(null).map(() => Array(40).fill('#FFFFFF'));
      setPixels(emptyCanvas);
    }
    setIsLoading(false);
  }, [eventId]);

  // Save pixels to localStorage whenever they change
  useEffect(() => {
    if (pixels.length > 0) {
      localStorage.setItem(`blaces-${eventId}`, JSON.stringify(pixels));
    }
  }, [pixels, eventId]);

  const handlePixelClick = (row: number, col: number) => {
    const newPixels = pixels.map((r, i) =>
      i === row ? r.map((p, j) => j === col ? selectedColor : p) : r
    );
    setPixels(newPixels);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-foreground-muted">Loading canvas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card title={`Blaces Canvas - ${eventId}`}>
        <div className="space-y-4">
          {/* Canvas */}
          <div className="flex justify-center">
            <div className="border border-card-border rounded-lg overflow-hidden">
              <div className="grid grid-cols-40 gap-0">
                {pixels.map((row, rowIndex) =>
                  row.map((color, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className="w-2 h-2 bg-current cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ color: color }}
                      onClick={() => handlePixelClick(rowIndex, colIndex)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Color Palette */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Color Palette
            </label>
            <div className="grid grid-cols-5 gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded border-2 transition-all ${
                    selectedColor === color
                      ? 'border-accent scale-110'
                      : 'border-card-border hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="text-sm text-foreground-muted text-center">
            Click on any pixel to change its color. Your changes are saved locally.
          </div>
        </div>
      </Card>
    </div>
  );
}
