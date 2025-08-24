"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
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
                  <Image 
                    src={qrCodeDataUrl} 
                    alt="QR Code" 
                    width={128}
                    height={128}
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
  selectedColor?: string;
};

export function Canvas({ eventId, selectedColor = '#000000' }: CanvasProps) {
  const CANVAS_SIZE = 200; // Fixed canvas size
  const [pixels, setPixels] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [hoveredPixel, setHoveredPixel] = useState<{row: number, col: number} | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [mouseDownPoint, setMouseDownPoint] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const [touchDistance, setTouchDistance] = useState<number | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastDrawnPixels = useRef<Map<string, string>>(new Map()); // Track last drawn pixel colors




  // Viewport and pixel size helpers to guarantee full canvas visible at zoom = 1
  const getViewportSize = useCallback(() => {
    // Use full screen size for true fullscreen experience
    return Math.min(window.innerWidth, window.innerHeight);
  }, []);
  
  const getMinPixelSize = useCallback(() => getViewportSize() / (CANVAS_SIZE * 1.2), [getViewportSize]);
  const getMaxPixelSize = useCallback(() => getViewportSize() / 5, [getViewportSize]);
  const getPixelSize = useCallback((z: number) => {
    const viewportSize = getViewportSize();
    const min = viewportSize / (CANVAS_SIZE * 1.2);
    const max = viewportSize / 5;
    const desired = min * z;
    return Math.max(min, Math.min(max, desired));
  }, [getViewportSize]);
  const getMaxZoom = useCallback(() => {
    const viewportSize = getViewportSize();
    const min = viewportSize / (CANVAS_SIZE * 1.2);
    const max = viewportSize / 5;
    return max / min;
  }, [getViewportSize]);

  // Initialize canvas with fixed size
  useEffect(() => {
    console.log(`Canvas size for event ${eventId}: ${CANVAS_SIZE}x${CANVAS_SIZE}`);
    
    const savedPixels = localStorage.getItem(`blaces-${eventId}`);
    if (savedPixels) {
      try {
        const compressedData = JSON.parse(savedPixels);
        
        // Check if it's compressed data or old format
        if (Array.isArray(compressedData) && compressedData.length > 0 && compressedData[0].pixels) {
          // Compressed format - reconstruct canvas
          const emptyCanvas = Array(CANVAS_SIZE).fill(null).map(() => Array(CANVAS_SIZE).fill('#FFFFFF'));
          
          compressedData.forEach((rowData: { row: number; pixels: Array<{ col: number; color: string }> }) => {
            if (rowData.row >= 0 && rowData.row < CANVAS_SIZE) {
              rowData.pixels.forEach((pixelData: { col: number; color: string }) => {
                if (pixelData.col >= 0 && pixelData.col < CANVAS_SIZE) {
                  emptyCanvas[rowData.row][pixelData.col] = pixelData.color;
                }
              });
            }
          });
          
          setPixels(emptyCanvas);
        } else {
          // Old format - direct array
          setPixels(compressedData);
        }
      } catch (error) {
        console.warn('Failed to load canvas data:', error);
        // Initialize empty canvas on error
        const emptyCanvas = Array(CANVAS_SIZE).fill(null).map(() => Array(CANVAS_SIZE).fill('#FFFFFF'));
        setPixels(emptyCanvas);
      }
    } else {
      // Initialize empty canvas
      const emptyCanvas = Array(CANVAS_SIZE).fill(null).map(() => Array(CANVAS_SIZE).fill('#FFFFFF'));
      setPixels(emptyCanvas);
    }
    
    // Reset pan to center
    setPan({ x: 0, y: 0 });
    
    setIsLoading(false);
  }, [eventId]);

  // Save pixels to localStorage with debouncing and error handling
  useEffect(() => {
    if (pixels.length > 0) {
      const timeoutId = setTimeout(() => {
        try {
          // Compress data by only saving non-white pixels
          const compressedData = pixels.map((row, rowIndex) => {
            const nonWhitePixels = row.map((color, colIndex) => {
              if (color !== '#FFFFFF') {
                return { col: colIndex, color };
              }
              return null;
            }).filter(pixel => pixel !== null);
            return nonWhitePixels.length > 0 ? { row: rowIndex, pixels: nonWhitePixels } : null;
          }).filter(row => row !== null);
          
          localStorage.setItem(`blaces-${eventId}`, JSON.stringify(compressedData));
        } catch (error) {
          console.warn('Failed to save canvas data:', error);
          // Try to clear some old data
          try {
            const keys = Object.keys(localStorage);
            const blacesKeys = keys.filter(key => key.startsWith('blaces-'));
            if (blacesKeys.length > 10) {
              // Remove oldest 5 entries
              blacesKeys.slice(0, 5).forEach(key => localStorage.removeItem(key));
              // Try saving again
              const compressedData = pixels.map((row, rowIndex) => {
                const nonWhitePixels = row.map((color, colIndex) => {
                  if (color !== '#FFFFFF') {
                    return { col: colIndex, color };
                  }
                  return null;
                }).filter(pixel => pixel !== null);
                return nonWhitePixels.length > 0 ? { row: rowIndex, pixels: nonWhitePixels } : null;
              }).filter(row => row !== null);
              
              localStorage.setItem(`blaces-${eventId}`, JSON.stringify(compressedData));
            }
          } catch (clearError) {
            console.error('Failed to clear localStorage:', clearError);
          }
        }
      }, 1000); // Save after 1 second of no changes
      
      return () => clearTimeout(timeoutId);
    }
  }, [pixels, eventId]);



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

    // Draw all pixels
    pixels.forEach((row, rowIndex) => {
      if (row && Array.isArray(row)) {
        row.forEach((color, colIndex) => {
          if (color) {
            ctx.fillStyle = color;
            ctx.fillRect(colIndex * pixelSize, rowIndex * pixelSize, pixelSize, pixelSize);
          }
        });
      }
    });
    

    
    // Draw grid lines - always visible for better canvas appearance
    if (pixelSize > 2) {
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 1;
      
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





    // Draw hovered pixel highlight
    if (hoveredPixel) {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeRect(
        hoveredPixel.col * pixelSize,
        hoveredPixel.row * pixelSize,
        pixelSize,
        pixelSize
      );
    }

    ctx.restore();
  }, [pixels, zoom, pan, hoveredPixel, CANVAS_SIZE, getPixelSize]);



  // Mouse wheel zoom handler - simplified
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    // Only allow zoom when not panning
    if (isPanning) return;
    
    const delta = e.deltaY > 0 ? 0.8 : 1.25;
    const maxZoom = getMaxZoom();
    const newZoom = Math.max(0.05, Math.min(maxZoom, zoom * delta));
    
    setZoom(newZoom);
  };

  // Handle canvas click - paint pixel
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Only handle click if mouse hasn't moved (it's a click, not a drag)
    if (hasMoved) {
      setHasMoved(false); // Reset for next interaction
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const pixelSize = getPixelSize(zoom);
    
    // Calculate mouse position relative to canvas
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate pixel coordinates - rect.left/top already includes the transform
    const col = Math.floor(mouseX / pixelSize);
    const row = Math.floor(mouseY / pixelSize);

    if (row >= 0 && row < CANVAS_SIZE && col >= 0 && col < CANVAS_SIZE && pixels.length > 0) {
      // Paint the pixel with selected color
      const newPixels = pixels.map(row => [...row]);
      newPixels[row][col] = selectedColor;
      setPixels(newPixels);
    }
    
    // Reset hasMoved for next interaction
    setHasMoved(false);
  };

  // Handle mouse down for panning
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) { // Left mouse button
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Start panning
      setIsPanning(true);
      setHasMoved(false);
      setMouseDownPoint({ x: e.clientX, y: e.clientY });
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle mouse move for panning and hover
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const pixelSize = getPixelSize(zoom);
    
    // Calculate mouse position relative to canvas
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
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
      
      // Update pan and hover together using the same calculation
      setPan(prevPan => {
        const newX = prevPan.x + deltaX;
        const newY = prevPan.y + deltaY;
        
        // Calculate hover - rect.left/top already includes the transform
        const col = Math.floor(mouseX / pixelSize);
        const row = Math.floor(mouseY / pixelSize);
        
        if (row >= 0 && row < CANVAS_SIZE && col >= 0 && col < CANVAS_SIZE) {
          setHoveredPixel({ row, col });
        } else {
          setHoveredPixel(null);
        }
        
        // No boundaries - free panning on large background
        return {
          x: newX,
          y: newY
        };
      });
      
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    } else {
      // Just update hover when not panning
      const col = Math.floor(mouseX / pixelSize);
      const row = Math.floor(mouseY / pixelSize);
      
      if (row >= 0 && row < CANVAS_SIZE && col >= 0 && col < CANVAS_SIZE) {
        setHoveredPixel({ row, col });
      } else {
        setHoveredPixel(null);
      }
    }
  };

  // Handle mouse up to stop panning
  const handleMouseUp = () => {
    setIsPanning(false);
    // Don't reset hasMoved here - let the click handler decide
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setIsPanning(false);
    setHoveredPixel(null);
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
      

      
      setTouchDistance(distance);
      setIsPanning(false); // Disable panning during zoom
    } else if (e.touches.length === 1) {
      // Single finger touch - handle panning only
      const touch = e.touches[0];
      

      
      // If not touching interactive elements, start panning
      setIsPanning(true);
      setHasMoved(false);
      setMouseDownPoint({ x: touch.clientX, y: touch.clientY });
      setLastPanPoint({ x: touch.clientX, y: touch.clientY });
      setTouchDistance(null);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    

    

    
    if (e.touches.length === 2 && touchDistance && !isPanning) {
      // Two finger touch - handle zoom only (when not panning)
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      const newDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      const scale = newDistance / touchDistance;
      const maxZoom = getMaxZoom();
      const newZoom = Math.max(0.05, Math.min(maxZoom, zoom * scale));
      
      setZoom(newZoom);
      
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
          
          // No boundaries - free panning on large background
          return {
            x: newX,
            y: newY
          };
        });
      
      setLastPanPoint({ x: touch.clientX, y: touch.clientY });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    

    

    
    if (e.touches.length === 0) {
      // Handle touch click (pixel selection) if no movement occurred
      if (isPanning && !hasMoved) {
        const touch = e.changedTouches[0];
        const canvas = canvasRef.current;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const pixelSize = getPixelSize(zoom);
          
          // Calculate touch position relative to canvas
          const touchX = touch.clientX - rect.left;
          const touchY = touch.clientY - rect.top;
          
          // Calculate pixel coordinates - rect.left/top already includes the transform
          const col = Math.floor(touchX / pixelSize);
          const row = Math.floor(touchY / pixelSize);

          if (row >= 0 && row < CANVAS_SIZE && col >= 0 && col < CANVAS_SIZE && pixels.length > 0) {
            // Paint the pixel with selected color
            const newPixels = pixels.map(row => [...row]);
            newPixels[row][col] = selectedColor;
            setPixels(newPixels);
          }
        }
      }
      
      setIsPanning(false);
      setTouchDistance(null);
      setHasMoved(false);
    }
  };







  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-foreground-muted">Loading canvas...</div>
      </div>
    );
  }



  return (
    <div className="w-full h-screen relative overflow-hidden bg-gray-100" style={{ transformStyle: 'preserve-3d' }}>
      {/* Large Background Canvas */}
      <div 
        className="absolute inset-0 bg-gray-100"
        style={{
          width: '4000px',
          height: '4000px',
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0)`,
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transformStyle: 'preserve-3d'
        }}
      />
      
      {/* Main Canvas - Directly positioned */}
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
        onWheel={handleWheel}
        style={{
          display: 'block',
          cursor: isPanning ? 'grabbing' : 'crosshair',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) translate3d(${pan.x}px, ${pan.y}px, 0)`,
          touchAction: 'none',
          userSelect: 'none',
          transition: 'none',
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          zIndex: 0,
          transformStyle: 'preserve-3d'
        }}
      />
      

    </div>
  );
}
