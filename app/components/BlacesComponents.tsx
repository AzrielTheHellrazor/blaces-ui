"use client";

import { useState, useEffect, useRef } from "react";
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

// r/place color palette
const COLORS = [
  '#000000', '#FFFFFF', '#BE0039', '#FF4500', '#FFA800', '#FFD635', '#00A368', '#00CC78', '#7EED56', '#2450A4', '#3690EA', '#51E9F4', '#811E9F', '#B44AC0', '#FF99AA', '#9C6926', '#000000', '#898D90', '#D4D7D9', '#FFFFFF'
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
  const [zoom, setZoom] = useState(1);
  const [selectedPixel, setSelectedPixel] = useState<{row: number, col: number} | null>(null);
  const [showPixelSelector, setShowPixelSelector] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

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

  // Draw canvas whenever pixels, zoom, or pan changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || pixels.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pixelSize = Math.max(2, Math.min(16, 8 * zoom));
    const canvasWidth = 40 * pixelSize;
    const canvasHeight = 40 * pixelSize;

    // Set canvas size
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Apply pan transformation
    ctx.save();
    ctx.translate(pan.x, pan.y);

    // Draw pixels
    pixels.forEach((row, rowIndex) => {
      row.forEach((color, colIndex) => {
        ctx.fillStyle = color;
        ctx.fillRect(
          colIndex * pixelSize,
          rowIndex * pixelSize,
          pixelSize,
          pixelSize
        );
        
        // Draw grid lines if zoomed in enough
        if (pixelSize > 4) {
          ctx.strokeStyle = '#E5E7EB';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(
            colIndex * pixelSize,
            rowIndex * pixelSize,
            pixelSize,
            pixelSize
          );
        }
      });
    });

    ctx.restore();
  }, [pixels, zoom, pan]);

  // Adjust pan when zoom changes to keep canvas within bounds
  useEffect(() => {
    const pixelSize = Math.max(2, Math.min(16, 8 * zoom));
    const canvasWidth = 40 * pixelSize;
    const canvasHeight = 40 * pixelSize;
    const containerWidth = 320;
    const containerHeight = 320;
    
    // Calculate boundaries based on (0,0) being the top-left pixel
    // We want the top-left pixel (0,0) to never go outside the container
    const maxPanX = 0; // Canvas'ın sol kenarı container'ın sol kenarını geçemez
    const maxPanY = 0; // Canvas'ın üst kenarı container'ın üst kenarını geçemez
    const minPanX = Math.min(0, containerWidth - canvasWidth); // Canvas'ın sağ kenarı container'ın sağ kenarını geçemez
    const minPanY = Math.min(0, containerHeight - canvasHeight); // Canvas'ın alt kenarı container'ın alt kenarını geçemez
    
    // Adjust pan to stay within bounds
    const newPanX = Math.max(minPanX, Math.min(maxPanX, pan.x));
    const newPanY = Math.max(minPanY, Math.min(maxPanY, pan.y));
    
    if (newPanX !== pan.x || newPanY !== pan.y) {
      setPan({ x: newPanX, y: newPanY });
    }
  }, [zoom, pan.x, pan.y]);

  // Mouse wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(1, Math.min(8, zoom * delta));
    
    setZoom(newZoom);
  };

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Account for pan offset
    const adjustedX = x - pan.x;
    const adjustedY = y - pan.y;

    const pixelSize = Math.max(2, Math.min(16, 8 * zoom));
    const col = Math.floor(adjustedX / pixelSize);
    const row = Math.floor(adjustedY / pixelSize);

    if (row >= 0 && row < 40 && col >= 0 && col < 40) {
      if (zoom > 1.5) {
        // In zoom mode, select the pixel
        setSelectedPixel({ row, col });
        setShowPixelSelector(true);
      } else {
        // In normal mode, place pixel directly
        const newPixels = pixels.map((r, i) =>
          i === row ? r.map((p, j) => j === col ? selectedColor : p) : r
        );
        setPixels(newPixels);
      }
    }
  };

  // Handle mouse down for panning
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) { // Left mouse button
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle mouse move for panning
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      
      setPan(prevPan => {
        const newX = prevPan.x + deltaX;
        const newY = prevPan.y + deltaY;
        
        // Calculate canvas dimensions
        const pixelSize = Math.max(2, Math.min(16, 8 * zoom));
        const canvasWidth = 40 * pixelSize;
        const canvasHeight = 40 * pixelSize;
        const containerWidth = 320;
        const containerHeight = 320;
        
        // Calculate boundaries based on (0,0) being the top-left pixel
        const maxPanX = 0; // Canvas'ın sol kenarı container'ın sol kenarını geçemez
        const maxPanY = 0; // Canvas'ın üst kenarı container'ın üst kenarını geçemez
        const minPanX = Math.min(0, containerWidth - canvasWidth); // Canvas'ın sağ kenarı container'ın sağ kenarını geçemez
        const minPanY = Math.min(0, containerHeight - canvasHeight); // Canvas'ın alt kenarı container'ın alt kenarını geçemez
        
        return {
          x: Math.max(minPanX, Math.min(maxPanX, newX)),
          y: Math.max(minPanY, Math.min(maxPanY, newY))
        };
      });
      
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle mouse up to stop panning
  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handlePlacePixel = () => {
    if (selectedPixel) {
      const newPixels = pixels.map((r, i) =>
        i === selectedPixel.row ? r.map((p, j) => j === selectedPixel.col ? selectedColor : p) : r
      );
      setPixels(newPixels);
      setSelectedPixel(null);
      setShowPixelSelector(false);
    }
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedPixel(null);
    setShowPixelSelector(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-foreground-muted">Loading canvas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <Card title={`Blaces Canvas - ${eventId}`}>
        <div className="space-y-4">
          {/* Zoom Info */}
          <div className="flex justify-center items-center space-x-2">
            <span className="text-sm font-medium px-2">
              Zoom: {zoom.toFixed(1)}x
            </span>
            {zoom > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetZoom}
                className="h-8 px-2"
              >
                Reset Zoom
              </Button>
            )}
          </div>

          {/* Canvas */}
          <div className="flex justify-center">
            <div 
              className="border border-card-border rounded-lg overflow-hidden bg-white cursor-crosshair"
              onWheel={handleWheel}
              style={{ 
                width: '320px', 
                height: '320px', 
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{
                  display: 'block',
                  cursor: isPanning ? 'grabbing' : 'grab',
                  position: 'absolute',
                  top: 0,
                  left: 0
                }}
              />
            </div>
          </div>

          {/* Selected Pixel Info */}
          {selectedPixel && (
            <div className="text-center p-2 bg-card-bg rounded-lg border border-card-border">
              <div className="text-sm text-foreground-muted">
                Selected Pixel: ({selectedPixel.row + 1}, {selectedPixel.col + 1})
              </div>
              <div className="text-xs text-foreground-muted">
                Current Color: {pixels[selectedPixel.row][selectedPixel.col]}
              </div>
            </div>
          )}

          {/* Color Palette */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 text-center">
              Color Palette
            </label>
            <div className="grid grid-cols-5 gap-2 justify-items-center">
              {COLORS.map((color) => (
                <button
                  key={color}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded border-2 transition-all touch-manipulation ${
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

          {/* Place Pixel Button */}
          {showPixelSelector && selectedPixel && (
            <div className="text-center">
              <Button
                onClick={handlePlacePixel}
                className="w-full h-12"
                icon={<Icon name="check" size="sm" />}
              >
                Place Pixel at ({selectedPixel.row + 1}, {selectedPixel.col + 1})
              </Button>
            </div>
          )}

          {/* Instructions */}
          <div className="text-xs sm:text-sm text-foreground-muted text-center">
            {zoom > 1.5 
              ? "Click on a pixel to select it, then choose a color and click 'Place Pixel'"
              : "Use mouse wheel to zoom in/out. Click on any pixel to change its color."
            }
          </div>
        </div>
      </Card>
    </div>
  );
}
