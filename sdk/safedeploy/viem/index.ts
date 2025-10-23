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
import { defineChain } from 'viem';
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
  private viemOptions: Safe3ViemClientOptions;

  constructor(options: Safe3ViemClientOptions) {
    super(options);
    this.viemOptions = options;
    this.chain = this.getChainById(options.chainId || 1);
  }

  /**
   * Connect to wallet and setup viem clients
   */
  async connectWallet(): Promise<any> {
    const session = await super.connectWallet();
    await this.setupViemClients();
    return session;
  }

  /**
   * Setup viem wallet and public clients
   */
  private async setupViemClients(): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Wallet not connected');
    }

    const rpcUrl = this.viemOptions.rpcUrl || this.getDefaultRpcUrl(this.chain.id);

    // Create custom transport for WalletConnect
    const transport = custom({
      request: async ({ method, params }) => {
        if (!this.isConnected()) {
          throw new Error('Wallet not connected');
        }

        try {
          // Handle different RPC methods
          switch (method) {
            case 'eth_sendTransaction':
              return await this.sendTransaction(params[0]);
            
            case 'eth_signTransaction':
              return await this.signTransaction(params[0]);
            
            case 'personal_sign':
              return await this.signMessage(params[0]);
            
            case 'eth_sign':
              return await this.signMessage(params[1]); // eth_sign uses different param order
            
            case 'eth_signTypedData':
            case 'eth_signTypedData_v4':
              return await this.signTypedData(params[0], params[1]);
            
            case 'eth_accounts':
              return [await this.getAddress()];
            
            case 'eth_chainId':
              return `0x${this.chain.id.toString(16)}`;
            
            case 'eth_requestAccounts':
              return [await this.getAddress()];
            
            default:
              // For read-only methods, use the public client
              if (this.publicClient) {
                return await this.publicClient.request({ method, params });
              }
              throw new Error(`Unsupported method: ${method}`);
          }
        } catch (error) {
          console.error(`Failed to execute ${method}:`, error);
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
        args: options.args || [],
        value: options.value,
        gas: options.gas,
        account: await this.getAddress() as Address,
        chain: this.chain
      });

      // Wait for deployment
      const receipt = await this.publicClient!.waitForTransactionReceipt({ hash });
      
      if (!receipt.contractAddress) {
        throw new Error('Contract deployment failed - no contract address in receipt');
      }

      return receipt.contractAddress;
    } catch (error) {
      console.error('Failed to deploy contract:', error);
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
   * Sign a message using WalletConnect
   */
  async signMessage(message: string): Promise<string> {
    if (!this.isConnected()) {
      throw new Error('Wallet not connected');
    }

    try {
      // Use the parent class signMessage method
      return await super.signMessage(message);
    } catch (error) {
      console.error('Failed to sign message:', error);
      throw error;
    }
  }

  /**
   * Send a transaction using WalletConnect
   */
  async sendTransaction(transaction: any): Promise<string> {
    if (!this.isConnected()) {
      throw new Error('Wallet not connected');
    }

    try {
      // Use the parent class sendTransaction method
      return await super.sendTransaction(transaction);
    } catch (error) {
      console.error('Failed to send transaction:', error);
      throw error;
    }
  }

  /**
   * Sign a transaction using WalletConnect
   */
  async signTransaction(transaction: any): Promise<string> {
    if (!this.isConnected()) {
      throw new Error('Wallet not connected');
    }

    try {
      // Convert transaction to hex format for signing
      const txHex = {
        from: transaction.from,
        to: transaction.to,
        value: transaction.value ? `0x${BigInt(transaction.value).toString(16)}` : '0x0',
        data: transaction.data || '0x',
        gas: transaction.gas ? `0x${BigInt(transaction.gas).toString(16)}` : undefined,
        gasPrice: transaction.gasPrice ? `0x${BigInt(transaction.gasPrice).toString(16)}` : undefined,
        nonce: transaction.nonce ? `0x${Number(transaction.nonce).toString(16)}` : undefined,
        chainId: transaction.chainId || this.chain.id
      };

      // Remove undefined values
      Object.keys(txHex).forEach(key => {
        if (txHex[key as keyof typeof txHex] === undefined) {
          delete txHex[key as keyof typeof txHex];
        }
      });

      // Use WalletConnect to sign the transaction
      const result = await this.signClient!.request({
        topic: this.session!.topic,
        chainId: `eip155:${this.chain.id}`,
        request: {
          method: 'eth_signTransaction',
          params: [txHex]
        }
      });

      return result as string;
    } catch (error) {
      console.error('Failed to sign transaction:', error);
      throw error;
    }
  }

  /**
   * Sign typed data using WalletConnect
   */
  async signTypedData(address: string, typedData: any): Promise<string> {
    if (!this.isConnected()) {
      throw new Error('Wallet not connected');
    }

    try {
      const result = await this.signClient!.request({
        topic: this.session!.topic,
        chainId: `eip155:${this.chain.id}`,
        request: {
          method: 'eth_signTypedData_v4',
          params: [address, JSON.stringify(typedData)]
        }
      });

      return result as string;
    } catch (error) {
      console.error('Failed to sign typed data:', error);
      throw error;
    }
  }

  /**
   * Get chain configuration by ID
   */
  private getChainById(chainId: number): Chain {
    // Define Alfajores Celo testnet
    const alfajores = defineChain({
      id: 44787,
      name: 'Alfajores',
      nativeCurrency: {
        decimals: 18,
        name: 'Celo',
        symbol: 'CELO',
      },
      rpcUrls: {
        default: {
          http: ['https://alfajores-forno.celo-testnet.org'],
        },
        public: {
          http: ['https://alfajores-forno.celo-testnet.org'],
        },
      },
      blockExplorers: {
        default: {
          name: 'Celo Explorer',
          url: 'https://alfajores.celoscan.io',
        },
      },
      testnet: true,
    });

    const chains: Record<number, Chain> = {
      1: mainnet,
      137: polygon,
      56: bsc,
      42161: arbitrum,
      10: optimism,
      8453: base,
      44787: alfajores, // Alfajores Celo testnet
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
      8453: 'https://base.llamarpc.com',
      44787: 'https://alfajores-forno.celo-testnet.org' // Alfajores Celo testnet
    };

    return rpcUrls[chainId] || 'https://eth.llamarpc.com';
  }

  /**
   * Switch to a different chain
   */
  async switchChain(chainId: number): Promise<void> {
    this.chain = this.getChainById(chainId);
    
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
