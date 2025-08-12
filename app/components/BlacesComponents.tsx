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
  '#000000', '#FFFFFF', '#BE0039', '#FF4500', '#FFA800', '#FFD635', '#00A368', '#00CC78', '#7EED56', '#2450A4', '#3690EA', '#51E9F4', '#811E9F', '#B44AC0', '#FF99AA', '#9C6926', '#898D90', '#D4D7D9'
];

export function BlacesHome() {
  return (
    <div className="space-y-4 animate-fade-in w-full">
      <Card title="Blaces - Collaborative Canvas">
        <p className="text-foreground-muted mb-6 text-center text-sm">
          Create or join collaborative pixel art events
        </p>
        
        <div className="space-y-3">
          <Button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/create-event';
              }
            }}
            className="w-full h-12 text-base"
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
            className="w-full h-12 text-base"
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
  const [canvasSize, setCanvasSize] = useState(40);
  const [eventCode, setEventCode] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");

  const handleCreate = async () => {
    if (!eventName.trim()) return;
    
    const code = generateEventCode();
    setEventCode(code);
    
    // Save event metadata including canvas size
    const eventMetadata = {
      name: eventName,
      description: eventDescription,
      canvasSize: canvasSize,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(`blaces-event-${code}`, JSON.stringify(eventMetadata));
    
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
    <div className="space-y-4 animate-fade-in w-full">
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
                className="w-full px-3 py-2 bg-card-bg border border-card-border rounded-lg text-foreground placeholder-foreground-muted focus:outline-none focus:ring-1 focus:ring-accent text-base"
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
                className="w-full px-3 py-2 bg-card-bg border border-card-border rounded-lg text-foreground placeholder-foreground-muted focus:outline-none focus:ring-1 focus:ring-accent resize-none text-base"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Canvas Size
              </label>
              <select
                value={canvasSize}
                onChange={(e) => setCanvasSize(Number(e.target.value))}
                className="w-full px-3 py-2 bg-card-bg border border-card-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent text-base"
              >
                <option value={20}>20x20 (Small)</option>
                <option value={30}>30x30 (Medium)</option>
                <option value={40}>40x40 (Large)</option>
                <option value={50}>50x50 (Extra Large)</option>
              </select>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = '/';
                  }
                }}
                className="flex-1 h-12"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!eventName.trim()}
                className="flex-1 h-12"
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
              <div className="text-xl sm:text-2xl font-mono font-bold text-accent">
                {eventCode}
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-card-border">
              <div className="text-sm text-foreground-muted mb-2">
                QR Code
              </div>
              <div className="w-28 h-28 sm:w-32 sm:h-32 mx-auto flex items-center justify-center">
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
                    className="w-full h-10"
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
                  className="flex-1 px-3 py-2 bg-card-bg border border-card-border rounded-l-lg text-foreground text-xs sm:text-sm"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(eventUrl)}
                  className="rounded-l-none h-10"
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
                className="flex-1 h-12"
              >
                Back to Home
              </Button>
              <Button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = eventUrl;
                  }
                }}
                className="flex-1 h-12"
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
    <div className="space-y-4 animate-fade-in w-full">
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
              className="w-full px-3 py-2 bg-card-bg border border-card-border rounded-lg text-foreground placeholder-foreground-muted focus:outline-none focus:ring-1 focus:ring-accent font-mono text-center text-base sm:text-lg"
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
              className="flex-1 h-12"
            >
              Cancel
            </Button>
            <Button
              onClick={handleJoin}
              disabled={!eventId.trim() || eventId.length !== 8}
              className="flex-1 h-12"
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
  canvasSize?: number; // Default 40 if not provided
};

