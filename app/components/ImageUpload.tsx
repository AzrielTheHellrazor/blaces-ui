"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "./DemoComponents";
import { Icon } from "./DemoComponents";

interface ImageUploadProps {
  onImageUpload: (pixelData: string[][]) => void;
  canvasSize: number;
}

export function ImageUpload({ onImageUpload, canvasSize }: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pixelSize, setPixelSize] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert image to pixel data with advanced processing
  const processImage = useCallback((file: File): Promise<string[][]> => {
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
          canvas.width = canvasSize;
          canvas.height = canvasSize;

          // Draw image and scale it to fit canvas
          ctx.drawImage(img, 0, 0, canvasSize, canvasSize);

          // Apply pixelation effect if pixelSize > 1
          if (pixelSize > 1) {
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            if (tempCtx) {
              tempCanvas.width = canvasSize;
              tempCanvas.height = canvasSize;
              
              // Draw at smaller size and scale up for pixelation
              const smallSize = Math.floor(canvasSize / pixelSize);
              tempCtx.drawImage(canvas, 0, 0, smallSize, smallSize);
              ctx.clearRect(0, 0, canvasSize, canvasSize);
              ctx.imageSmoothingEnabled = false;
              ctx.drawImage(tempCanvas, 0, 0, canvasSize, canvasSize);
            }
          }

          // Get pixel data
          const imageData = ctx.getImageData(0, 0, canvasSize, canvasSize);
          const data = imageData.data;

          // Convert to 2D array of hex colors with color quantization
          const pixelData: string[][] = [];
          for (let y = 0; y < canvasSize; y++) {
            const row: string[] = [];
            for (let x = 0; x < canvasSize; x++) {
              const index = (y * canvasSize + x) * 4;
              const r = data[index];
              const g = data[index + 1];
              const b = data[index + 2];
              const a = data[index + 3];

              // Skip transparent pixels
              if (a < 128) {
                row.push('#FFFFFF');
                continue;
              }

              // Convert to hex color
              const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
              row.push(hex);
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
  }, [canvasSize, pixelSize]);

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
  }, [processImage, onImageUpload, canvasSize]);

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
            name="upload" 
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
              Image will be converted to {canvasSize}x{canvasSize} pixels
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
              <img 
                src={previewUrl} 
                alt="Preview" 
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
