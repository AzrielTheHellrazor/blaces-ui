"use client";

import { useState } from "react";
import { Button } from "./DemoComponents";
import { Icon } from "./DemoComponents";
import { Card } from "./DemoComponents";
import { thirdwebClient } from "../../lib/thirdweb-client";
import { getContract, prepareContractCall, sendTransaction } from "thirdweb";
import { useActiveAccount } from "thirdweb/react";

// ERC1155Factory Contract ABI
const ERC1155_FACTORY_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "collections",
    "outputs": [{"internalType": "contract ERC1155Collection", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "tokenName", "type": "string"},
      {"internalType": "string", "name": "imageURI", "type": "string"}
    ],
    "name": "createNFTContract",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "index", "type": "uint256"}],
    "name": "getCollection",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCollectionsCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

const ERC1155_FACTORY_CONTRACT = process.env.NEXT_PUBLIC_ERC1155_FACTORY_CONTRACT!;

interface MintNFTButtonProps {
  ipfsHash: string;
  tokenName: string;
  className?: string;
}

export function MintNFTButton({ ipfsHash, tokenName, className }: MintNFTButtonProps) {
  const [isMinting, setIsMinting] = useState(false);
  const [mintedContract, setMintedContract] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const account = useActiveAccount();

  // Get the factory contract
  const factoryContract = getContract({
    client: thirdwebClient,
    address: ERC1155_FACTORY_CONTRACT,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    abi: ERC1155_FACTORY_ABI as any,
    chain: {
      id: 8453, // Base chain
      name: "Base",
      rpc: "https://mainnet.base.org",
      nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
      },
    },
  });

  const handleMintNFT = async () => {
    if (!ipfsHash || !tokenName) {
      setError("Missing required data for NFT creation");
      return;
    }

    setIsMinting(true);
    setError("");

    try {
      // Create the full IPFS URI
      const ipfsURI = `ipfs://${ipfsHash}`;
      
      // Prepare the contract call
      const transaction = prepareContractCall({
        contract: factoryContract,
        method: "createNFTContract",
        params: [tokenName, ipfsURI],
      });

      // Send the transaction
      const result = await sendTransaction({
        transaction,
        account: account!,
      });

      console.log("NFT Collection created:", result);
      setMintedContract(result.transactionHash);
      setError("");

    } catch (error) {
      console.error("NFT creation error:", error);
      setError(`Failed to create NFT: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsMinting(false);
    }
  };

  if (mintedContract) {
    return (
      <Card className="p-4">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center">
            <Icon name="check" size="sm" className="text-green-500 mr-2" />
            <span className="text-green-700 font-medium">NFT Collection Created!</span>
          </div>
          <div className="text-sm text-gray-600">
            <p className="font-medium">Contract Address:</p>
            <p className="font-mono text-xs break-all bg-gray-100 p-2 rounded mt-1">
              {mintedContract}
            </p>
          </div>
          <a
            href={`https://basescan.org/address/${mintedContract}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm inline-block"
          >
            🔗 View on BaseScan →
          </a>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={handleMintNFT}
        disabled={isMinting || !ipfsHash || !tokenName}
        className={`w-full h-12 text-base ${className || ''}`}
        icon={<Icon name="star" size="sm" />}
      >
        {isMinting ? 'Creating NFT...' : 'Mint as NFT'}
      </Button>
      
      {error && (
        <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200">
          {error}
        </div>
      )}
    </div>
  );
}
