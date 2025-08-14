"use client";

import { useState, useEffect } from "react";
import { Button } from "./DemoComponents";
import { Icon } from "./DemoComponents";
import { Card } from "./DemoComponents";
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ChromePicker } from 'react-color';
import { Stage, Layer, Rect, Group } from 'react-konva';

// r/place color palette
const COLORS = [
  '#000000', '#FFFFFF', '#BE0039', '#FF4500', '#FFA800', '#FFD635', '#00A368', '#00CC78', '#7EED56', '#2450A4', '#3690EA', '#51E9F4', '#811E9F', '#B44AC0', '#FF99AA', '#9C6926', '#898D90', '#D4D7D9'
];

type CanvasProps = {
  eventId: string;
  canvasSize?: number;
};

export function CanvasClient({ eventId, canvasSize = 40 }: CanvasProps) {
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [pixels, setPixels] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPixel, setSelectedPixel] = useState<{row: number, col: number} | null>(null);
  const [showPixelSelector, setShowPixelSelector] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [actualCanvasSize, setActualCanvasSize] = useState(canvasSize);
  const [cursorPosition, setCursorPosition] = useState<{row: number, col: number} | null>(null);

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

  const handlePixelClick = (row: number, col: number) => {
    setSelectedPixel({ row, col });
    setShowPixelSelector(true);
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

  const handleColorChange = (color: { hex: string }) => {
    setSelectedColor(color.hex);
  };

  const handleMouseMove = (e: any) => {
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;
    
    const pixelSize = 320 / actualCanvasSize;
    
    const col = Math.floor(pointerPos.x / pixelSize);
    const row = Math.floor(pointerPos.y / pixelSize);
    
    if (row >= 0 && row < actualCanvasSize && col >= 0 && col < actualCanvasSize) {
      setCursorPosition({ row, col });
    } else {
      setCursorPosition(null);
    }
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
          {/* Canvas with Zoom/Pan */}
          <div className="flex justify-center">
            <div className="border border-card-border overflow-hidden bg-white">
              <TransformWrapper
                initialScale={1}
                minScale={0.3}
                maxScale={8}
                centerOnInit={true}
                limitToBounds={true}
                wheel={{
                  step: 0.5,
                  wheelDisabled: false,
                  touchPadDisabled: false,
                }}
                pinch={{
                  step: 10,
                }}
                doubleClick={{
                  step: 2,
                }}
                smooth={false}
                animationTime={0}
              >
                <TransformComponent
                  wrapperStyle={{
                    width: '320px',
                    height: '320px',
                  }}
                  contentStyle={{
                    width: '320px',
                    height: '320px',
                  }}
                >
                  <Stage
                    width={320}
                    height={320}
                    onMouseMove={handleMouseMove}
                  >
                    <Layer>
                      <Group>
                        {pixels.map((row, rowIndex) =>
                          row.map((color, colIndex) => {
                            const pixelSize = 320 / actualCanvasSize;
                            const isSelected = selectedPixel && 
                              selectedPixel.row === rowIndex && 
                              selectedPixel.col === colIndex;
                            
                            return (
                              <Rect
                                key={`${rowIndex}-${colIndex}`}
                                x={colIndex * pixelSize}
                                y={rowIndex * pixelSize}
                                width={pixelSize}
                                height={pixelSize}
                                fill={color}
                                stroke={isSelected ? '#000000' : '#E5E7EB'}
                                strokeWidth={isSelected ? 2 : 0.5}
                                onClick={() => handlePixelClick(rowIndex, colIndex)}
                                onMouseEnter={() => {
                                  if (!isSelected) {
                                    setCursorPosition({ row: rowIndex, col: colIndex });
                                  }
                                }}
                                onMouseLeave={() => {
                                  if (!isSelected) {
                                    setCursorPosition(null);
                                  }
                                }}
                              />
                            );
                          })
                        )}
                      </Group>
                    </Layer>
                  </Stage>
                </TransformComponent>
              </TransformWrapper>
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

          {/* Color Selection */}
          <div className="space-y-3">
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="h-10"
              >
                {showColorPicker ? 'Hide Color Picker' : 'Show Color Picker'}
              </Button>
            </div>
            
            {showColorPicker && (
              <div className="flex justify-center">
                <ChromePicker
                  color={selectedColor}
                  onChange={handleColorChange}
                  disableAlpha={true}
                />
              </div>
            )}

            {/* Quick Color Palette */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 text-center">
                Quick Colors
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
            Use mouse wheel or pinch to zoom in/out (0.3x - 8x). Drag to pan. Click on any pixel to select it.
          </div>
        </div>
      </Card>
    </div>
  );
}
