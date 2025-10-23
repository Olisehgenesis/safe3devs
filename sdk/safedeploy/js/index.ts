import { Safe3EthersSigner, Safe3EthersSignerOptions } from '../ethers';
import { Safe3ViemClient, Safe3ViemClientOptions } from '../viem';

export type ClientType = 'ethers' | 'viem';

export interface Safe3ClientOptions {
  client: ClientType;
  projectId: string;
  chainId?: number;
  rpcUrl?: string;
  metadata?: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
  relayUrl?: string;
  logger?: string;
}

export type Safe3Client = Safe3EthersSigner | Safe3ViemClient;

/**
 * Factory function to create Safe3 client based on specified type
 */
export function createSafe3Client(options: Safe3ClientOptions): Safe3Client {
  const baseOptions = {
    projectId: options.projectId,
    chainId: options.chainId,
    rpcUrl: options.rpcUrl,
    metadata: options.metadata,
    relayUrl: options.relayUrl,
    logger: options.logger
  };

  switch (options.client) {
    case 'ethers':
      return new Safe3EthersSigner(baseOptions as Safe3EthersSignerOptions);
    case 'viem':
      return new Safe3ViemClient(baseOptions as Safe3ViemClientOptions);
    default:
      throw new Error(`Unsupported client type: ${options.client}. Supported types: 'ethers', 'viem'`);
  }
}

/**
 * Auto-detect client type based on available dependencies
 */
export function createSafe3ClientAuto(options: Omit<Safe3ClientOptions, 'client'>): Safe3Client {
  try {
    // Try to import ethers first
    require('ethers');
    return createSafe3Client({ ...options, client: 'ethers' });
  } catch {
    try {
      // Fallback to viem
      require('viem');
      return createSafe3Client({ ...options, client: 'viem' });
    } catch {
      throw new Error('Neither ethers nor viem is available. Please install one of them.');
    }
  }
}

/**
 * Utility function to check if a client is ethers-based
 */
export function isEthersClient(client: Safe3Client): client is Safe3EthersSigner {
  return client instanceof Safe3EthersSigner;
}

/**
 * Utility function to check if a client is viem-based
 */
export function isViemClient(client: Safe3Client): client is Safe3ViemClient {
  return client instanceof Safe3ViemClient;
}

/**
 * Get the client type from a Safe3Client instance
 */
export function getClientType(client: Safe3Client): ClientType {
  return isEthersClient(client) ? 'ethers' : 'viem';
}

// Re-export types and classes for convenience
export { Safe3EthersSigner } from '../ethers';
export { Safe3ViemClient } from '../viem';
export { Safe3QRDeploy } from '../core';
export type { Safe3Signer, Safe3QRDeployOptions } from '../core';
export type { Safe3EthersSignerOptions } from '../ethers';
export type { Safe3ViemClientOptions, DeployContractOptions } from '../viem';
