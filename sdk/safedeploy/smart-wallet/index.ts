import { Safe3QRDeploy } from '../core';
import { createPublicClient, http, type Address, type Chain } from 'viem';
import { mainnet, base, polygon } from 'viem/chains';

export interface SmartWalletOptions {
  projectId: string;
  chainId?: number;
  rpcUrl?: string;
  smartWalletType: 'coinbase' | 'safe' | 'biconomy' | 'thirdweb';
  metadata?: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
}

export interface SmartWalletDeployOptions {
  abi: any[];
  bytecode: string;
  args?: any[];
  value?: bigint;
  gas?: bigint;
  gasPrice?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
}

/**
 * Safe3Devs Smart Wallet Integration
 * 
 * Supports:
 * - Coinbase Smart Wallet (passkey/biometric)
 * - Safe (multisig)
 * - Biconomy (gasless)
 * - Thirdweb (custom smart wallets)
 */
export class Safe3SmartWallet extends Safe3QRDeploy {
  private publicClient: any = null;
  private chain: Chain;
  private smartWalletOptions: SmartWalletOptions;

  constructor(options: SmartWalletOptions) {
    super(options);
    this.smartWalletOptions = options;
    this.chain = this.getChainById(options.chainId || 1);
  }

  /**
   * Connect to smart wallet via QR code
   */
  async connectWallet(): Promise<any> {
    const session = await super.connectWallet();
    await this.setupSmartWalletClient();
    return session;
  }

  /**
   * Setup smart wallet client based on type
   */
  private async setupSmartWalletClient(): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Wallet not connected');
    }

    const chainId = this.smartWalletOptions.chainId || 1;
    const rpcUrl = this.smartWalletOptions.rpcUrl || this.getDefaultRpcUrl(chainId);

    this.publicClient = createPublicClient({
      chain: this.chain,
      transport: http(rpcUrl)
    });

    console.log(`🔗 Connected to ${this.smartWalletOptions.smartWalletType} Smart Wallet`);
  }

  /**
   * Deploy contract using smart wallet
   */
  async deployContract(options: SmartWalletDeployOptions): Promise<Address> {
    if (!this.publicClient) {
      throw new Error('Smart wallet client not initialized. Call connectWallet() first.');
    }

    const walletAddress = await this.getAddress();
    
    console.log(`🚀 Deploying contract via ${this.smartWalletOptions.smartWalletType} Smart Wallet...`);
    console.log(`📍 Smart Wallet Address: ${walletAddress}`);

    try {
      // Create deployment transaction
      const deploymentTx = {
        from: walletAddress,
        data: options.bytecode + (options.args ? this.encodeConstructorArgs(options.abi, options.args) : ''),
        value: options.value || 0n,
        gas: options.gas,
        gasPrice: options.gasPrice,
        maxFeePerGas: options.maxFeePerGas,
        maxPriorityFeePerGas: options.maxPriorityFeePerGas,
        chainId: this.chain.id
      };

      // Send transaction via smart wallet
      const txHash = await this.sendTransaction(deploymentTx);
      
      console.log(`⏳ Waiting for deployment confirmation...`);
      
      // Wait for transaction receipt
      const receipt = await this.publicClient.waitForTransactionReceipt({
        hash: txHash,
        timeout: 120_000 // 2 minutes timeout
      });

      if (!receipt.contractAddress) {
        throw new Error('Contract deployment failed - no contract address in receipt');
      }

      console.log(`✅ Contract deployed successfully!`);
      console.log(`📍 Contract Address: ${receipt.contractAddress}`);
      console.log(`🔗 Transaction Hash: ${txHash}`);
      console.log(`⛽ Gas Used: ${receipt.gasUsed}`);

      return receipt.contractAddress;
    } catch (error) {
      console.error('❌ Smart wallet deployment failed:', error);
      throw error;
    }
  }

  /**
   * Get smart wallet contract instance
   */
  getContract(options: { address: Address; abi: any[] }) {
    if (!this.publicClient) {
      throw new Error('Smart wallet client not initialized');
    }

    return {
      address: options.address,
      abi: options.abi,
      read: {
        greet: async () => {
          return await this.publicClient.readContract({
            address: options.address,
            abi: options.abi,
            functionName: 'greet'
          });
        }
      },
      write: {
        setGreeting: async (args: [string], options?: any) => {
          const txHash = await this.sendTransaction({
            to: options.address,
            data: this.encodeFunctionCall(options.abi, 'setGreeting', args),
            from: await this.getAddress(),
            chainId: this.chain.id,
            ...options
          });
          return txHash;
        }
      }
    };
  }

  /**
   * Get public client for read operations
   */
  getPublicClient() {
    if (!this.publicClient) {
      throw new Error('Smart wallet client not initialized');
    }
    return this.publicClient;
  }

  /**
   * Get current chain
   */
  getChain(): Chain {
    return this.chain;
  }

  /**
   * Switch to different chain
   */
  async switchChain(chainId: number): Promise<void> {
    this.chain = this.getChainById(chainId);
    await this.setupSmartWalletClient();
    console.log(`🔄 Switched to chain: ${this.chain.name} (${chainId})`);
  }

  /**
   * Encode constructor arguments
   */
  private encodeConstructorArgs(abi: any[], args: any[]): string {
    // This is a simplified implementation
    // In production, you'd use viem's encodeAbiParameters
    return '0x' + args.map(arg => {
      if (typeof arg === 'string') {
        return Buffer.from(arg).toString('hex').padStart(64, '0');
      }
      return arg.toString(16).padStart(64, '0');
    }).join('');
  }

  /**
   * Encode function call
   */
  private encodeFunctionCall(abi: any[], functionName: string, args: any[]): string {
    // Simplified function call encoding
    // In production, use viem's encodeFunctionData
    const functionSignature = `${functionName}(${args.map(() => 'string').join(',')})`;
    const functionSelector = Buffer.from(functionSignature).toString('hex').slice(0, 8);
    return '0x' + functionSelector + this.encodeConstructorArgs(abi, args);
  }

  /**
   * Get chain by ID
   */
  private getChainById(chainId: number): Chain {
    const chains: Record<number, Chain> = {
      1: mainnet,
      8453: base,
      137: polygon,
    };
    return chains[chainId] || mainnet;
  }

  /**
   * Get default RPC URL
   */
  private getDefaultRpcUrl(chainId: number): string {
    const rpcUrls: Record<number, string> = {
      1: 'https://eth.llamarpc.com',
      8453: 'https://base.llamarpc.com',
      137: 'https://polygon.llamarpc.com',
    };
    return rpcUrls[chainId] || 'https://eth.llamarpc.com';
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await super.cleanup();
    this.publicClient = null;
  }
}

/**
 * Factory function to create smart wallet client
 */
export function createSmartWalletClient(options: SmartWalletOptions): Safe3SmartWallet {
  return new Safe3SmartWallet(options);
}
