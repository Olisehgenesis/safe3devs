import { ethers } from 'ethers';
import { Safe3QRDeploy, Safe3QRDeployOptions, Safe3Signer } from '../core';

export interface Safe3EthersSignerOptions extends Safe3QRDeployOptions {
  chainId?: number;
  rpcUrl?: string;
}

export class Safe3EthersSigner extends Safe3QRDeploy implements Safe3Signer {
  private provider: ethers.JsonRpcProvider | null = null;
  private ethersSigner: ethers.JsonRpcSigner | null = null;
  private options: Safe3EthersSignerOptions;

  constructor(options: Safe3EthersSignerOptions) {
    super(options);
    this.options = options;
  }

  /**
   * Connect to wallet and setup ethers provider/signer
   */
  async connectWallet(): Promise<void> {
    await super.connectWallet();
    await this.setupEthersProvider();
  }

  /**
   * Setup ethers provider and signer
   */
  private async setupEthersProvider(): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Wallet not connected');
    }

    const chainId = this.options.chainId || 1;
    const rpcUrl = this.options.rpcUrl || this.getDefaultRpcUrl(chainId);

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.ethersSigner = new Safe3EthersSignerWrapper(this.provider, this);
  }

  /**
   * Get ethers signer instance
   */
  getSigner(): ethers.JsonRpcSigner {
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
  ): Promise<ethers.Contract> {
    if (!this.ethersSigner) {
      throw new Error('Signer not initialized. Call connectWallet() first.');
    }

    try {
      const contract = await factory.connect(this.ethersSigner).deploy(...args);
      await contract.waitForDeployment();
      return contract;
    } catch (error) {
      this.logger.error('Failed to deploy contract:', error);
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
  ): Promise<ethers.Contract> {
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
      8453: 'https://base.llamarpc.com'
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
 */
class Safe3EthersSignerWrapper extends ethers.JsonRpcSigner {
  private safe3Signer: Safe3EthersSigner;

  constructor(provider: ethers.JsonRpcProvider, safe3Signer: Safe3EthersSigner) {
    super(provider, '');
    this.safe3Signer = safe3Signer;
  }

  async getAddress(): Promise<string> {
    return this.safe3Signer.getAddress();
  }

  async signTransaction(transaction: ethers.TransactionRequest): Promise<string> {
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

  async sendTransaction(transaction: ethers.TransactionRequest): Promise<ethers.TransactionResponse> {
    const txHash = await this.signTransaction(transaction);
    
    // Create a mock transaction response
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
        const receipt = await this.provider!.waitForTransaction(txHash);
        return receipt!;
      }
    } as ethers.TransactionResponse;
  }

  connect(provider: ethers.Provider): ethers.JsonRpcSigner {
    return new Safe3EthersSignerWrapper(provider as ethers.JsonRpcProvider, this.safe3Signer);
  }
}
