"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
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
  const [silhouettePosition, setSilhouettePosition] = useState({ x: 90, y: 90 }); // Center position
  const [isSilhouetteLocked, setIsSilhouetteLocked] = useState(false);
  const [hasSilhouette, setHasSilhouette] = useState(false);
  const [isDraggingSilhouette, setIsDraggingSilhouette] = useState(false);
  const [dragStartPosition, setDragStartPosition] = useState({ x: 0, y: 0 });
  const [selectedPixel, setSelectedPixel] = useState<{row: number, col: number} | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [centerPixel, setCenterPixel] = useState({ row: 100, col: 100 }); // Will be calculated dynamically
  const [blinkOpacity, setBlinkOpacity] = useState(1);
  const [isBrushMode, setIsBrushMode] = useState(false);
  const [isPaintingOnSilhouette, setIsPaintingOnSilhouette] = useState(false);
  const [isBrushDragging, setIsBrushDragging] = useState(false);
  const brushSize = 3; // Fixed brush size
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastDrawnPixels = useRef<Map<string, string>>(new Map()); // Track last drawn pixel colors
  const silhouetteDataRef = useRef<string[][] | null>(null); // Store silhouette data




  // Viewport and pixel size helpers to guarantee full canvas visible at zoom = 1
  const getViewportSize = useCallback(() => {
    // Use full screen size for true fullscreen experience
    return Math.min(window.innerWidth, window.innerHeight);
  }, []);
  

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

  // Calculate screen center pixel
  const getScreenCenterPixel = useCallback(() => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const pixelSize = getPixelSize(zoom);
    
    // Calculate canvas position on screen
    const canvasLeft = (viewportWidth - CANVAS_SIZE * pixelSize) / 2 + pan.x;
    const canvasTop = (viewportHeight - CANVAS_SIZE * pixelSize) / 2 + pan.y;
    
    // Calculate screen center relative to canvas
    const screenCenterX = viewportWidth / 2;
    const screenCenterY = viewportHeight / 2;
    
    // Calculate pixel coordinates
    const pixelX = (screenCenterX - canvasLeft) / pixelSize;
    const pixelY = (screenCenterY - canvasTop) / pixelSize;
    
    // Clamp to canvas bounds
    const col = Math.max(0, Math.min(CANVAS_SIZE - 1, Math.floor(pixelX)));
    const row = Math.max(0, Math.min(CANVAS_SIZE - 1, Math.floor(pixelY)));
    
    return { row, col };
  }, [zoom, pan.x, pan.y, CANVAS_SIZE, getPixelSize]);

  // Handle image upload
  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleClearImage = () => {
    setHasSilhouette(false);
    setIsSilhouetteLocked(false);
    setSilhouettePosition({ x: 0, y: 0 });
    if (silhouetteDataRef.current) {
      silhouetteDataRef.current = null;
    }
  };

  // Brush painting function
  const paintWithBrush = (centerRow: number, centerCol: number) => {
    if (!isBrushMode || !isSilhouetteLocked || !hasSilhouette || !silhouetteDataRef.current) {
      return;
    }

    const newPixels = pixels.map(row => [...row]);
    const halfBrush = Math.floor(brushSize / 2);
    
    // Paint in a square around the center pixel
    for (let row = centerRow - halfBrush; row <= centerRow + halfBrush; row++) {
      for (let col = centerCol - halfBrush; col <= centerCol + halfBrush; col++) {
        // Check bounds
        if (row >= 0 && row < CANVAS_SIZE && col >= 0 && col < CANVAS_SIZE) {
          // Check if this pixel is part of the silhouette (non-transparent)
          const silhouetteRow = row - silhouettePosition.y;
          const silhouetteCol = col - silhouettePosition.x;
          
          if (silhouetteRow >= 0 && silhouetteRow < 20 && 
              silhouetteCol >= 0 && silhouetteCol < 20) {
            const silhouettePixel = silhouetteDataRef.current[silhouetteRow]?.[silhouetteCol];
            
            // Only paint if the silhouette pixel is not transparent
            if (silhouettePixel && silhouettePixel !== 'transparent') {
              // Use the actual color from the silhouette, not the selected color
              newPixels[row][col] = silhouettePixel;
            }
          }
        }
      }
    }
    
    setPixels(newPixels);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('Processing image:', file.name);
      
      // Process image to 20x20 pixels
      const img = new window.Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = 20;
        canvas.height = 20;
        
        img.onload = () => {
          console.log('Image loaded, processing...');
          
          // Clear canvas
          ctx.clearRect(0, 0, 20, 20);
          
          // Draw image scaled to 20x20
          ctx.drawImage(img, 0, 0, 20, 20);
          
          // Get pixel data
          const imageData = ctx.getImageData(0, 0, 20, 20);
          const data = imageData.data;
          
          // Convert to pixel array
          const pixelData: string[][] = [];
          for (let y = 0; y < 20; y++) {
            const row: string[] = [];
            for (let x = 0; x < 20; x++) {
              const index = (y * 20 + x) * 4;
              const r = data[index];
              const g = data[index + 1];
              const b = data[index + 2];
              const a = data[index + 3];
              
              // Handle transparency
              if (a < 128) {
                row.push('transparent'); // Transparent for transparent pixels
              } else {
                // Keep original colors
                const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
                row.push(hex);
              }
            }
            pixelData.push(row);
          }
          
          console.log('Pixel data created:', pixelData.length, 'x', pixelData[0]?.length);
          
          // Store silhouette data for movement
          setSilhouettePosition({ x: 90, y: 90 }); // Center position
          setHasSilhouette(true);
          setIsSilhouetteLocked(false);
          
          // Store silhouette data in a ref for easy access
          silhouetteDataRef.current = pixelData;
          
          // Clean up
          URL.revokeObjectURL(img.src);
        };
        
        img.onerror = (error) => {
          console.error('Error loading image:', error);
          alert('Error loading image. Please try again.');
        };
        
        img.src = URL.createObjectURL(file);
      }
    }
    
    // Reset file input
    e.target.value = '';
  };

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update screen center pixel and blinking effect for mobile
  useEffect(() => {
    if (!isMobile) return;
    
    // Update center pixel based on screen center
    const newCenterPixel = getScreenCenterPixel();
    setCenterPixel(newCenterPixel);
    
    const interval = setInterval(() => {
      setBlinkOpacity(prev => prev === 1 ? 0.3 : 1);
    }, 500); // Blink every 500ms
    
    return () => clearInterval(interval);
  }, [isMobile, getScreenCenterPixel]);

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
                  // Convert short color format back to full hex
                  let fullColor = pixelData.color;
                  if (pixelData.color === '0') {
                    fullColor = '#000000';
                  } else if (pixelData.color === '1') {
                    fullColor = '#FFFFFF';
                  } else if (!pixelData.color.startsWith('#')) {
                    fullColor = `#${pixelData.color}`;
                  }
                  emptyCanvas[rowData.row][pixelData.col] = fullColor;
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
          // Compress data by only saving non-white pixels with better compression
          const compressedData = pixels.map((row, rowIndex) => {
            const nonWhitePixels = row.map((color, colIndex) => {
              if (color !== '#FFFFFF') {
                // Use shorter color format if possible
                const shortColor = color === '#000000' ? '0' : 
                                  color === '#FFFFFF' ? '1' : 
                                  color.replace('#', '');
                return { col: colIndex, color: shortColor };
              }
              return null;
            }).filter(pixel => pixel !== null);
            return nonWhitePixels.length > 0 ? { row: rowIndex, pixels: nonWhitePixels } : null;
          }).filter(row => row !== null);
          
          localStorage.setItem(`blaces-${eventId}`, JSON.stringify(compressedData));
        } catch (error) {
          console.warn('Failed to save canvas data:', error);
          // More aggressive cleanup
          try {
            const keys = Object.keys(localStorage);
            const blacesKeys = keys.filter(key => key.startsWith('blaces-'));
            
            // Clear all blaces data if quota exceeded
            if (blacesKeys.length > 0) {
              blacesKeys.forEach(key => localStorage.removeItem(key));
              console.log('Cleared all blaces data due to quota exceeded');
              
              // Try saving current data only
              const compressedData = pixels.map((row, rowIndex) => {
                const nonWhitePixels = row.map((color, colIndex) => {
                  if (color !== '#FFFFFF') {
                    return { col: colIndex, color };
                  }
                  return null;
                }).filter(pixel => pixel !== null);
                return nonWhitePixels.length > 0 ? { row: rowIndex, pixels: nonWhitePixels } : null;
              }).filter(row => row !== null);
              
              // Only save if data is not too large
              const dataSize = JSON.stringify(compressedData).length;
              if (dataSize < 5000000) { // 5MB limit
                localStorage.setItem(`blaces-${eventId}`, JSON.stringify(compressedData));
              } else {
                console.warn('Canvas data too large, not saving');
              }
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





    // Draw silhouette as template (always visible when exists)
    if (hasSilhouette && silhouetteDataRef.current) {
      const silhouetteData = silhouetteDataRef.current;
      for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 20; x++) {
          const color = silhouetteData[y][x];
          if (color && color !== 'transparent') {
            const targetY = silhouettePosition.y + y;
            const targetX = silhouettePosition.x + x;
            if (targetY < CANVAS_SIZE && targetX < CANVAS_SIZE) {
              // Draw with original colors but semi-transparent
              const alpha = isSilhouetteLocked ? 0.4 : 0.6;
              ctx.fillStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
              ctx.fillRect(targetX * pixelSize, targetY * pixelSize, pixelSize, pixelSize);
            }
          }
        }
      }
    }

    // Draw hovered pixel highlight (desktop)
    if (hoveredPixel && !isMobile) {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeRect(
        hoveredPixel.col * pixelSize,
        hoveredPixel.row * pixelSize,
        pixelSize,
        pixelSize
      );
    }

    // Draw blinking center pixel for mobile
    if (isMobile) {
      // Outer black square
      ctx.strokeStyle = `rgba(0, 0, 0, ${blinkOpacity})`;
      ctx.lineWidth = 3;
      ctx.strokeRect(
        centerPixel.col * pixelSize - 2,
        centerPixel.row * pixelSize - 2,
        pixelSize + 4,
        pixelSize + 4
      );
      
      // Inner white square
      ctx.strokeStyle = `rgba(255, 255, 255, ${blinkOpacity})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(
        centerPixel.col * pixelSize,
        centerPixel.row * pixelSize,
        pixelSize,
        pixelSize
      );
    }

    // Draw selected pixel highlight (mobile) - only for center pixel
    if (selectedPixel && isMobile && selectedPixel.row === centerPixel.row && selectedPixel.col === centerPixel.col) {
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        selectedPixel.col * pixelSize,
        selectedPixel.row * pixelSize,
        pixelSize,
        pixelSize
      );
    }

    ctx.restore();
  }, [pixels, zoom, pan, hoveredPixel, selectedPixel, isMobile, centerPixel, blinkOpacity, silhouettePosition, hasSilhouette, isSilhouetteLocked, CANVAS_SIZE, getPixelSize]);

  // Track last selected color to detect when user clicks a color
  const [lastSelectedColor, setLastSelectedColor] = useState<string | null>(null);

  // Auto-paint screen center pixel on mobile when user clicks a color
  useEffect(() => {
    if (isMobile && selectedColor && pixels.length > 0 && lastSelectedColor !== selectedColor) {
      const screenCenter = getScreenCenterPixel();
      // Paint the screen center pixel with the clicked color
      const newPixels = pixels.map(row => [...row]);
      if (newPixels[screenCenter.row] && newPixels[screenCenter.row][screenCenter.col] !== undefined) {
        newPixels[screenCenter.row][screenCenter.col] = selectedColor;
        setPixels(newPixels);
      }
      setLastSelectedColor(selectedColor);
    }
  }, [selectedColor, isMobile, lastSelectedColor, getScreenCenterPixel, pixels]);



  // Mouse wheel zoom handler - simplified
  const handleWheel = (e: React.WheelEvent) => {
    // Don't prevent default to avoid passive event listener warning
    
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
    if (hasMoved || isDraggingSilhouette) {
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

    // Check if clicking on silhouette area
    if (hasSilhouette && !isSilhouetteLocked && silhouetteDataRef.current) {
      const silhouetteLeft = silhouettePosition.x;
      const silhouetteTop = silhouettePosition.y;
      const silhouetteRight = silhouetteLeft + 20;
      const silhouetteBottom = silhouetteTop + 20;

      if (col >= silhouetteLeft && col < silhouetteRight && 
          row >= silhouetteTop && row < silhouetteBottom) {
        // Don't paint if clicking on silhouette
        setHasMoved(false);
        return;
      }
    }

    if (row >= 0 && row < CANVAS_SIZE && col >= 0 && col < CANVAS_SIZE && pixels.length > 0 && pixels[row] && pixels[row][col] !== undefined) {
      // On mobile, no manual painting allowed - only auto-paint from color selection
      if (isMobile) {
        return;
      }
      
      // Use brush tool if enabled and template is locked, otherwise single pixel
      if (isBrushMode && isSilhouetteLocked && hasSilhouette && silhouetteDataRef.current) {
        // Check if we're over the silhouette area
        const silhouetteLeft = silhouettePosition.x;
        const silhouetteTop = silhouettePosition.y;
        const silhouetteRight = silhouetteLeft + 20;
        const silhouetteBottom = silhouetteTop + 20;

        if (col >= silhouetteLeft && col < silhouetteRight && 
            row >= silhouetteTop && row < silhouetteBottom) {
          // Check if the pixel is not transparent in the silhouette
          const silhouetteRow = row - silhouetteTop;
          const silhouetteCol = col - silhouetteLeft;
          const silhouettePixel = silhouetteDataRef.current[silhouetteRow]?.[silhouetteCol];
          
          if (silhouettePixel && silhouettePixel !== 'transparent') {
            paintWithBrush(row, col);
          }
        }
      } else {
        // Paint the pixel with selected color (desktop only)
        const newPixels = pixels.map(row => [...row]);
        newPixels[row][col] = selectedColor;
        setPixels(newPixels);
      }
    }
    
    // Reset hasMoved for next interaction
    setHasMoved(false);
  };

  // Handle mouse down for panning and silhouette dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) { // Left mouse button
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const pixelSize = getPixelSize(zoom);
      
      // Calculate mouse position relative to canvas
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Calculate pixel coordinates
      const col = Math.floor(mouseX / pixelSize);
      const row = Math.floor(mouseY / pixelSize);

      // Check if clicking on silhouette area
      if (hasSilhouette && !isSilhouetteLocked && silhouetteDataRef.current) {
        const silhouetteLeft = silhouettePosition.x;
        const silhouetteTop = silhouettePosition.y;
        const silhouetteRight = silhouetteLeft + 20;
        const silhouetteBottom = silhouetteTop + 20;

        if (col >= silhouetteLeft && col < silhouetteRight && 
            row >= silhouetteTop && row < silhouetteBottom) {
          // Start dragging silhouette
          setIsDraggingSilhouette(true);
          setDragStartPosition({ x: col - silhouetteLeft, y: row - silhouetteTop });
          return;
        }
      }

      // Handle brush painting on mouse down - only when over silhouette area
      if (isBrushMode && isSilhouetteLocked && hasSilhouette && silhouetteDataRef.current) {
        // Check if we're over the silhouette area
        const silhouetteLeft = silhouettePosition.x;
        const silhouetteTop = silhouettePosition.y;
        const silhouetteRight = silhouetteLeft + 20;
        const silhouetteBottom = silhouetteTop + 20;

        if (col >= silhouetteLeft && col < silhouetteRight && 
            row >= silhouetteTop && row < silhouetteBottom) {
          // Check if the pixel is not transparent in the silhouette
          const silhouetteRow = row - silhouetteTop;
          const silhouetteCol = col - silhouetteLeft;
          const silhouettePixel = silhouetteDataRef.current[silhouetteRow]?.[silhouetteCol];
          
          if (silhouettePixel && silhouettePixel !== 'transparent') {
            paintWithBrush(row, col);
            setIsPaintingOnSilhouette(true);
            setIsBrushDragging(true);
            // Don't start panning when painting on silhouette
            return;
          }
        }
      }

      // Start panning if not clicking on silhouette or painting
      setIsPanning(true);
      setHasMoved(false);
      setMouseDownPoint({ x: e.clientX, y: e.clientY });
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle mouse move for panning, hover, and silhouette dragging
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const pixelSize = getPixelSize(zoom);
    
    // Calculate mouse position relative to canvas
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate pixel coordinates
    const col = Math.floor(mouseX / pixelSize);
    const row = Math.floor(mouseY / pixelSize);
    
    // Set cursor based on current state
    canvas.style.cursor = isPanning ? 'grabbing' : 'crosshair';
    
    if (isDraggingSilhouette) {
      // Drag silhouette
      const newX = Math.max(0, Math.min(CANVAS_SIZE - 20, col - dragStartPosition.x));
      const newY = Math.max(0, Math.min(CANVAS_SIZE - 20, row - dragStartPosition.y));
      setSilhouettePosition({ x: newX, y: newY });
      return;
    }
    
    // Handle brush painting during drag - only when brush mode is active and template is locked
    if (isBrushDragging && isBrushMode && isSilhouetteLocked && hasSilhouette) {
      // Check if we're over the silhouette area
      const silhouetteLeft = silhouettePosition.x;
      const silhouetteTop = silhouettePosition.y;
      const silhouetteRight = silhouetteLeft + 20;
      const silhouetteBottom = silhouetteTop + 20;

      if (col >= silhouetteLeft && col < silhouetteRight && 
          row >= silhouetteTop && row < silhouetteBottom) {
        // Check if the pixel is not transparent in the silhouette
        const silhouetteRow = row - silhouetteTop;
        const silhouetteCol = col - silhouetteLeft;
        const silhouettePixel = silhouetteDataRef.current?.[silhouetteRow]?.[silhouetteCol];
        
        if (silhouettePixel && silhouettePixel !== 'transparent') {
          paintWithBrush(row, col);
          setIsPaintingOnSilhouette(true);
        }
      }
      // Keep panning disabled while brush is active
      setIsPaintingOnSilhouette(true);
    }
    
    if (isPanning && !isPaintingOnSilhouette) {
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
      // Just update hover when not panning or dragging
      if (row >= 0 && row < CANVAS_SIZE && col >= 0 && col < CANVAS_SIZE) {
        setHoveredPixel({ row, col });
      } else {
        setHoveredPixel(null);
      }
    }
  };

  // Handle mouse up to stop panning and silhouette dragging
  const handleMouseUp = () => {
    setIsPanning(false);
    setIsDraggingSilhouette(false);
    setIsPaintingOnSilhouette(false);
    setIsBrushDragging(false);
    // Don't reset hasMoved here - let the click handler decide
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setIsPanning(false);
    setIsDraggingSilhouette(false);
    setIsPaintingOnSilhouette(false);
    setIsBrushDragging(false);
    setHoveredPixel(null);
    
    // Reset cursor
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'crosshair';
    }
  };

  // Optimized touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    // Don't prevent default to avoid passive event listener warning
    
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
      // Single finger touch - handle panning or pixel selection
      const touch = e.touches[0];
      const canvas = canvasRef.current;
      
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const pixelSize = getPixelSize(zoom);
        
        // Calculate touch position relative to canvas
        const touchX = touch.clientX - rect.left;
        const touchY = touch.clientY - rect.top;
        
        // Calculate pixel coordinates
        const col = Math.floor(touchX / pixelSize);
        const row = Math.floor(touchY / pixelSize);
        
        // Check if touching silhouette area
        if (hasSilhouette && !isSilhouetteLocked && silhouetteDataRef.current) {
          const silhouetteLeft = silhouettePosition.x;
          const silhouetteTop = silhouettePosition.y;
          const silhouetteRight = silhouetteLeft + 20;
          const silhouetteBottom = silhouetteTop + 20;

          if (col >= silhouetteLeft && col < silhouetteRight && 
              row >= silhouetteTop && row < silhouetteBottom) {
            // Start dragging silhouette
            setIsDraggingSilhouette(true);
            setIsPanning(false); // Don't start panning when dragging silhouette
            setDragStartPosition({ x: col - silhouetteLeft, y: row - silhouetteTop });
            return;
          }
        }
        
        // Set selected pixel for mobile (only center pixel)
        if (row >= 0 && row < CANVAS_SIZE && col >= 0 && col < CANVAS_SIZE) {
          if (isMobile) {
            // Only allow selection of center pixel on mobile
            if (row === centerPixel.row && col === centerPixel.col) {
              setSelectedPixel({ row, col });
            }
          } else {
            setSelectedPixel({ row, col });
          }
        }
      }
      
      // Start panning
      setIsPanning(true);
      setHasMoved(false);
      setMouseDownPoint({ x: touch.clientX, y: touch.clientY });
      setLastPanPoint({ x: touch.clientX, y: touch.clientY });
      setTouchDistance(null);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Don't prevent default to avoid passive event listener warning
    

    

    
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
    } else if (e.touches.length === 1 && (isPanning || isDraggingSilhouette) && !touchDistance) {
      // Single finger touch - handle panning or silhouette dragging
      const touch = e.touches[0];
      
      if (isDraggingSilhouette) {
        // Drag silhouette
        const canvas = canvasRef.current;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const pixelSize = getPixelSize(zoom);
          
          const touchX = touch.clientX - rect.left;
          const touchY = touch.clientY - rect.top;
          
          const col = Math.floor(touchX / pixelSize);
          const row = Math.floor(touchY / pixelSize);
          
          const newX = Math.max(0, Math.min(CANVAS_SIZE - 20, col - dragStartPosition.x));
          const newY = Math.max(0, Math.min(CANVAS_SIZE - 20, row - dragStartPosition.y));
          setSilhouettePosition({ x: newX, y: newY });
        }
        return;
      }
      
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
    // Don't prevent default to avoid passive event listener warning
    
    if (e.touches.length === 0) {
      // Handle touch click (pixel selection) if no movement occurred
      if (isPanning && !hasMoved && !isDraggingSilhouette) {
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

          if (row >= 0 && row < CANVAS_SIZE && col >= 0 && col < CANVAS_SIZE && pixels.length > 0 && pixels[row] && pixels[row][col] !== undefined) {
            // On mobile, no manual painting allowed - only auto-paint from color selection
            if (isMobile) {
              return;
            }
            
            // Paint the pixel with selected color (desktop only)
            const newPixels = pixels.map(row => [...row]);
            newPixels[row][col] = selectedColor;
            setPixels(newPixels);
          }
        }
      }
      
      setIsPanning(false);
      setIsDraggingSilhouette(false);
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
      {/* Button Container */}
      <div className="absolute top-4 left-4 z-10 flex flex-col space-y-2">
        {/* Upload Button - only show if no silhouette exists */}
        {!hasSilhouette && (
          <button
            onClick={handleImageUpload}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600 transition-colors font-medium w-32"
          >
            Upload Image
          </button>
        )}

        {/* Lock Button - only show if silhouette exists */}
        {hasSilhouette && (
          <button
            onClick={() => {
              setIsSilhouetteLocked(!isSilhouetteLocked);
            }}
            className={`px-4 py-2 rounded-lg shadow-lg transition-colors font-medium w-32 ${
              isSilhouetteLocked 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isSilhouetteLocked ? 'Template Locked' : 'Template Unlocked'}
          </button>
        )}

        {/* Clear Image Button - only show if silhouette exists */}
        {hasSilhouette && (
          <button
            onClick={handleClearImage}
            className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-600 transition-colors font-medium w-32"
          >
            Clear Image
          </button>
        )}

        {/* Brush Tool Button - only show if silhouette is locked */}
        {hasSilhouette && isSilhouetteLocked && (
          <button
            onClick={() => setIsBrushMode(!isBrushMode)}
            className={`px-4 py-2 rounded-lg shadow-lg transition-colors font-medium w-32 ${
              isBrushMode 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isBrushMode ? 'Brush Active' : 'Brush Tool'}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

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
        onWheelCapture={handleWheel}
        style={{
          display: 'block',
          cursor: isPanning ? 'grabbing' : 'crosshair',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) translate3d(${pan.x}px, ${pan.y}px, 0)`,
          touchAction: 'none',
          userSelect: 'none',
          overscrollBehavior: 'none',
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
