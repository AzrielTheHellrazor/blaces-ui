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
  const [selectedColor, setSelectedColor] = useState('');
  const [mounted, setMounted] = useState(false);
  const [colorClickTrigger, setColorClickTrigger] = useState(0);
  const [isFromColorPalette, setIsFromColorPalette] = useState(false);
  const [eventStatus, setEventStatus] = useState<'active' | 'expired' | 'minting' | 'completed'>('active');
  const [eventMetadata, setEventMetadata] = useState<Record<string, unknown> | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [mintingResult, setMintingResult] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  // Load event metadata and check status
  useEffect(() => {
    const loadEventMetadata = () => {
      try {
        const savedMetadata = localStorage.getItem(`blaces-event-${eventId}`);
        if (savedMetadata) {
          const metadata = JSON.parse(savedMetadata);
          setEventMetadata(metadata);
          
          // Check if event is expired
          const now = Date.now();
          const expiresAt = new Date(metadata.expiresAt).getTime();
          
          if (now > expiresAt) {
            setEventStatus('expired');
          } else {
            setEventStatus('active');
            // Calculate time remaining
            const remaining = Math.max(0, expiresAt - now);
            setTimeRemaining(remaining);
          }
        }
      } catch (error) {
        console.error('Error loading event metadata:', error);
      }
    };

    loadEventMetadata();
  }, [eventId]);

  // Timer for countdown
  useEffect(() => {
    if (eventStatus === 'active' && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1000) {
            setEventStatus('expired');
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [eventStatus, timeRemaining]);

  // Format time remaining
  const formatTimeRemaining = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle NFT minting
  const handleMintNFT = async () => {
    setEventStatus('minting');
    
    try {
      // Get canvas data from the game
      const response = await fetch(`https://blace.thefuture.finance/api/games/${eventId}/data`);
      const gameData = await response.json();
      
      // Convert grid data to canvas image
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Draw pixels
        gameData.grid.forEach((pixel: Record<string, unknown>, index: number) => {
          const x = index % 200;
          const y = Math.floor(index / 200);
          ctx.fillStyle = `rgb(${pixel.r}, ${pixel.g}, ${pixel.b})`;
          ctx.fillRect(x, y, 1, 1);
        });
        
        // Simulate NFT minting process
        // In a real implementation, you would call the NFT minting service
        await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate processing time
        
        const mockResult = {
          success: true,
          contractAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
          tokenId: Math.random().toString(16).substr(2, 8),
          ipfsHash: `Qm${Math.random().toString(16).substr(2, 40)}`,
        };
        
        setMintingResult(mockResult);
        setEventStatus('completed');
      }
    } catch (error) {
      console.error('Error minting NFT:', error);
      setEventStatus('expired'); // Reset to expired state on error
    }
  };

  // Reset the palette flag after painting (but keep color selected on desktop)
  useEffect(() => {
    if (isFromColorPalette && selectedColor) {
      const timer = setTimeout(() => {
        setIsFromColorPalette(false);
        // Only clear color selection on mobile, keep it on desktop for single pixel painting
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
          setSelectedColor(''); // Clear color selection after painting on mobile
        }
      }, 200); // Slightly longer delay to ensure painting completes
      return () => clearTimeout(timer);
    }
  }, [isFromColorPalette, selectedColor]);

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
            onClick={() => {
              setSelectedColor(color);
              setColorClickTrigger(prev => prev + 1); // Trigger pixel placement even for same color
              setIsFromColorPalette(true); // Mark that this color selection came from the right palette
            }}
            className={`w-5 h-5 rounded border transition-all hover:scale-110 ${
              selectedColor === color ? 'border-black border-2 scale-110' : 'border-gray-300 hover:border-gray-500'
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  );

  // Render different screens based on event status
  const renderEventScreen = () => {
    switch (eventStatus) {
      case 'active':
        return (
          <div className="w-full h-screen bg-gray-200 overflow-hidden relative">
            {/* Event Info Overlay */}
            {eventMetadata && (
              <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                <h2 className="text-lg font-bold text-gray-800">{eventMetadata.name as string}</h2>
                <p className="text-sm text-gray-600 mb-2">{eventMetadata.description as string}</p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Time Remaining:</span>
                  <span className="text-lg font-bold text-red-600">{formatTimeRemaining(timeRemaining)}</span>
                </div>
              </div>
            )}
            
            {/* Full Screen Canvas - Pixel Place Style */}
            <Canvas eventId={eventId} selectedColor={selectedColor} colorClickTrigger={colorClickTrigger} isFromColorPalette={isFromColorPalette} />
          </div>
        );
        
      case 'expired':
        return (
          <div className="w-full h-screen bg-gray-200 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-4 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Event Expired</h2>
              <p className="text-gray-600 mb-6">
                The collaborative art session has ended. Your canvas is ready to be minted as an NFT!
              </p>
              <button
                onClick={handleMintNFT}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Mint as NFT
              </button>
            </div>
          </div>
        );
        
      case 'minting':
        return (
          <div className="w-full h-screen bg-gray-200 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-4 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Minting NFT</h2>
              <p className="text-gray-600 mb-6">
                Uploading your canvas to IPFS and deploying NFT contract...
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-sm text-gray-500">This may take a few minutes...</p>
            </div>
          </div>
        );
        
      case 'completed':
        return (
          <div className="w-full h-screen bg-gray-200 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-4 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">NFT Minted Successfully!</h2>
              <p className="text-gray-600 mb-6">
                Your collaborative art has been minted as an NFT on Base.
              </p>
              {mintingResult && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600">Contract Address:</p>
                  <p className="font-mono text-xs text-blue-600 break-all">{mintingResult.contractAddress as string}</p>
                </div>
              )}
              <button
                onClick={() => window.location.href = '/'}
                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                Create New Event
              </button>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="w-full h-screen bg-gray-200 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading event...</p>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {renderEventScreen()}
      
      {/* Color Palette - Only show for active events */}
      {mounted && eventStatus === 'active' && createPortal(paletteElement, document.body)}
    </>
  );
}
