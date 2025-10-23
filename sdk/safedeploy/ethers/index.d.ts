import { ethers } from 'ethers';
import { Safe3QRDeploy, Safe3QRDeployOptions, Safe3Signer } from '../core';
export interface Safe3EthersSignerOptions extends Safe3QRDeployOptions {
    chainId?: number;
    rpcUrl?: string;
}
export declare class Safe3EthersSigner extends Safe3QRDeploy implements Safe3Signer {
    private provider;
    private ethersSigner;
    private ethersOptions;
    constructor(options: Safe3EthersSignerOptions);
    /**
     * Connect to wallet and setup ethers provider/signer
     */
    connectWallet(): Promise<any>;
    /**
     * Setup ethers provider and signer
     */
    private setupEthersProvider;
    /**
     * Get ethers signer instance
     */
    getSigner(): ethers.JsonRpcSigner;
    /**
     * Get ethers provider instance
     */
    getProvider(): ethers.JsonRpcProvider;
    /**
     * Deploy a contract using ethers ContractFactory
     */
    deployContract(factory: ethers.ContractFactory, ...args: any[]): Promise<any>;
    /**
     * Deploy contract from ABI and bytecode
     */
    deployContractFromABI(abi: any[], bytecode: string, ...args: any[]): Promise<any>;
    /**
     * Get default RPC URL for chain
     */
    private getDefaultRpcUrl;
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map