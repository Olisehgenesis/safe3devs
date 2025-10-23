import { SignClient } from '@walletconnect/sign-client';
import { SessionTypes } from '@walletconnect/types';
import { generateChildLogger, getLogger } from '@walletconnect/logger';
import * as qrcode from 'qrcode-terminal';
import { EventEmitter } from 'events';

export interface Safe3Signer {
  getAddress(): Promise<string>;
  sendTransaction(tx: any): Promise<any>;
}

export interface Safe3QRDeployOptions {
  projectId: string;
  metadata?: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
  relayUrl?: string;
  logger?: string;
}

export interface Safe3ConnectionEvents {
  'connected': (session: SessionTypes.Struct) => void;
  'disconnected': () => void;
  'session_updated': (session: SessionTypes.Struct) => void;
  'session_expired': () => void;
  'qr_ready': (uri: string) => void;
  'error': (error: Error) => void;
}

export declare interface Safe3QRDeploy {
  on<U extends keyof Safe3ConnectionEvents>(
    event: U, listener: Safe3ConnectionEvents[U]
  ): this;
  emit<U extends keyof Safe3ConnectionEvents>(
    event: U, ...args: Parameters<Safe3ConnectionEvents[U]>
  ): boolean;
}

export class Safe3QRDeploy extends EventEmitter {
  private signClient: SignClient | null = null;
  private session: SessionTypes.Struct | null = null;
  private options: Safe3QRDeployOptions;
  private logger: any;

  constructor(options: Safe3QRDeployOptions) {
    super();
    this.options = options;
    this.logger = getLogger('Safe3QRDeploy');
  }

  /**
   * Initialize the WalletConnect SignClient
   */
  async initialize(): Promise<void> {
    try {
      this.signClient = await SignClient.init({
        projectId: this.options.projectId,
        metadata: this.options.metadata || {
          name: 'Safe3Devs QR Deploy',
          description: 'Universal QR-based smart contract deployment',
          url: 'https://safe3devs.com',
          icons: ['https://safe3devs.com/icon.png']
        },
        relayUrl: this.options.relayUrl,
        logger: this.options.logger ? generateChildLogger(this.logger, this.options.logger) : undefined
      });

      this.setupEventListeners();
      this.logger.info('Safe3QRDeploy initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Safe3QRDeploy:', error);
      this.emit('error', error as Error);
      throw error;
    }
  }

  /**
   * Connect to wallet via QR code
   */
  async connectWallet(): Promise<SessionTypes.Struct> {
    if (!this.signClient) {
      await this.initialize();
    }

    try {
      const { uri, approval } = await this.signClient!.connect({
        requiredNamespaces: {
          eip155: {
            methods: [
              'eth_sendTransaction',
              'eth_signTransaction',
              'eth_sign',
              'personal_sign',
              'eth_signTypedData',
              'eth_signTypedData_v4'
            ],
            chains: ['eip155:1', 'eip155:137', 'eip155:56', 'eip155:42161', 'eip155:10', 'eip155:8453'],
            events: ['chainChanged', 'accountsChanged']
          }
        }
      });

      if (uri) {
        this.displayQRCode(uri);
        this.emit('qr_ready', uri);
      }

      this.session = await approval();
      this.emit('connected', this.session);
      this.logger.info('Wallet connected successfully');
      
      return this.session;
    } catch (error) {
      this.logger.error('Failed to connect wallet:', error);
      this.emit('error', error as Error);
      throw error;
    }
  }

  /**
   * Disconnect from wallet
   */
  async disconnectWallet(): Promise<void> {
    if (this.signClient && this.session) {
      try {
        await this.signClient.disconnect({
          topic: this.session.topic,
          reason: {
            code: 6000,
            message: 'User disconnected'
          }
        });
        this.session = null;
        this.emit('disconnected');
        this.logger.info('Wallet disconnected successfully');
      } catch (error) {
        this.logger.error('Failed to disconnect wallet:', error);
        this.emit('error', error as Error);
        throw error;
      }
    }
  }

  /**
   * Get the current session
   */
  getSession(): SessionTypes.Struct | null {
    return this.session;
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return this.session !== null;
  }

  /**
   * Get the connected wallet address
   */
  async getAddress(): Promise<string> {
    if (!this.session) {
      throw new Error('Wallet not connected');
    }

    const accounts = this.session.namespaces.eip155?.accounts || [];
    if (accounts.length === 0) {
      throw new Error('No accounts found in session');
    }

    // Extract address from account string (format: eip155:1:0x...)
    const account = accounts[0];
    const address = account.split(':')[2];
    
    return address;
  }

  /**
   * Send a transaction using WalletConnect
   */
  async sendTransaction(transaction: any): Promise<string> {
    if (!this.signClient || !this.session) {
      throw new Error('Wallet not connected');
    }

    try {
      const result = await this.signClient.request({
        topic: this.session.topic,
        chainId: `eip155:${transaction.chainId || 1}`,
        request: {
          method: 'eth_sendTransaction',
          params: [transaction]
        }
      });

      return result as string;
    } catch (error) {
      this.logger.error('Failed to send transaction:', error);
      this.emit('error', error as Error);
      throw error;
    }
  }

  /**
   * Sign a message using WalletConnect
   */
  async signMessage(message: string): Promise<string> {
    if (!this.signClient || !this.session) {
      throw new Error('Wallet not connected');
    }

    try {
      const result = await this.signClient.request({
        topic: this.session.topic,
        chainId: `eip155:1`,
        request: {
          method: 'personal_sign',
          params: [message, await this.getAddress()]
        }
      });

      return result as string;
    } catch (error) {
      this.logger.error('Failed to sign message:', error);
      this.emit('error', error as Error);
      throw error;
    }
  }

  /**
   * Display QR code in terminal
   */
  private displayQRCode(uri: string): void {
    console.log('\n🔗 Scan this QR code with your wallet to connect:');
    console.log('='.repeat(50));
    qrcode.generate(uri, { small: true });
    console.log('='.repeat(50));
    console.log(`Or open this link: ${uri}\n`);
  }

  /**
   * Setup WalletConnect event listeners
   */
  private setupEventListeners(): void {
    if (!this.signClient) return;

    this.signClient.on('session_update', ({ topic, params }) => {
      if (this.session && this.session.topic === topic) {
        this.session = params;
        this.emit('session_updated', this.session);
      }
    });

    this.signClient.on('session_delete', ({ topic }) => {
      if (this.session && this.session.topic === topic) {
        this.session = null;
        this.emit('disconnected');
      }
    });

    this.signClient.on('session_expire', ({ topic }) => {
      if (this.session && this.session.topic === topic) {
        this.session = null;
        this.emit('session_expired');
      }
    });
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    if (this.session) {
      await this.disconnectWallet();
    }
    this.removeAllListeners();
  }
}
