"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "./DemoComponents";
import { Icon } from "./DemoComponents";
import { Card } from "./DemoComponents";
import QRCode from "qrcode";
// import { ImageUpload } from "./ImageUpload"; // Simplified upload system

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
  const [eventCode, setEventCode] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");

  const handleCreate = async () => {
    if (!eventName.trim()) return;
    
    const code = generateEventCode();
    setEventCode(code);
    
    // Save event metadata with fixed canvas size
    const eventMetadata = {
      name: eventName,
      description: eventDescription,
      canvasSize: 200, // Fixed canvas size
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(`blaces-event-${code}`, JSON.stringify(eventMetadata));
    
    // Generate QR code
    try {
      // Use correct Farcaster mini app URL format
      const farcasterUrl = `https://farcaster.xyz/miniapps/nJEe4IGqnsUT/blaces/event/${code}`;
      const qrDataUrl = await QRCode.toDataURL(farcasterUrl, {
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

  const eventUrl = `https://farcaster.xyz/miniapps/nJEe4IGqnsUT/blaces/event/${eventCode}`;

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
              <div className="w-full px-3 py-2 bg-card-bg border border-card-border rounded-lg text-foreground text-base">
                200x200 (Fixed Size)
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
};

export function Canvas({ eventId }: CanvasProps) {
  const CANVAS_SIZE = 200; // Fixed canvas size
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [pixels, setPixels] = useState<string[][]>([]);
  const [silhouetteOverlay, setSilhouetteOverlay] = useState<string[][]>([]);
  const [silhouettePosition, setSilhouettePosition] = useState({ x: 0, y: 0 });
  const [showSilhouette, setShowSilhouette] = useState(false);
  const [showMatchingFeedback, setShowMatchingFeedback] = useState(false);
  const [isDraggingSilhouette, setIsDraggingSilhouette] = useState(false);
  const [isSilhouetteLocked, setIsSilhouetteLocked] = useState(false);
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
  const [touchDistance, setTouchDistance] = useState<number | null>(null);
  const [touchCenter, setTouchCenter] = useState<{x: number, y: number} | null>(null);
  
  // Drag offset for silhouette dragging
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastDrawnPixels = useRef<Map<string, string>>(new Map()); // Track last drawn pixel colors

  // Viewport and pixel size helpers to guarantee full canvas visible at zoom = 1
  const VIEWPORT_SIZE = 320;
  const getMinPixelSize = useCallback(() => VIEWPORT_SIZE / CANVAS_SIZE, []);
  const getMaxPixelSize = useCallback(() => VIEWPORT_SIZE / 5, []);
  const getPixelSize = useCallback((z: number) => {
    const min = getMinPixelSize();
    const max = getMaxPixelSize();
    const desired = min * z;
    return Math.max(min, Math.min(max, desired));
  }, [getMinPixelSize, getMaxPixelSize]);
  const getMaxZoom = useCallback(() => getMaxPixelSize() / getMinPixelSize(), [getMaxPixelSize, getMinPixelSize]);

  // Initialize canvas with fixed size
  useEffect(() => {
    console.log(`Canvas size for event ${eventId}: ${CANVAS_SIZE}x${CANVAS_SIZE}`);
    
    const savedPixels = localStorage.getItem(`blaces-${eventId}`);
    if (savedPixels) {
      setPixels(JSON.parse(savedPixels));
    } else {
      // Initialize empty canvas
      const emptyCanvas = Array(CANVAS_SIZE).fill(null).map(() => Array(CANVAS_SIZE).fill('#FFFFFF'));
      setPixels(emptyCanvas);
    }
    setIsLoading(false);
  }, [eventId]);

  // Save pixels to localStorage with debouncing
  useEffect(() => {
    if (pixels.length > 0) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem(`blaces-${eventId}`, JSON.stringify(pixels));
      }, 1000); // Save after 1 second of no changes
      
      return () => clearTimeout(timeoutId);
    }
  }, [pixels, eventId]);

  // Optimized pixel drawing - only draw changed pixels
  const drawPixel = useCallback((row: number, col: number, color: string, ctx: CanvasRenderingContext2D, pixelSize: number) => {
    const pixelKey = `${row}-${col}`;
    const lastColor = lastDrawnPixels.current.get(pixelKey);
    
    // Only draw if color changed or pixel not drawn before
    if (lastColor !== color) {
      ctx.fillStyle = color;
      ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);
      lastDrawnPixels.current.set(pixelKey, color);
    }
  }, []);

  // Draw canvas with optimized rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || pixels.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pixelSize = getPixelSize(zoom);
    const canvasWidth = CANVAS_SIZE * pixelSize;
    const canvasHeight = CANVAS_SIZE * pixelSize;

    // Set canvas size
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear canvas and reset last drawn pixels on zoom/pan change
    if (zoom !== 1 || pan.x !== 0 || pan.y !== 0) {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      lastDrawnPixels.current.clear();
    }

    ctx.save();

    // Draw only changed pixels
    pixels.forEach((row, rowIndex) => {
      if (row && Array.isArray(row)) {
        row.forEach((color, colIndex) => {
          if (color) {
            drawPixel(rowIndex, colIndex, color, ctx, pixelSize);
          }
        });
      }
    });
    
    // Draw feedback and borders separately for better performance
    if (showMatchingFeedback && silhouetteOverlay.length > 0) {
      pixels.forEach((row, rowIndex) => {
        if (row && Array.isArray(row)) {
          row.forEach((color, colIndex) => {
            if (color) {
              const isCorrect = isPixelCorrect(rowIndex, colIndex);
              if (isCorrect) {
                ctx.strokeStyle = '#10B981';
                ctx.lineWidth = 2;
                ctx.strokeRect(
                  colIndex * pixelSize,
                  rowIndex * pixelSize,
                  pixelSize,
                  pixelSize
                );
              } else if (color !== '#FFFFFF') {
                ctx.strokeStyle = '#EF4444';
                ctx.lineWidth = 2;
                ctx.strokeRect(
                  colIndex * pixelSize,
                  rowIndex * pixelSize,
                  pixelSize,
                  pixelSize
                );
              }
            }
          });
        }
      });
    }
    
    // Draw grid lines only when needed
    if (pixelSize > 4 && !showMatchingFeedback) {
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 0.5;
      
      // Draw grid lines in batches
      for (let i = 0; i <= CANVAS_SIZE; i++) {
        const pos = i * pixelSize;
        // Vertical lines
        ctx.beginPath();
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, canvasHeight);
        ctx.stroke();
        // Horizontal lines
        ctx.beginPath();
        ctx.moveTo(0, pos);
        ctx.lineTo(canvasWidth, pos);
        ctx.stroke();
      }
    }



    // Draw silhouette overlay if enabled and available (for backward compatibility)
    if (showSilhouette && silhouetteOverlay.length > 0) {
      // Fixed silhouette size (25x25)
      const silhouetteSize = 25;
      const startX = silhouettePosition.x;
      const startY = silhouettePosition.y;
      
      // Draw silhouette border if dragging or locked
      if (isDraggingSilhouette) {
        ctx.strokeStyle = '#FF6B6B';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          startX * pixelSize - 2,
          startY * pixelSize - 2,
          silhouetteSize * pixelSize + 4,
          silhouetteSize * pixelSize + 4
        );
      } else if (isSilhouetteLocked) {
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 1;
        ctx.strokeRect(
          startX * pixelSize - 1,
          startY * pixelSize - 1,
          silhouetteSize * pixelSize + 2,
          silhouetteSize * pixelSize + 2
        );
      }
      
      silhouetteOverlay.forEach((row, rowIndex) => {
        row.forEach((color, colIndex) => {
          if (rowIndex < silhouetteSize && colIndex < silhouetteSize) {
            // Draw silhouette as semi-transparent overlay
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = color;
            ctx.fillRect(
              (startX + colIndex) * pixelSize,
              (startY + rowIndex) * pixelSize,
              pixelSize,
              pixelSize
            );
            ctx.globalAlpha = 1.0;
          }
        });
      });
    }

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
  }, [pixels, zoom, pan, selectedPixel, CANVAS_SIZE, getPixelSize, silhouettePosition, isDraggingSilhouette, isSilhouetteLocked, drawPixel, showMatchingFeedback, showSilhouette, silhouetteOverlay]);

  // Adjust pan when zoom changes to keep canvas within bounds
  useEffect(() => {
    const pixelSize = getPixelSize(zoom);
    const canvasWidth = CANVAS_SIZE * pixelSize;
    const canvasHeight = CANVAS_SIZE * pixelSize;
    
    // If zoom is 1, center the canvas within the 320x320 viewport
    if (zoom === 1) {
      const viewportWidth = 320;
      const viewportHeight = 320;
      const centerX = (viewportWidth - canvasWidth) / 2;
      const centerY = (viewportHeight - canvasHeight) / 2;
      setPan({ x: centerX, y: centerY });
      return;
    }
    
    // For other zoom levels, ensure canvas stays within bounds
    const viewportWidth = 320;
    const viewportHeight = 320;
    
    // Calculate boundaries to keep canvas within viewport
    const maxPanX = Math.max(0, viewportWidth - canvasWidth);
    const maxPanY = Math.max(0, viewportHeight - canvasHeight);
    const minPanX = Math.min(0, viewportWidth - canvasWidth);
    const minPanY = Math.min(0, viewportHeight - canvasHeight);

    const newPanX = Math.max(minPanX, Math.min(maxPanX, pan.x));
    const newPanY = Math.max(minPanY, Math.min(maxPanY, pan.y));

    if (newPanX !== pan.x || newPanY !== pan.y) {
      setPan({ x: newPanX, y: newPanY });
    }
  }, [zoom, pan.x, pan.y, CANVAS_SIZE, getPixelSize]);

  // Mouse wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    // Only allow zoom when not panning
    if (isPanning) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const maxZoom = getMaxZoom();
    const newZoom = Math.max(1, Math.min(maxZoom, zoom * delta));

    // Compute pan so the world point under cursor stays under cursor
    const oldPixel = getPixelSize(zoom);
    const newPixel = getPixelSize(newZoom);
    const worldX = (mouseX - pan.x) / oldPixel;
    const worldY = (mouseY - pan.y) / oldPixel;
    const newPanX = mouseX - worldX * newPixel;
    const newPanY = mouseY - worldY * newPixel;
    
    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
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

    // No need to account for pan offset since we're using CSS transform
    const adjustedX = x;
    const adjustedY = y;

    const pixelSize = getPixelSize(zoom);
    
    // Calculate pixel coordinates based on pixel boundaries
    const col = Math.floor(adjustedX / pixelSize);
    const row = Math.floor(adjustedY / pixelSize);

    if (row >= 0 && row < CANVAS_SIZE && col >= 0 && col < CANVAS_SIZE) {
      // Always select pixel regardless of zoom level
      setSelectedPixel({ row, col });
      setShowPixelSelector(true);
    }
    
    // Reset hasMoved for next interaction
    setHasMoved(false);
  };

  // Handle mouse down for panning and image dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) { // Left mouse button
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const adjustedX = x;
      const adjustedY = y;



      // Check if clicking on silhouette overlay
      if (showSilhouette && silhouetteOverlay.length > 0 && !isSilhouetteLocked) {
        const pixelSize = getPixelSize(zoom);
        const silhouetteSize = 25; // Fixed 25x25 size
        const silhouetteX = silhouettePosition.x * pixelSize;
        const silhouetteY = silhouettePosition.y * pixelSize;
        const silhouetteWidth = silhouetteSize * pixelSize;
        const silhouetteHeight = silhouetteSize * pixelSize;
        
        if (adjustedX >= silhouetteX && adjustedX <= silhouetteX + silhouetteWidth &&
            adjustedY >= silhouetteY && adjustedY <= silhouetteY + silhouetteHeight) {
          // Start dragging the silhouette
          setIsDraggingSilhouette(true);
          setDragOffset({
            x: adjustedX - silhouettePosition.x * pixelSize,
            y: adjustedY - silhouettePosition.y * pixelSize
          });
          return;
        }
      }

      // If not clicking on an image, start panning
      setIsPanning(true);
      setHasMoved(false);
      setMouseDownPoint({ x: e.clientX, y: e.clientY });
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle mouse move for panning, cursor tracking, and image dragging
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const adjustedX = x;
    const adjustedY = y;



    // Handle silhouette dragging
    if (isDraggingSilhouette) {
      const pixelSize = getPixelSize(zoom);
      const newX = (adjustedX - dragOffset.x) / pixelSize;
      const newY = (adjustedY - dragOffset.y) / pixelSize;
      
      // Constrain silhouette to canvas bounds
      const silhouetteSize = 25; // Fixed 25x25 size
      const constrainedX = Math.max(0, Math.min(CANVAS_SIZE - silhouetteSize, newX));
      const constrainedY = Math.max(0, Math.min(CANVAS_SIZE - silhouetteSize, newY));
      
      // Snap to pixel grid while dragging
      const snappedX = Math.round(constrainedX);
      const snappedY = Math.round(constrainedY);
      
      setSilhouettePosition({ x: snappedX, y: snappedY });
      return;
    }

    // Track cursor position for coordinate display (only when not panning)
    if (!isPanning) {
      const pixelSize = getPixelSize(zoom);
      
      // Calculate pixel coordinates based on pixel boundaries
      const col = Math.floor(adjustedX / pixelSize);
      const row = Math.floor(adjustedY / pixelSize);

      // Only update cursor position if it's within canvas bounds
      if (row >= 0 && row < CANVAS_SIZE && col >= 0 && col < CANVAS_SIZE) {
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
        const pixelSize = getPixelSize(zoom);
        const canvasWidth = CANVAS_SIZE * pixelSize;
        const canvasHeight = CANVAS_SIZE * pixelSize;
        const viewportWidth = 320;
        const viewportHeight = 320;
        
        // Calculate boundaries to keep canvas within viewport
        const maxPanX = Math.max(0, viewportWidth - canvasWidth);
        const maxPanY = Math.max(0, viewportHeight - canvasHeight);
        const minPanX = Math.min(0, viewportWidth - canvasWidth);
        const minPanY = Math.min(0, viewportHeight - canvasHeight);
        
        return {
          x: Math.max(minPanX, Math.min(maxPanX, newX)),
          y: Math.max(minPanY, Math.min(maxPanY, newY))
        };
      });
      
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle mouse up to stop panning and silhouette dragging
  const handleMouseUp = () => {
    // Stop silhouette dragging and snap to pixel grid
    if (isDraggingSilhouette) {
      // Snap silhouette to pixel grid - align top-left corner to pixel boundary
      const currentX = silhouettePosition.x;
      const currentY = silhouettePosition.y;
      
      // Round to nearest pixel boundary
      const snappedX = Math.round(currentX);
      const snappedY = Math.round(currentY);
      
      setSilhouettePosition({ x: snappedX, y: snappedY });
      setIsDraggingSilhouette(false);
      setDragOffset({ x: 0, y: 0 });
    }
    
    setIsPanning(false);
    // Don't reset hasMoved here - let the click handler decide
  };

  // Handle mouse leave to clear cursor position
  const handleMouseLeave = () => {
    setIsPanning(false);
    setCursorPosition(null);
  };

  // Optimized touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 2) {
      // Two finger touch - prepare for zoom only
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      
      setTouchDistance(distance);
      setTouchCenter({ x: centerX, y: centerY });
      setIsPanning(false); // Disable panning during zoom
    } else if (e.touches.length === 1) {
      // Single finger touch - handle panning only
      const touch = e.touches[0];
      
      // Check if touching on image or silhouette first
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        

        
        // Check for silhouette touch
        if (showSilhouette && silhouetteOverlay.length > 0 && !isSilhouetteLocked) {
          const pixelSize = getPixelSize(zoom);
          const silhouetteSize = 25; // Fixed 25x25 size
          const silhouetteX = silhouettePosition.x * pixelSize;
          const silhouetteY = silhouettePosition.y * pixelSize;
          const silhouetteWidth = silhouetteSize * pixelSize;
          const silhouetteHeight = silhouetteSize * pixelSize;
          
          if (x >= silhouetteX && x <= silhouetteX + silhouetteWidth &&
              y >= silhouetteY && y <= silhouetteY + silhouetteHeight) {
            setIsDraggingSilhouette(true);
            setDragOffset({
              x: x - silhouettePosition.x * pixelSize,
              y: y - silhouettePosition.y * pixelSize
            });
            return;
          }
        }
      }
      
      // If not touching interactive elements, start panning
      setIsPanning(true);
      setHasMoved(false);
      setMouseDownPoint({ x: touch.clientX, y: touch.clientY });
      setLastPanPoint({ x: touch.clientX, y: touch.clientY });
      setTouchDistance(null);
      setTouchCenter(null);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    

    
    // Handle silhouette dragging on touch
    if (isDraggingSilhouette) {
      const touch = e.touches[0];
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        const pixelSize = getPixelSize(zoom);
        const newX = (x - dragOffset.x) / pixelSize;
        const newY = (y - dragOffset.y) / pixelSize;
        
        const silhouetteSize = 25; // Fixed 25x25 size
        const constrainedX = Math.max(0, Math.min(CANVAS_SIZE - silhouetteSize, newX));
        const constrainedY = Math.max(0, Math.min(CANVAS_SIZE - silhouetteSize, newY));
        
        const snappedX = Math.round(constrainedX);
        const snappedY = Math.round(constrainedY);
        
        setSilhouettePosition({ x: snappedX, y: snappedY });
      }
      return;
    }
    
    if (e.touches.length === 2 && touchDistance && touchCenter && !isPanning) {
      // Two finger touch - handle zoom only (when not panning)
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      const newDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      const scale = newDistance / touchDistance;
      const maxZoom = getMaxZoom();
      const newZoom = Math.max(1, Math.min(maxZoom, zoom * scale));
      
      // Calculate zoom center
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = touchCenter.x - rect.left;
        const mouseY = touchCenter.y - rect.top;
        
        // Compute pan so the world point under pinch center stays fixed
        const oldPixel = getPixelSize(zoom);
        const newPixel = getPixelSize(newZoom);
        const worldX = (mouseX - pan.x) / oldPixel;
        const worldY = (mouseY - pan.y) / oldPixel;
        const newPanX = mouseX - worldX * newPixel;
        const newPanY = mouseY - worldY * newPixel;
        
        setZoom(newZoom);
        setPan({ x: newPanX, y: newPanY });
      }
      
      setTouchDistance(newDistance);
    } else if (e.touches.length === 1 && isPanning && !touchDistance) {
      // Single finger touch - handle panning only (no zoom, no touch distance)
      const touch = e.touches[0];
      const deltaX = touch.clientX - lastPanPoint.x;
      const deltaY = touch.clientY - lastPanPoint.y;
      
      const totalDeltaX = touch.clientX - mouseDownPoint.x;
      const totalDeltaY = touch.clientY - mouseDownPoint.y;
      const moveThreshold = 5;
      
      if (Math.abs(totalDeltaX) > moveThreshold || Math.abs(totalDeltaY) > moveThreshold) {
        setHasMoved(true);
      }
      
      setPan(prevPan => {
        const newX = prevPan.x + deltaX;
        const newY = prevPan.y + deltaY;
        
        const pixelSize = getPixelSize(zoom);
        const canvasWidth = CANVAS_SIZE * pixelSize;
        const canvasHeight = CANVAS_SIZE * pixelSize;
        const viewportWidth = 320;
        const viewportHeight = 320;
        
        // Calculate boundaries to keep canvas within viewport
        const maxPanX = Math.max(0, viewportWidth - canvasWidth);
        const maxPanY = Math.max(0, viewportHeight - canvasHeight);
        const minPanX = Math.min(0, viewportWidth - canvasWidth);
        const minPanY = Math.min(0, viewportHeight - canvasHeight);
        
        return {
          x: Math.max(minPanX, Math.min(maxPanX, newX)),
          y: Math.max(minPanY, Math.min(maxPanY, newY))
        };
      });
      
      setLastPanPoint({ x: touch.clientX, y: touch.clientY });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    

    
    // Stop silhouette dragging
    if (isDraggingSilhouette) {
      setIsDraggingSilhouette(false);
      setDragOffset({ x: 0, y: 0 });
    }
    
    if (e.touches.length === 0) {
      // Handle touch click (pixel selection) if no movement occurred
      if (isPanning && !hasMoved) {
        const touch = e.changedTouches[0];
        const canvas = canvasRef.current;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const x = touch.clientX - rect.left;
          const y = touch.clientY - rect.top;

          // No need to account for pan offset since we're using CSS transform
          const adjustedX = x;
          const adjustedY = y;

          const pixelSize = getPixelSize(zoom);
          
          // Calculate pixel coordinates based on pixel boundaries
          const col = Math.floor(adjustedX / pixelSize);
          const row = Math.floor(adjustedY / pixelSize);

          if (row >= 0 && row < CANVAS_SIZE && col >= 0 && col < CANVAS_SIZE) {
            setSelectedPixel({ row, col });
            setShowPixelSelector(true);
          }
        }
      }
      
      setIsPanning(false);
      setTouchDistance(null);
      setTouchCenter(null);
      setHasMoved(false);
    }
  };

  // Optimized pixel placement - only update the specific pixel
  const handlePlacePixel = () => {
    if (selectedPixel && pixels.length > 0) {
      const { row, col } = selectedPixel;
      
      // Safety check for array bounds
      if (row >= 0 && row < pixels.length && col >= 0 && col < pixels[row]?.length) {
        // Only update if color actually changed
        if (pixels[row][col] !== selectedColor) {
          // Create new array with only the changed pixel
          const newPixels = [...pixels];
          newPixels[row] = [...newPixels[row]];
          newPixels[row][col] = selectedColor;
          
          setPixels(newPixels);
          
          // Immediately draw the new pixel to canvas
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              const pixelSize = getPixelSize(zoom);
              ctx.fillStyle = selectedColor;
              ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);
              // Update the last drawn pixel tracking
              lastDrawnPixels.current.set(`${row}-${col}`, selectedColor);
            }
          }
        }
      }
      
      setSelectedPixel(null);
      setShowPixelSelector(false);
    }
  };

  const handleResetZoom = () => {
    setZoom(1);
    
    // Center the canvas when zooming out completely
    const pixelSize = getPixelSize(1); // zoom = 1 -> fit viewport
    const canvasWidth = CANVAS_SIZE * pixelSize;
    const canvasHeight = CANVAS_SIZE * pixelSize;
    const viewportWidth = 320;
    const viewportHeight = 320;
    
    // Calculate center position
    const centerX = (viewportWidth - canvasWidth) / 2;
    const centerY = (viewportHeight - canvasHeight) / 2;
    
    setPan({ x: centerX, y: centerY });
    setSelectedPixel(null);
    setShowPixelSelector(false);
  };

  // Handle file selection for silhouette overlay
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      // Reset file input for invalid file type
      e.target.value = '';
      return;
    }

    try {
      const pixelData = await processImageToPixels(file, 25); // Fixed 25x25 size
      
      // Set as silhouette overlay only
      setSilhouetteOverlay(pixelData);
      setShowSilhouette(true);
      
      // Reset file input to allow re-uploading the same file
      e.target.value = '';
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try again.');
      // Reset file input on error
      e.target.value = '';
    }
  };

  // Process image to pixel data with 8-bit quantization
  const processImageToPixels = (file: File, imageSize: number): Promise<string[][]> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      img.onload = () => {
        try {
          // Set canvas size to fixed image size (25x25)
          canvas.width = imageSize;
          canvas.height = imageSize;

          // Draw and scale image to fixed size
          ctx.drawImage(img, 0, 0, imageSize, imageSize);

          // Get pixel data
          const imageData = ctx.getImageData(0, 0, imageSize, imageSize);
          const data = imageData.data;

          // r/place color palette
          const rPlaceColors = [
            '#000000', '#FFFFFF', '#BE0039', '#FF4500', '#FFA800', '#FFD635', '#00A368', '#00CC78', 
            '#7EED56', '#2450A4', '#3690EA', '#51E9F4', '#811E9F', '#B44AC0', '#FF99AA', '#9C6926', 
            '#898D90', '#D4D7D9'
          ];

          // Convert to pixel data with 8-bit quantization
          const pixelData: string[][] = [];
          for (let y = 0; y < imageSize; y++) {
            const row: string[] = [];
            for (let x = 0; x < imageSize; x++) {
              const index = (y * imageSize + x) * 4;
              const r = data[index];
              const g = data[index + 1];
              const b = data[index + 2];
              const a = data[index + 3];

              // Skip transparent pixels
              if (a < 128) {
                row.push('#FFFFFF');
                continue;
              }

              // Find nearest r/place color
              const quantizedColor = findNearestColor(r, g, b, rPlaceColors);
              row.push(quantizedColor);
            }
            pixelData.push(row);
          }

          resolve(pixelData);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  // Helper function to find nearest color
  const findNearestColor = (r: number, g: number, b: number, palette: string[]): string => {
    let minDistance = Infinity;
    let nearestColor = palette[0];

    for (const color of palette) {
      const hex = color.slice(1);
      const paletteR = parseInt(hex.slice(0, 2), 16);
      const paletteG = parseInt(hex.slice(2, 4), 16);
      const paletteB = parseInt(hex.slice(4, 6), 16);

      const distance = Math.sqrt(
        Math.pow(r - paletteR, 2) + 
        Math.pow(g - paletteG, 2) + 
        Math.pow(b - paletteB, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestColor = color;
      }
    }

    return nearestColor;
  };

  // Toggle silhouette overlay visibility
  const toggleSilhouette = () => {
    setShowSilhouette(!showSilhouette);
  };

  // Clear silhouette overlay
  const clearSilhouette = () => {
    setSilhouetteOverlay([]);
    setShowSilhouette(false);
    setShowMatchingFeedback(false);
    
    // Reset file input to allow re-uploading the same file
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };





  // Toggle silhouette lock
  const toggleSilhouetteLock = () => {
    setIsSilhouetteLocked(!isSilhouetteLocked);
  };





  // Check if a pixel matches the target silhouette at its current position
  const isPixelCorrect = (row: number, col: number): boolean => {
    if (!silhouetteOverlay.length || !pixels.length) {
      return false;
    }
    
    // Calculate silhouette position offset
    const silhouetteSize = 25; // Fixed 25x25 size
    const startX = silhouettePosition.x;
    const startY = silhouettePosition.y;
    
    // Calculate relative position within silhouette
    const relativeRow = row - startY;
    const relativeCol = col - startX;
    
    // Check if pixel is within silhouette bounds
    if (relativeRow < 0 || relativeRow >= silhouetteSize || 
        relativeCol < 0 || relativeCol >= silhouetteSize) {
      return false;
    }
    
    // Safety check for arrays
    if (relativeRow >= silhouetteOverlay.length || relativeCol >= silhouetteOverlay[relativeRow]?.length ||
        row >= pixels.length || col >= pixels[row]?.length) {
      return false;
    }
    
    const targetColor = silhouetteOverlay[relativeRow][relativeCol];
    const currentColor = pixels[row][col];
    
    // Simple color matching - can be enhanced with color similarity
    return targetColor === currentColor;
  };

  // Toggle matching feedback
  const toggleMatchingFeedback = () => {
    setShowMatchingFeedback(!showMatchingFeedback);
  };

  // Check if a pixel matches the target silhouette - Temporarily disabled
  // const isPixelCorrect = (row: number, col: number): boolean => {
  //   if (!silhouetteOverlay.length || row >= silhouetteOverlay.length || col >= silhouetteOverlay[0].length) {
  //     return false;
  //   }
  //   
  //   const targetColor = silhouetteOverlay[row][col];
  //   const currentColor = pixels[row][col];
  //   
  //   // Simple color matching - can be enhanced with color similarity
  //   return targetColor === currentColor;
  // };

  // Toggle matching feedback - Temporarily disabled
  // const toggleMatchingFeedback = () => {
  //   setShowMatchingFeedback(!showMatchingFeedback);
  // };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-foreground-muted">Loading canvas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <Card title={`Blaces Canvas - ${eventId} (${CANVAS_SIZE}x${CANVAS_SIZE})`}>
        <div className="space-y-4">
          {/* Zoom Controls */}
          <div className="flex justify-center items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetZoom}
              disabled={zoom <= 1}
              className="h-8 px-2"
            >
              Reset Zoom
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('image-upload')?.click()}
              className="h-8 px-2"
            >
              Select Image
            </Button>
          </div>

          {/* Hidden file input */}
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Silhouette Controls */}
          {silhouetteOverlay.length > 0 && (
            <div className="flex justify-center items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSilhouette}
                className={`h-8 px-2 ${showSilhouette ? 'bg-accent text-white' : ''}`}
              >
                {showSilhouette ? 'Hide' : 'Show'} Silhouette
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMatchingFeedback}
                className={`h-8 px-2 ${showMatchingFeedback ? 'bg-green-500 text-white' : ''}`}
              >
                {showMatchingFeedback ? 'Hide' : 'Show'} Feedback
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={toggleSilhouetteLock}
                className={`h-8 px-2 ${isSilhouetteLocked ? 'bg-red-500 text-white' : ''}`}
              >
                {isSilhouetteLocked ? 'Unlock' : 'Lock'} Silhouette
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSilhouette}
                className="h-8 px-2"
              >
                Clear Silhouette
              </Button>
            </div>
          )}





          {/* Canvas */}
          <div className="flex justify-center">
            <div 
              className="border border-card-border overflow-hidden bg-white cursor-crosshair"
              onWheel={handleWheel}
              style={{ 
                width: '320px', 
                height: '320px', 
                overflow: 'hidden',
                position: 'relative',
                willChange: 'transform',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden'
              }}
            >
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{
                  display: 'block',
                  cursor: isPanning ? 'grabbing' : 'crosshair',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  touchAction: 'none',
                  userSelect: 'none',
                  transform: `translate3d(${pan.x}px, ${pan.y}px, 0)`,
                  transition: 'none',
                  willChange: 'transform',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden'
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
                Current Color: {pixels.length > 0 && selectedPixel.row < pixels.length && selectedPixel.col < pixels[selectedPixel.row]?.length ? pixels[selectedPixel.row][selectedPixel.col] : 'N/A'}
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


        </div>
      </Card>
    </div>
  );
}
