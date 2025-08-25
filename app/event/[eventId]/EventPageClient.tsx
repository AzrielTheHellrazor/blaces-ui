"use client";

import {
  useMiniKit,
} from "@coinbase/onchainkit/minikit";
import { useEffect, useState } from "react";
import { Canvas } from "../../components/BlacesComponents";
import { createPortal } from "react-dom";

// Curated color palette with 64 most useful colors
const COLORS = [
  // Essential colors
  '#000000', '#FFFFFF', '#808080', '#C0C0C0',
  
  // Reds
  '#FF0000', '#FF3333', '#FF6666', '#CC0000', '#990000', '#660000',
  
  // Oranges
  '#FF6600', '#FF9900', '#FFCC00', '#CC6600',
  
  // Yellows
  '#FFFF00', '#FFFF33', '#CCCC00', '#999900',
  
  // Greens
  '#00FF00', '#33FF33', '#66FF66', '#00CC00', '#009900', '#006600',
  
  // Teals/Cyans
  '#00FFFF', '#33FFFF', '#00CCCC',
  
  // Blues
  '#0000FF', '#3333FF', '#6666FF', '#9999FF', '#0000CC', '#000099', '#000066',
  
  // Purples
  '#8000FF', '#9933FF', '#CC66FF', '#6600CC', '#330099',
  
  // Pinks/Magentas
  '#FF00FF', '#FF33FF', '#FF66FF', '#CC00CC', '#990099',
  
  // Browns
  '#8B4513', '#A0522D', '#CD853F', '#D2691E',
  
  // Pastels
  '#FFB6C1', '#FFC0CB', '#F0F8FF', '#F0FFF0',
  
  // Dark variants
  '#2F2F2F', '#4F4F4F', '#6F6F6F', '#8F8F8F',
  
  // Vibrant extras
  '#FF1493', '#FF4500', '#FFD700', '#32CD32', '#00CED1', '#9370DB', '#FF6347', '#FF8C00'
];

type EventPageClientProps = {
  eventId: string;
};

export function EventPageClient({ eventId }: EventPageClientProps) {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const paletteElement = (
    <div 
      className="bg-white rounded-lg shadow-lg border border-gray-200 p-3"
      style={{
        position: 'fixed',
        top: '50vh',
        right: '16px',
        transform: 'translateY(-50%)',
        zIndex: 999999,
        pointerEvents: 'auto',
        isolation: 'isolate',
        contain: 'layout style paint',
        transformStyle: 'preserve-3d',
        willChange: 'auto',
        maxWidth: '80px'
      }}
    >
      <div 
        className="grid grid-cols-2 gap-1 max-h-[500px] overflow-y-auto"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => setSelectedColor(color)}
            className={`w-5 h-5 rounded border transition-all ${
              selectedColor === color ? 'border-black scale-110' : 'border-gray-300 hover:border-gray-500'
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div className="w-full h-screen bg-gray-200 overflow-hidden relative">
        {/* Full Screen Canvas - Pixel Place Style */}
        <Canvas eventId={eventId} selectedColor={selectedColor} />
      </div>
      
      {/* Color Palette - Rendered as Portal to avoid zoom interference */}
      {mounted && createPortal(paletteElement, document.body)}
    </>
  );
}
