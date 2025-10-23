"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Safe3QRDeploy = void 0;
const sign_client_1 = require("@walletconnect/sign-client");
const qrcode = __importStar(require("qrcode-terminal"));
const events_1 = require("events");
class Safe3QRDeploy extends events_1.EventEmitter {
    constructor(options) {
        super();
        this.signClient = null;
        this.session = null;
        this.options = options;
    }
    /**
     * Initialize the WalletConnect SignClient
     */
    async initialize() {
        try {
            this.signClient = await sign_client_1.SignClient.init({
                projectId: this.options.projectId,
                metadata: this.options.metadata || {
                    name: 'Safe3Devs QR Deploy',
                    description: 'Universal QR-based smart contract deployment',
                    url: 'https://safe3devs.com',
                    icons: ['https://safe3devs.com/icon.png']
                },
                relayUrl: this.options.relayUrl
            });
            this.setupEventListeners();
            console.log('Safe3QRDeploy initialized successfully');
        }
        catch (error) {
            console.error('Failed to initialize Safe3QRDeploy:', error);
            this.emit('error', error);
            throw error;
        }
    }
    /**
     * Connect to wallet via QR code
     */
    async connectWallet() {
        if (!this.signClient) {
            await this.initialize();
        }
        try {
            const { uri, approval } = await this.signClient.connect({
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
            if (this.session) {
                this.emit('connected', this.session);
                console.log('Wallet connected successfully');
                return this.session;
            }
            else {
                throw new Error('Failed to establish session');
            }
        }
        catch (error) {
            console.error('Failed to connect wallet:', error);
            this.emit('error', error);
            throw error;
        }
    }
    /**
     * Disconnect from wallet
     */
    async disconnectWallet() {
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
                console.log('Wallet disconnected successfully');
            }
            catch (error) {
                console.error('Failed to disconnect wallet:', error);
                this.emit('error', error);
                throw error;
            }
        }
    }
    /**
     * Get the current session
     */
    getSession() {
        return this.session;
    }
    /**
     * Check if wallet is connected
     */
    isConnected() {
        return this.session !== null;
    }
    /**
     * Get the connected wallet address
     */
    async getAddress() {
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
    async sendTransaction(transaction) {
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
            return result;
        }
        catch (error) {
            console.error('Failed to send transaction:', error);
            this.emit('error', error);
            throw error;
        }
    }
    /**
     * Sign a message using WalletConnect
     */
    async signMessage(message) {
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
            return result;
        }
        catch (error) {
            console.error('Failed to sign message:', error);
            this.emit('error', error);
            throw error;
        }
    }
    /**
     * Display QR code in terminal
     */
    displayQRCode(uri) {
        console.log('\n🔗 Scan this QR code with your wallet to connect:');
        console.log('='.repeat(50));
        qrcode.generate(uri, { small: true });
        console.log('='.repeat(50));
        console.log(`Or open this link: ${uri}\n`);
    }
    /**
     * Setup WalletConnect event listeners
     */
    setupEventListeners() {
        if (!this.signClient)
            return;
        this.signClient.on('session_update', ({ topic, params }) => {
            if (this.session && this.session.topic === topic && params) {
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
    async cleanup() {
        if (this.session) {
            await this.disconnectWallet();
        }
        this.removeAllListeners();
    }
}
exports.Safe3QRDeploy = Safe3QRDeploy;
//# sourceMappingURL=index.js.map