// Constants for the application

// USDC Contract Address on Base Sepolia
export const USDC_CONTRACT_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

// ImageGenerator Contract Address on Base Sepolia
export const IMAGE_GENERATOR_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_CONTRACT || "0x8C93345a5e6D49B85D5259236E63084146a3fe1c";

// Payment recipient address (your wallet address)
export const PAYMENT_RECIPIENT_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS || "";

// Event creation fee in USDC
export const EVENT_CREATION_FEE = 1; // 1 USDC

// Minimum event duration in minutes
export const MIN_EVENT_DURATION = 5; // 5 minutes

// Maximum event duration in minutes
export const MAX_EVENT_DURATION = 1440; // 24 hours

// Default event duration in minutes
export const DEFAULT_EVENT_DURATION = 60; // 1 hour

// Canvas size
export const CANVAS_SIZE = 200; // 200x200 pixels

// NFT metadata
export const NFT_NAME_PREFIX = "Blaces Event";
export const NFT_DESCRIPTION = "A collaborative pixel art creation from Blaces";

