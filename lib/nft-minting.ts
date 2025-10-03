// NFT Minting System for Event Completion
// Handles IPFS upload and ERC1155 contract deployment

import { createThirdwebClient } from "thirdweb";
import { uploadToIPFS } from "./ipfs-utils";

export interface NFTMetadata {
  name: string;
  description: string;
  image: string; // IPFS hash
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

export interface MintingResult {
  success: boolean;
  contractAddress?: string;
  tokenId?: string;
  ipfsHash?: string;
  error?: string;
}

export class NFTMintingService {
  private client: unknown;

  constructor() {
    this.client = createThirdwebClient({
      clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
    });
  }

  /**
   * Upload canvas image to IPFS
   */
  async uploadCanvasToIPFS(
    canvasDataUrl: string,
    eventName: string
  ): Promise<string> {
    try {
      // Convert data URL to blob
      const response = await fetch(canvasDataUrl);
      const blob = await response.blob();
      
      // Create file from blob
      const file = new File([blob], `${eventName}-canvas.png`, {
        type: 'image/png',
      });

      // Upload to IPFS
      const ipfsResult = await uploadToIPFS(file);
      return ipfsResult.hash;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw new Error('Failed to upload canvas to IPFS');
    }
  }

  /**
   * Create NFT metadata
   */
  createNFTMetadata(
    eventName: string,
    eventDescription: string,
    ipfsHash: string,
    eventId: string
  ): NFTMetadata {
    return {
      name: `${eventName} - Blaces Event`,
      description: eventDescription || "A collaborative pixel art creation from Blaces",
      image: `ipfs://${ipfsHash}`,
      attributes: [
        {
          trait_type: "Event ID",
          value: eventId,
        },
        {
          trait_type: "Platform",
          value: "Blaces",
        },
        {
          trait_type: "Type",
          value: "Collaborative Art",
        },
        {
          trait_type: "Canvas Size",
          value: "200x200",
        },
      ],
    };
  }

  /**
   * Upload metadata to IPFS
   */
  async uploadMetadataToIPFS(metadata: NFTMetadata): Promise<string> {
    try {
      const metadataJson = JSON.stringify(metadata, null, 2);
      const file = new File([metadataJson], 'metadata.json', {
        type: 'application/json',
      });

      const ipfsResult = await uploadToIPFS(file);
      return ipfsResult.hash;
    } catch (error) {
      console.error('Error uploading metadata to IPFS:', error);
      throw new Error('Failed to upload metadata to IPFS');
    }
  }

  /**
   * Deploy ERC1155 contract with metadata
   */
  async deployERC1155Contract(
    metadataUri: string
  ): Promise<MintingResult> {
    try {
      // This would typically involve deploying a custom ERC1155 contract
      // For now, we'll simulate the deployment process
      
      // In a real implementation, you would:
      // 1. Deploy the ERC1155 contract with the metadata URI
      // 2. Mint the NFT to the event creator
      // 3. Return the contract address and token ID

      // For demonstration, we'll return a mock result
      const mockContractAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
      const mockTokenId = Math.random().toString(16).substr(2, 8);

      return {
        success: true,
        contractAddress: mockContractAddress,
        tokenId: mockTokenId,
        ipfsHash: metadataUri,
      };
    } catch (error) {
      console.error('Error deploying ERC1155 contract:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Contract deployment failed',
      };
    }
  }

  /**
   * Complete NFT minting process
   */
  async mintEventNFT(
    canvasDataUrl: string,
    eventName: string,
    eventDescription: string,
    eventId: string
  ): Promise<MintingResult> {
    try {
      // Step 1: Upload canvas image to IPFS
      const imageIpfsHash = await this.uploadCanvasToIPFS(canvasDataUrl, eventName);
      
      // Step 2: Create metadata
      const metadata = this.createNFTMetadata(
        eventName,
        eventDescription,
        imageIpfsHash,
        eventId
      );
      
      // Step 3: Upload metadata to IPFS
      const metadataIpfsHash = await this.uploadMetadataToIPFS(metadata);
      
      // Step 4: Deploy ERC1155 contract
      const result = await this.deployERC1155Contract(metadataIpfsHash);
      
      if (result.success) {
        result.ipfsHash = imageIpfsHash;
      }
      
      return result;
    } catch (error) {
      console.error('Error minting NFT:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'NFT minting failed',
      };
    }
  }
}

// Default NFT minting service instance
export const nftMintingService = new NFTMintingService();
