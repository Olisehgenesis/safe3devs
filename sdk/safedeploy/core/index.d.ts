import { SessionTypes } from '@walletconnect/types';
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
    on<U extends keyof Safe3ConnectionEvents>(event: U, listener: Safe3ConnectionEvents[U]): this;
    emit<U extends keyof Safe3ConnectionEvents>(event: U, ...args: Parameters<Safe3ConnectionEvents[U]>): boolean;
}
export declare class Safe3QRDeploy extends EventEmitter {
    protected signClient: any;
    protected session: SessionTypes.Struct | null;
    private options;
    constructor(options: Safe3QRDeployOptions);
    /**
     * Initialize the WalletConnect SignClient
     */
    initialize(): Promise<void>;
    /**
     * Connect to wallet via QR code
     */
    connectWallet(): Promise<SessionTypes.Struct>;
    /**
     * Disconnect from wallet
     */
    disconnectWallet(): Promise<void>;
    /**
     * Get the current session
     */
    getSession(): SessionTypes.Struct | null;
    /**
     * Check if wallet is connected
     */
    isConnected(): boolean;
    /**
     * Get the connected wallet address
     */
    getAddress(): Promise<string>;
    /**
     * Send a transaction using WalletConnect
     */
    sendTransaction(transaction: any): Promise<string>;
    /**
     * Sign a message using WalletConnect
     */
    signMessage(message: string): Promise<string>;
    /**
     * Display QR code in terminal
     */
    private displayQRCode;
    /**
     * Setup WalletConnect event listeners
     */
    private setupEventListeners;
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map