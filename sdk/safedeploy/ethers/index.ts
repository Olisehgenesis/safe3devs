import { ethers } from 'ethers';
import { Safe3QRDeploy, Safe3QRDeployOptions, Safe3Signer } from '../core';

export interface Safe3EthersSignerOptions extends Safe3QRDeployOptions {
  chainId?: number;
  rpcUrl?: string;
}

export class Safe3EthersSigner extends Safe3QRDeploy implements Safe3Signer {
  private provider: ethers.JsonRpcProvider | null = null;
  private ethersSigner: ethers.Signer | null = null;
  private ethersOptions: Safe3EthersSignerOptions;

  constructor(options: Safe3EthersSignerOptions) {
    super(options);
    this.ethersOptions = options;
  }

  /**
   * Connect to wallet and setup ethers provider/signer
   */
  async connectWallet(): Promise<any> {
    const session = await super.connectWallet();
    await this.setupEthersProvider();
    return session;
  }

  /**
   * Setup ethers provider and signer
   */
  private async setupEthersProvider(): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Wallet not connected');
    }

    const chainId = this.ethersOptions.chainId || 1;
    const rpcUrl = this.ethersOptions.rpcUrl || this.getDefaultRpcUrl(chainId);

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Create a simple mock signer for testing
    this.ethersSigner = {
      getAddress: () => this.getAddress(),
      signTransaction: (tx: any) => this.sendTransaction(tx),
      signMessage: (msg: string) => this.signMessage(msg),
      sendTransaction: (tx: any) => this.sendTransaction(tx),
      connect: (provider: any) => this.ethersSigner,
      provider: this.provider
    } as any;
  }

  /**
   * Get ethers signer instance
   */
  getSigner(): any {
    if (!this.ethersSigner) {
      throw new Error('Signer not initialized. Call connectWallet() first.');
    }
    return this.ethersSigner;
  }

  /**
   * Get ethers provider instance
   */
  getProvider(): ethers.JsonRpcProvider {
    if (!this.provider) {
      throw new Error('Provider not initialized. Call connectWallet() first.');
    }
    return this.provider;
  }

  /**
   * Deploy a contract using ethers ContractFactory
   */
  async deployContract(
    factory: ethers.ContractFactory,
    ...args: any[]
  ): Promise<any> {
    if (!this.ethersSigner) {
      throw new Error('Signer not initialized. Call connectWallet() first.');
    }

    try {
      const contract = await factory.connect(this.ethersSigner).deploy(...args);
      await contract.waitForDeployment();
      return contract;
    } catch (error) {
      console.error('Failed to deploy contract:', error);
      throw error;
    }
  }

  /**
   * Deploy contract from ABI and bytecode
   */
  async deployContractFromABI(
    abi: any[],
    bytecode: string,
    ...args: any[]
  ): Promise<any> {
    const factory = new ethers.ContractFactory(abi, bytecode);
    return this.deployContract(factory, ...args);
  }

  /**
   * Get default RPC URL for chain
   */
  private getDefaultRpcUrl(chainId: number): string {
    const rpcUrls: Record<number, string> = {
      1: 'https://eth.llamarpc.com',
      137: 'https://polygon.llamarpc.com',
      56: 'https://bsc.llamarpc.com',
      42161: 'https://arbitrum.llamarpc.com',
      10: 'https://optimism.llamarpc.com',
      8453: 'https://base.llamarpc.com',
      44787: 'https://alfajores-forno.celo-testnet.org' // Alfajores Celo testnet
    };

    return rpcUrls[chainId] || `https://eth.llamarpc.com`;
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await super.cleanup();
    this.provider = null;
    this.ethersSigner = null;
  }
}

/**
 * Custom ethers signer wrapper that uses WalletConnect for signing
 * Temporarily disabled for testing
 */
/*
class Safe3EthersSignerWrapper {
  provider: any;
  private safe3Signer: Safe3EthersSigner;

  constructor(provider: any, safe3Signer: Safe3EthersSigner) {
    this.provider = provider;
    this.safe3Signer = safe3Signer;
  }

  async getAddress(): Promise<string> {
    return this.safe3Signer.getAddress();
  }

  async signTransaction(transaction: any): Promise<string> {
    // Convert ethers transaction to WalletConnect format
    const tx = {
      from: await this.getAddress(),
      to: transaction.to,
      value: transaction.value ? ethers.toBeHex(transaction.value) : '0x0',
      data: transaction.data || '0x',
      gas: transaction.gasLimit ? ethers.toBeHex(transaction.gasLimit) : undefined,
      gasPrice: transaction.gasPrice ? ethers.toBeHex(transaction.gasPrice) : undefined,
      maxFeePerGas: transaction.maxFeePerGas ? ethers.toBeHex(transaction.maxFeePerGas) : undefined,
      maxPriorityFeePerGas: transaction.maxPriorityFeePerGas ? ethers.toBeHex(transaction.maxPriorityFeePerGas) : undefined,
      nonce: transaction.nonce ? ethers.toBeHex(transaction.nonce) : undefined,
      chainId: transaction.chainId || 1
    };

    // Remove undefined values
    Object.keys(tx).forEach(key => {
      if (tx[key as keyof typeof tx] === undefined) {
        delete tx[key as keyof typeof tx];
      }
    });

    return this.safe3Signer.sendTransaction(tx);
  }

  async signMessage(message: string | Uint8Array): Promise<string> {
    const messageStr = typeof message === 'string' ? message : ethers.toUtf8String(message);
    return this.safe3Signer.signMessage(messageStr);
  }

  async signTypedData(domain: ethers.TypedDataDomain, types: Record<string, ethers.TypedDataField[]>, value: Record<string, any>): Promise<string> {
    throw new Error('signTypedData not implemented for WalletConnect signer');
  }

  async sendTransaction(transaction: any): Promise<any> {
    const txHash = await this.signTransaction(transaction);
    
    // Create transaction response object
    return {
      hash: txHash,
      from: await this.getAddress(),
      to: transaction.to,
      value: transaction.value || 0n,
      data: transaction.data || '0x',
      gasLimit: transaction.gasLimit || 0n,
      gasPrice: transaction.gasPrice || 0n,
      maxFeePerGas: transaction.maxFeePerGas,
      maxPriorityFeePerGas: transaction.maxPriorityFeePerGas,
      nonce: transaction.nonce || 0,
      chainId: transaction.chainId || 1,
      type: transaction.type || 2,
      blockNumber: null,
      blockHash: null,
      timestamp: 0,
      confirmations: 0,
      wait: async () => {
        // Wait for transaction confirmation
        if (!this.provider) {
          throw new Error('Provider not available');
        }
        const receipt = await (this.provider as ethers.JsonRpcProvider).waitForTransaction(txHash);
        return receipt!;
      }
    } as any;
  }

*/
