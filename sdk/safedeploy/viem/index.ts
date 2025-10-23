import { 
  createWalletClient, 
  createPublicClient, 
  http, 
  WalletClient, 
  PublicClient,
  Hex,
  Address,
  Chain,
  Transport,
  custom,
  parseEther,
  formatEther,
  toHex,
  getContract
} from 'viem';
import { mainnet, polygon, bsc, arbitrum, optimism, base } from 'viem/chains';
import { Safe3QRDeploy, Safe3QRDeployOptions, Safe3Signer } from '../core';

export interface Safe3ViemClientOptions extends Safe3QRDeployOptions {
  chainId?: number;
  rpcUrl?: string;
}

export interface DeployContractOptions {
  abi: any[];
  bytecode: Hex;
  args?: any[];
  value?: bigint;
  gas?: bigint;
  gasPrice?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
}

export class Safe3ViemClient extends Safe3QRDeploy implements Safe3Signer {
  private walletClient: WalletClient | null = null;
  private publicClient: PublicClient | null = null;
  private chain: Chain;
  private options: Safe3ViemClientOptions;

  constructor(options: Safe3ViemClientOptions) {
    super(options);
    this.options = options;
    this.chain = this.getChain(options.chainId || 1);
  }

  /**
   * Connect to wallet and setup viem clients
   */
  async connectWallet(): Promise<void> {
    await super.connectWallet();
    await this.setupViemClients();
  }

  /**
   * Setup viem wallet and public clients
   */
  private async setupViemClients(): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Wallet not connected');
    }

    const rpcUrl = this.options.rpcUrl || this.getDefaultRpcUrl(this.chain.id);

    // Create custom transport for WalletConnect
    const transport = custom({
      request: async ({ method, params }) => {
        if (!this.signClient || !this.session) {
          throw new Error('Wallet not connected');
        }

        try {
          const result = await this.signClient.request({
            topic: this.session.topic,
            chainId: `eip155:${this.chain.id}`,
            request: {
              method: method as string,
              params: params as any[]
            }
          });

          return result;
        } catch (error) {
          this.logger.error(`Failed to execute ${method}:`, error);
          throw error;
        }
      }
    });

    // Create wallet client
    this.walletClient = createWalletClient({
      chain: this.chain,
      transport,
      account: await this.getAddress() as Address
    });

    // Create public client for read operations
    this.publicClient = createPublicClient({
      chain: this.chain,
      transport: http(rpcUrl)
    });
  }

  /**
   * Get viem wallet client
   */
  getClient(): WalletClient {
    if (!this.walletClient) {
      throw new Error('Wallet client not initialized. Call connectWallet() first.');
    }
    return this.walletClient;
  }

  /**
   * Get viem public client
   */
  getPublicClient(): PublicClient {
    if (!this.publicClient) {
      throw new Error('Public client not initialized. Call connectWallet() first.');
    }
    return this.publicClient;
  }

  /**
   * Deploy a contract using viem
   */
  async deployContract(options: DeployContractOptions): Promise<Address> {
    if (!this.walletClient) {
      throw new Error('Wallet client not initialized. Call connectWallet() first.');
    }

    try {
      const hash = await this.walletClient.deployContract({
        abi: options.abi,
        bytecode: options.bytecode,
        args: options.args,
        value: options.value,
        gas: options.gas,
        gasPrice: options.gasPrice,
        maxFeePerGas: options.maxFeePerGas,
        maxPriorityFeePerGas: options.maxPriorityFeePerGas
      });

      // Wait for deployment
      const receipt = await this.publicClient!.waitForTransactionReceipt({ hash });
      
      if (!receipt.contractAddress) {
        throw new Error('Contract deployment failed - no contract address in receipt');
      }

      return receipt.contractAddress;
    } catch (error) {
      this.logger.error('Failed to deploy contract:', error);
      throw error;
    }
  }

  /**
   * Deploy contract and get contract instance
   */
  async deployContractAndGetInstance(options: DeployContractOptions) {
    const contractAddress = await this.deployContract(options);
    
    if (!this.publicClient) {
      throw new Error('Public client not initialized');
    }

    return getContract({
      address: contractAddress,
      abi: options.abi,
      client: {
        wallet: this.walletClient!,
        public: this.publicClient
      }
    });
  }

  /**
   * Send a transaction using viem
   */
  async sendTransaction(transaction: any): Promise<string> {
    if (!this.walletClient) {
      throw new Error('Wallet client not initialized. Call connectWallet() first.');
    }

    try {
      const hash = await this.walletClient.sendTransaction({
        to: transaction.to as Address,
        value: transaction.value ? BigInt(transaction.value) : 0n,
        data: transaction.data as Hex,
        gas: transaction.gas ? BigInt(transaction.gas) : undefined,
        gasPrice: transaction.gasPrice ? BigInt(transaction.gasPrice) : undefined,
        maxFeePerGas: transaction.maxFeePerGas ? BigInt(transaction.maxFeePerGas) : undefined,
        maxPriorityFeePerGas: transaction.maxPriorityFeePerGas ? BigInt(transaction.maxPriorityFeePerGas) : undefined,
        nonce: transaction.nonce ? Number(transaction.nonce) : undefined
      });

      return hash;
    } catch (error) {
      this.logger.error('Failed to send transaction:', error);
      throw error;
    }
  }

  /**
   * Sign a message using viem
   */
  async signMessage(message: string): Promise<string> {
    if (!this.walletClient) {
      throw new Error('Wallet client not initialized. Call connectWallet() first.');
    }

    try {
      const signature = await this.walletClient.signMessage({
        message: message as Hex
      });

      return signature;
    } catch (error) {
      this.logger.error('Failed to sign message:', error);
      throw error;
    }
  }

  /**
   * Get chain configuration
   */
  private getChain(chainId: number): Chain {
    const chains: Record<number, Chain> = {
      1: mainnet,
      137: polygon,
      56: bsc,
      42161: arbitrum,
      10: optimism,
      8453: base
    };

    return chains[chainId] || mainnet;
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

    return rpcUrls[chainId] || 'https://eth.llamarpc.com';
  }

  /**
   * Switch to a different chain
   */
  async switchChain(chainId: number): Promise<void> {
    this.chain = this.getChain(chainId);
    
    if (this.walletClient && this.publicClient) {
      await this.setupViemClients();
    }
  }

  /**
   * Get current chain
   */
  getChain(): Chain {
    return this.chain;
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await super.cleanup();
    this.walletClient = null;
    this.publicClient = null;
  }
}
