"use client";

import {
  useMiniKit,
} from "@coinbase/onchainkit/minikit";
import { useEffect, useState } from "react";
import { Canvas } from "../../components/BlacesComponents";
import Image from "next/image";
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
  const [isCreator, setIsCreator] = useState(false);
  const [finalImageDataUrl, setFinalImageDataUrl] = useState<string | null>(null);
  const [mintingProgress, setMintingProgress] = useState(0);
  const [mintingStep, setMintingStep] = useState('');

  useEffect(() => {
    setMounted(true);
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  // Load event metadata and check status
  useEffect(() => {
    const loadEventMetadata = async () => {
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
            
            // Check if current user is the creator
            try {
              const response = await fetch(`/api/events/${eventId}?field=creator`);
              if (response.ok) {
                const { creator } = await response.json();
                // For now, we'll assume the user is the creator if they have the event in localStorage
                // In a real implementation, you'd get the current wallet address
                setIsCreator(true);
              }
            } catch (error) {
              console.error('Error checking creator:', error);
            }
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

  // Generate final image from canvas data
  const generateFinalImage = async () => {
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
        
        // Convert to data URL for preview
        const dataUrl = canvas.toDataURL('image/png');
        setFinalImageDataUrl(dataUrl);
        return dataUrl;
      }
    } catch (error) {
      console.error('Error generating final image:', error);
    }
    return null;
  };

  // Handle NFT minting with progress tracking
  const handleMintNFT = async () => {
    setEventStatus('minting');
    setMintingProgress(0);
    setMintingStep('Preparing image...');
    
    try {
      // Step 1: Generate final image
      setMintingProgress(20);
      setMintingStep('Generating final image...');
      const imageDataUrl = await generateFinalImage();
      
      if (!imageDataUrl) {
        throw new Error('Failed to generate final image');
      }
      
      // Step 2: Upload to IPFS (simulated)
      setMintingProgress(40);
      setMintingStep('Uploading to IPFS...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockIpfsHash = `Qm${Math.random().toString(16).substr(2, 40)}`;
      
      // Step 3: Deploy ERC1155 contract (simulated)
      setMintingProgress(70);
      setMintingStep('Deploying NFT contract...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockContractAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
      
      // Step 4: Update event with final data
      setMintingProgress(90);
      setMintingStep('Finalizing event...');
      
      const updateResponse = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caller: '0x0000000000000000000000000000000000000000', // Mock creator address
          status: 'completed',
          ipfsHash: mockIpfsHash,
          nftContractAddress: mockContractAddress,
        }),
      });
      
      if (!updateResponse.ok) {
        throw new Error('Failed to update event');
      }
      
      setMintingProgress(100);
      setMintingStep('Complete!');
      
      const mockResult = {
        success: true,
        contractAddress: mockContractAddress,
        tokenId: Math.random().toString(16).substr(2, 8),
        ipfsHash: mockIpfsHash,
      };
      
      setMintingResult(mockResult);
      setEventStatus('completed');
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
            {/* Event Info Overlay removed */}
            
            {/* Full Screen Canvas - Pixel Place Style */}
            <Canvas eventId={eventId} selectedColor={selectedColor} colorClickTrigger={colorClickTrigger} isFromColorPalette={isFromColorPalette} />
          </div>
        );
        
      case 'expired':
        return (
          <div className="w-full h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">🎨</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Event Complete!</h2>
                <p className="text-gray-600 text-lg">
                  The collaborative art session has ended. Your masterpiece is ready to be immortalized as an NFT!
                </p>
              </div>
              
              {/* Event Info */}
              {eventMetadata && (
                <div className="bg-gray-50 rounded-xl p-6 mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Event Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Event Name</p>
                      <p className="font-medium text-gray-800">{eventMetadata.name as string}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-medium text-gray-800">{eventMetadata.duration as number} minutes</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600">Description</p>
                      <p className="font-medium text-gray-800">{eventMetadata.description as string}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Creator Actions */}
              {isCreator ? (
                <div className="text-center">
                  <p className="text-gray-600 mb-6">
                    As the event creator, you can now finalize this artwork and mint it as an NFT.
                  </p>
                  <button
                    onClick={handleMintNFT}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-4 rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    🚀 Finalize & Mint NFT
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 mb-6">
                    This event has ended. Only the event creator can finalize and mint the artwork.
                  </p>
                  <button
                    onClick={() => window.location.href = '/'}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                  >
                    Back to Home
                  </button>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'minting':
        return (
          <div className="w-full h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent"></div>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Creating Your NFT</h2>
                <p className="text-gray-600 text-lg mb-6">
                  We&#39;re processing your collaborative masterpiece and preparing it for the blockchain...
                </p>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{mintingStep}</span>
                  <span className="text-sm font-medium text-gray-700">{mintingProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${mintingProgress}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Steps */}
              <div className="space-y-4">
                <div className={`flex items-center p-4 rounded-lg ${mintingProgress >= 20 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${mintingProgress >= 20 ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                    {mintingProgress >= 20 ? '✓' : '1'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Generate Final Image</p>
                    <p className="text-sm text-gray-600">Converting canvas data to high-resolution image</p>
                  </div>
                </div>
                
                <div className={`flex items-center p-4 rounded-lg ${mintingProgress >= 40 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${mintingProgress >= 40 ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                    {mintingProgress >= 40 ? '✓' : '2'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Upload to IPFS</p>
                    <p className="text-sm text-gray-600">Storing image on decentralized storage</p>
                  </div>
                </div>
                
                <div className={`flex items-center p-4 rounded-lg ${mintingProgress >= 70 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${mintingProgress >= 70 ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                    {mintingProgress >= 70 ? '✓' : '3'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Deploy NFT Contract</p>
                    <p className="text-sm text-gray-600">Creating ERC1155 contract on Base</p>
                  </div>
                </div>
                
                <div className={`flex items-center p-4 rounded-lg ${mintingProgress >= 90 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${mintingProgress >= 90 ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                    {mintingProgress >= 90 ? '✓' : '4'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Finalize Event</p>
                    <p className="text-sm text-gray-600">Updating event metadata and status</p>
                  </div>
                </div>
              </div>
              
              {/* Image Preview */}
              {finalImageDataUrl && (
                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-600 mb-4">Your masterpiece:</p>
                  <div className="inline-block border-4 border-gray-200 rounded-lg overflow-hidden">
                    <Image 
                      src={finalImageDataUrl} 
                      alt="Final artwork" 
                      width={128}
                      height={128}
                      className="w-32 h-32 object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'completed':
        return (
          <div className="w-full h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-3xl">🎉</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">NFT Created Successfully!</h2>
                <p className="text-gray-600 text-lg">
                  Your collaborative masterpiece is now immortalized on the blockchain!
                </p>
              </div>
              
              {/* NFT Details */}
              {mintingResult && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">NFT Details</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Contract Address</p>
                      <div className="bg-white rounded-lg p-3 border">
                        <p className="font-mono text-sm text-blue-600 break-all">{mintingResult.contractAddress as string}</p>
                        <a 
                          href={`https://basescan.org/address/${mintingResult.contractAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 text-sm inline-block mt-1"
                        >
                          🔗 View on BaseScan →
                        </a>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Token ID</p>
                        <p className="font-mono text-sm text-gray-800">{mintingResult.tokenId as string}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">IPFS Hash</p>
                        <p className="font-mono text-sm text-gray-800 break-all">{mintingResult.ipfsHash as string}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Final Image Display */}
              {finalImageDataUrl && (
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Masterpiece</h3>
                  <div className="inline-block border-4 border-gray-200 rounded-xl overflow-hidden shadow-lg">
                    <Image 
                      src={finalImageDataUrl} 
                      alt="Final NFT artwork" 
                      width={192}
                      height={192}
                      className="w-48 h-48 object-cover"
                    />
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.location.href = '/'}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-3 rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  🎨 Create New Event
                </button>
                {mintingResult && (
                  <button
                    onClick={() => {
                      const url = `https://basescan.org/address/${mintingResult.contractAddress}`;
                      window.open(url, '_blank');
                    }}
                    className="bg-gray-500 text-white px-8 py-3 rounded-xl hover:bg-gray-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    🔍 View on Explorer
                  </button>
                )}
              </div>
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
