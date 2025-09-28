import { upload } from "thirdweb/storage";
import { thirdwebClient } from "./thirdweb-client";

export interface IPFSUploadResult {
  hash: string;
  url: string;
  ipfsUrl: string;
}

export const uploadToIPFS = async (file: File): Promise<IPFSUploadResult> => {
  try {
    const uploadedURI = await upload({
      client: thirdwebClient,
      files: [file],
    });

    // Clean the uploaded URI to get just the hash
    const cleanHash = uploadedURI.replace('ipfs://', '');
    const ipfsURL = `ipfs://${cleanHash}`;
    const gatewayURL = `https://ipfs.io/ipfs/${cleanHash}`;

    return {
      hash: cleanHash,
      url: gatewayURL,
      ipfsUrl: ipfsURL,
    };
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw new Error('Failed to upload to IPFS');
  }
};

export const uploadBufferToIPFS = async (buffer: ArrayBuffer, filename: string): Promise<IPFSUploadResult> => {
  try {
    const file = new File([buffer], filename, { type: 'image/png' });
    return await uploadToIPFS(file);
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw new Error('Failed to upload to IPFS');
  }
};

export const getIPFSURL = (hash: string): string => {
  return `https://ipfs.io/ipfs/${hash}`;
};

export const ipfsToHttp = (url: string): string => {
  if (!url) return '';
  
  // If it's already an HTTP URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Handle IPFS URLs
  if (url.startsWith('ipfs://')) {
    const hash = url.replace('ipfs://', '');
    return `https://ipfs.io/ipfs/${hash}`;
  }
  
  // Handle raw IPFS hashes (without ipfs:// prefix)
  if (url.match(/^Qm[1-9A-HJ-NP-Za-km-z]{44}$/)) {
    return `https://ipfs.io/ipfs/${url}`;
  }
  
  // Handle data URLs (base64 images)
  if (url.startsWith('data:')) {
    return url;
  }
  
  return url;
};
