import { Safe3EthersSigner } from '../ethers';
import { Safe3ViemClient } from '../viem';
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
export declare function createSafe3Client(options: Safe3ClientOptions): Safe3Client;
/**
 * Auto-detect client type based on available dependencies
 */
export declare function createSafe3ClientAuto(options: Omit<Safe3ClientOptions, 'client'>): Safe3Client;
/**
 * Utility function to check if a client is ethers-based
 */
export declare function isEthersClient(client: Safe3Client): client is Safe3EthersSigner;
/**
 * Utility function to check if a client is viem-based
 */
export declare function isViemClient(client: Safe3Client): client is Safe3ViemClient;
/**
 * Get the client type from a Safe3Client instance
 */
export declare function getClientType(client: Safe3Client): ClientType;
export { Safe3EthersSigner, Safe3ViemClient } from '../ethers';
export { Safe3QRDeploy } from '../core';
export type { Safe3Signer, Safe3QRDeployOptions } from '../core';
export type { Safe3EthersSignerOptions } from '../ethers';
export type { Safe3ViemClientOptions, DeployContractOptions } from '../viem';
//# sourceMappingURL=index.d.ts.map