export function Canvas({ eventId, canvasSize = 40 }: CanvasProps) {
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [pixels, setPixels] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [selectedPixel, setSelectedPixel] = useState<{row: number, col: number} | null>(null);
  const [showPixelSelector, setShowPixelSelector] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [mouseDownPoint, setMouseDownPoint] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<{row: number, col: number} | null>(null);
  const [actualCanvasSize, setActualCanvasSize] = useState(canvasSize);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize canvas with dynamic size
  useEffect(() => {
    // Try to get event metadata to determine canvas size
    const eventMetadata = localStorage.getItem(`blaces-event-${eventId}`);
    let eventCanvasSize = canvasSize;
    
    if (eventMetadata) {
      try {
        const metadata = JSON.parse(eventMetadata);
        eventCanvasSize = metadata.canvasSize || canvasSize;
      } catch (error) {
        console.error('Error parsing event metadata:', error);
      }
    }
    
    setActualCanvasSize(eventCanvasSize);
    console.log(`Canvas size for event ${eventId}: ${eventCanvasSize}x${eventCanvasSize}`);
    
    const savedPixels = localStorage.getItem(`blaces-${eventId}`);
    if (savedPixels) {
      setPixels(JSON.parse(savedPixels));
    } else {
      // Initialize empty canvas
      const emptyCanvas = Array(eventCanvasSize).fill(null).map(() => Array(eventCanvasSize).fill('#FFFFFF'));
      setPixels(emptyCanvas);
    }
    setIsLoading(false);
  }, [eventId, canvasSize]);

  // Save pixels to localStorage whenever they change
  useEffect(() => {
    if (pixels.length > 0) {
      localStorage.setItem(`blaces-${eventId}`, JSON.stringify(pixels));
    }
  }, [pixels, eventId]);

  // Draw canvas whenever pixels, zoom, pan, or selectedPixel changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || pixels.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pixelSize = Math.max(2, Math.min(actualCanvasSize * 2, 8 * zoom));
    const canvasWidth = actualCanvasSize * pixelSize;
    const canvasHeight = actualCanvasSize * pixelSize;

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
        // Check if this is the selected pixel
        const isSelectedPixel = selectedPixel && rowIndex === selectedPixel.row && colIndex === selectedPixel.col;
        
        ctx.fillStyle = color;
        ctx.fillRect(
          colIndex * pixelSize,
          rowIndex * pixelSize,
          pixelSize,
          pixelSize
        );
        
        // Draw grid lines if zoomed in enough (but not for selected pixel)
        if (!isSelectedPixel && pixelSize > 4) {
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

    // Draw black frame around selected pixel (after all pixels are drawn)
    if (selectedPixel) {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeRect(
        selectedPixel.col * pixelSize,
        selectedPixel.row * pixelSize,
        pixelSize,
        pixelSize
      );
    }

    ctx.restore();
  }, [pixels, zoom, pan, selectedPixel, actualCanvasSize]);

  // Adjust pan when zoom changes to keep canvas within bounds
  useEffect(() => {
    const pixelSize = Math.max(2, Math.min(actualCanvasSize * 2, 8 * zoom));
    const canvasWidth = actualCanvasSize * pixelSize;
    const canvasHeight = actualCanvasSize * pixelSize;
    const containerWidth = Math.min(320, actualCanvasSize * 8);
    const containerHeight = Math.min(320, actualCanvasSize * 8);
    
    // Calculate boundaries based on (0,0) being the top-left pixel
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
  }, [zoom, pan.x, pan.y, actualCanvasSize]);

  // Mouse wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(1, Math.min(8, zoom * delta));
    
    setZoom(newZoom);
  };

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Only handle click if mouse hasn't moved (it's a click, not a drag)
    if (hasMoved) {
      setHasMoved(false); // Reset for next interaction
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Account for pan offset
    const adjustedX = x - pan.x;
    const adjustedY = y - pan.y;

    const pixelSize = Math.max(2, Math.min(actualCanvasSize * 2, 8 * zoom));
    
    // Calculate pixel coordinates with proper centering
    const col = Math.floor((adjustedX + pixelSize / 2) / pixelSize);
    const row = Math.floor((adjustedY + pixelSize / 2) / pixelSize);

    if (row >= 0 && row < actualCanvasSize && col >= 0 && col < actualCanvasSize) {
      // Always select pixel regardless of zoom level
      setSelectedPixel({ row, col });
      setShowPixelSelector(true);
    }
    
    // Reset hasMoved for next interaction
    setHasMoved(false);
  };

  // Handle mouse down for panning
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) { // Left mouse button
      setIsPanning(true);
      setHasMoved(false);
      setMouseDownPoint({ x: e.clientX, y: e.clientY });
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle mouse move for panning and cursor tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Track cursor position for coordinate display
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Account for pan offset
      const adjustedX = x - pan.x;
      const adjustedY = y - pan.y;

      const pixelSize = Math.max(2, Math.min(actualCanvasSize * 2, 8 * zoom));
      
      // Calculate pixel coordinates with proper centering
      const col = Math.floor((adjustedX + pixelSize / 2) / pixelSize);
      const row = Math.floor((adjustedY + pixelSize / 2) / pixelSize);

      // Only update cursor position if it's within canvas bounds
      if (row >= 0 && row < actualCanvasSize && col >= 0 && col < actualCanvasSize) {
        setCursorPosition({ row, col });
      } else {
        setCursorPosition(null);
      }
    }

    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      
      // Check if mouse has moved enough to consider it a drag
      const totalDeltaX = e.clientX - mouseDownPoint.x;
      const totalDeltaY = e.clientY - mouseDownPoint.y;
      const moveThreshold = 5; // pixels
      
      if (Math.abs(totalDeltaX) > moveThreshold || Math.abs(totalDeltaY) > moveThreshold) {
        setHasMoved(true);
      }
      
      setPan(prevPan => {
        const newX = prevPan.x + deltaX;
        const newY = prevPan.y + deltaY;
        
        // Calculate canvas dimensions
        const pixelSize = Math.max(2, Math.min(actualCanvasSize * 2, 8 * zoom));
        const canvasWidth = actualCanvasSize * pixelSize;
        const canvasHeight = actualCanvasSize * pixelSize;
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
    // Don't reset hasMoved here - let the click handler decide
  };

  // Handle mouse leave to clear cursor position
  const handleMouseLeave = () => {
    setIsPanning(false);
    setCursorPosition(null);
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
      <Card title={`Blaces Canvas - ${eventId} (${actualCanvasSize}x${actualCanvasSize})`}>
        <div className="space-y-4">
          {/* Zoom Controls */}
          <div className="flex justify-center items-center space-x-2">
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
              className="border border-card-border overflow-hidden bg-white cursor-crosshair"
              onWheel={handleWheel}
              style={{ 
                width: `${Math.min(320, actualCanvasSize * 8)}px`, 
                height: `${Math.min(320, actualCanvasSize * 8)}px`, 
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
                onMouseLeave={handleMouseLeave}
                style={{
                  display: 'block',
                  cursor: isPanning ? 'grabbing' : 'crosshair',
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
                Cursor Position: {cursorPosition ? `(${cursorPosition.row + 1}, ${cursorPosition.col + 1})` : '(0, 0)'}
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
              {COLORS.map((color, index) => (
                <button
                  key={`${color}-${index}`}
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
            Use mouse wheel to zoom in/out. Click on any pixel to select it.
          </div>
        </div>
      </Card>
    </div>
  );
}
