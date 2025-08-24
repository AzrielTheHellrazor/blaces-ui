"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Button } from "./DemoComponents";
import { Icon } from "./DemoComponents";

interface ImageUploadProps {
  onImageUpload: (pixelData: string[][]) => void;
}

export function ImageUpload({ onImageUpload }: ImageUploadProps) {
  const CANVAS_SIZE = 200; // Fixed canvas size
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pixelSize, setPixelSize] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert image to pixel data with 8-bit color quantization
  const processImage = useCallback((file: File): Promise<string[][]> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      img.onload = () => {
        try {
          // Create preview
          const previewCanvas = document.createElement('canvas');
          const previewCtx = previewCanvas.getContext('2d');
          if (previewCtx) {
            previewCanvas.width = 200;
            previewCanvas.height = 200;
            previewCtx.drawImage(img, 0, 0, 200, 200);
            setPreviewUrl(previewCanvas.toDataURL());
          }

          // Set canvas size to target pixel dimensions
          canvas.width = CANVAS_SIZE;
          canvas.height = CANVAS_SIZE;

          // Draw image and scale it to fit canvas
          ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

          // Apply pixelation effect if pixelSize > 1
          if (pixelSize > 1) {
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            if (tempCtx) {
              tempCanvas.width = CANVAS_SIZE;
              tempCanvas.height = CANVAS_SIZE;
              
              // Draw at smaller size and scale up for pixelation
              const smallSize = Math.floor(CANVAS_SIZE / pixelSize);
              tempCtx.drawImage(canvas, 0, 0, smallSize, smallSize);
              ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
              ctx.imageSmoothingEnabled = false;
              ctx.drawImage(tempCanvas, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
            }
          }

          // Get pixel data
          const imageData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
          const data = imageData.data;

          // 8-bit color quantization (256 colors)
          const colorMap = new Map<string, string>();
          const rPlaceColors = [
            '#000000', '#FFFFFF', '#BE0039', '#FF4500', '#FFA800', '#FFD635', '#00A368', '#00CC78', 
            '#7EED56', '#2450A4', '#3690EA', '#51E9F4', '#811E9F', '#B44AC0', '#FF99AA', '#9C6926', 
            '#898D90', '#D4D7D9'
          ];

          // Convert to 2D array of hex colors with 8-bit quantization
          const pixelData: string[][] = [];
          for (let y = 0; y < CANVAS_SIZE; y++) {
            const row: string[] = [];
            for (let x = 0; x < CANVAS_SIZE; x++) {
              const index = (y * CANVAS_SIZE + x) * 4;
              const r = data[index];
              const g = data[index + 1];
              const b = data[index + 2];
              const a = data[index + 3];

              // Skip transparent pixels
              if (a < 128) {
                row.push('#FFFFFF');
                continue;
              }

              // Convert to 8-bit color (quantize to nearest r/place color or create 8-bit equivalent)
              const originalHex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
              
              // Check if we already processed this color
              if (colorMap.has(originalHex)) {
                row.push(colorMap.get(originalHex)!);
                continue;
              }

              // Find nearest r/place color or create 8-bit equivalent
              let quantizedColor = findNearestColor(r, g, b, rPlaceColors);
              
              // If we have room for more colors, create 8-bit equivalent
              if (colorMap.size < 256) {
                // Simple 8-bit quantization: reduce each channel to 6 bits (64 levels each)
                const r6 = Math.round(r / 4) * 4;
                const g6 = Math.round(g / 4) * 4;
                const b6 = Math.round(b / 4) * 4;
                quantizedColor = `#${((1 << 24) + (r6 << 16) + (g6 << 8) + b6).toString(16).slice(1)}`;
              }

              colorMap.set(originalHex, quantizedColor);
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
  }, [CANVAS_SIZE, pixelSize]);

  // Helper function to find nearest color from r/place palette
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

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setIsProcessing(true);
    try {
      const pixelData = await processImage(file);
      onImageUpload(pixelData);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [processImage, onImageUpload]);

  // Handle drag and drop events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Trigger file input
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? 'border-accent bg-accent/10'
            : 'border-card-border bg-card-bg'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-3">
          <Icon 
            name="plus" 
            size="lg" 
            className={`mx-auto ${isDragOver ? 'text-accent' : 'text-foreground-muted'}`}
          />
          
          <div>
            <p className="text-sm font-medium text-foreground">
              {isProcessing ? 'Processing image...' : 'Upload Pixel Art'}
            </p>
            <p className="text-xs text-foreground-muted mt-1">
              Drag and drop an image here, or click to select
            </p>
            <p className="text-xs text-foreground-muted">
              Image will be converted to {CANVAS_SIZE}x{CANVAS_SIZE} pixels
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleUploadClick}
            disabled={isProcessing}
            className="mx-auto"
          >
            {isProcessing ? 'Processing...' : 'Select Image'}
          </Button>
        </div>
      </div>

      {/* Pixel Size Control */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          Pixel Size Effect
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="1"
            max="8"
            value={pixelSize}
            onChange={(e) => setPixelSize(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-xs text-foreground-muted w-8">
            {pixelSize}x
          </span>
        </div>
        <p className="text-xs text-foreground-muted">
          Higher values create more pixelated effects
        </p>
      </div>

      {/* Preview */}
      {previewUrl && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-foreground">
              Preview
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="h-6 px-2 text-xs"
            >
              {showPreview ? 'Hide' : 'Show'}
            </Button>
          </div>
          {showPreview && (
            <div className="bg-card-bg p-4 rounded-lg border border-card-border">
              <Image 
                src={previewUrl} 
                alt="Preview" 
                width={200}
                height={128}
                className="w-full h-auto max-h-32 object-contain mx-auto"
              />
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
}
