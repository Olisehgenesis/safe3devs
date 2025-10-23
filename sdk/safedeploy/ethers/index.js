"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Safe3EthersSigner = void 0;
const ethers_1 = require("ethers");
const core_1 = require("../core");
class Safe3EthersSigner extends core_1.Safe3QRDeploy {
    constructor(options) {
        super(options);
        this.provider = null;
        this.ethersSigner = null;
        this.ethersOptions = options;
    }
    /**
     * Connect to wallet and setup ethers provider/signer
     */
    async connectWallet() {
        const session = await super.connectWallet();
        await this.setupEthersProvider();
        return session;
    }
    /**
     * Setup ethers provider and signer
     */
    async setupEthersProvider() {
        if (!this.isConnected()) {
            throw new Error('Wallet not connected');
        }
        const chainId = this.ethersOptions.chainId || 1;
        const rpcUrl = this.ethersOptions.rpcUrl || this.getDefaultRpcUrl(chainId);
        this.provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        this.ethersSigner = new Safe3EthersSignerWrapper(this.provider, this);
    }
    /**
     * Get ethers signer instance
     */
    getSigner() {
        if (!this.ethersSigner) {
            throw new Error('Signer not initialized. Call connectWallet() first.');
        }
        return this.ethersSigner;
    }
    /**
     * Get ethers provider instance
     */
    getProvider() {
        if (!this.provider) {
            throw new Error('Provider not initialized. Call connectWallet() first.');
        }
        return this.provider;
    }
    /**
     * Deploy a contract using ethers ContractFactory
     */
    async deployContract(factory, ...args) {
        if (!this.ethersSigner) {
            throw new Error('Signer not initialized. Call connectWallet() first.');
        }
        try {
            const contract = await factory.connect(this.ethersSigner).deploy(...args);
            await contract.waitForDeployment();
            return contract;
        }
        catch (error) {
            console.error('Failed to deploy contract:', error);
            throw error;
        }
    }
    /**
     * Deploy contract from ABI and bytecode
     */
    async deployContractFromABI(abi, bytecode, ...args) {
        const factory = new ethers_1.ethers.ContractFactory(abi, bytecode);
        return this.deployContract(factory, ...args);
    }
    /**
     * Get default RPC URL for chain
     */
    getDefaultRpcUrl(chainId) {
        const rpcUrls = {
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
    async cleanup() {
        await super.cleanup();
        this.provider = null;
        this.ethersSigner = null;
    }
}
exports.Safe3EthersSigner = Safe3EthersSigner;
/**
 * Custom ethers signer wrapper that uses WalletConnect for signing
 */
class Safe3EthersSignerWrapper extends ethers_1.ethers.JsonRpcSigner {
    constructor(provider, safe3Signer) {
        super(provider, '');
        this.safe3Signer = safe3Signer;
    }
    async getAddress() {
        return this.safe3Signer.getAddress();
    }
    async signTransaction(transaction) {
        // Convert ethers transaction to WalletConnect format
        const tx = {
            from: await this.getAddress(),
            to: transaction.to,
            value: transaction.value ? ethers_1.ethers.toBeHex(transaction.value) : '0x0',
            data: transaction.data || '0x',
            gas: transaction.gasLimit ? ethers_1.ethers.toBeHex(transaction.gasLimit) : undefined,
            gasPrice: transaction.gasPrice ? ethers_1.ethers.toBeHex(transaction.gasPrice) : undefined,
            maxFeePerGas: transaction.maxFeePerGas ? ethers_1.ethers.toBeHex(transaction.maxFeePerGas) : undefined,
            maxPriorityFeePerGas: transaction.maxPriorityFeePerGas ? ethers_1.ethers.toBeHex(transaction.maxPriorityFeePerGas) : undefined,
            nonce: transaction.nonce ? ethers_1.ethers.toBeHex(transaction.nonce) : undefined,
            chainId: transaction.chainId || 1
        };
        // Remove undefined values
        Object.keys(tx).forEach(key => {
            if (tx[key] === undefined) {
                delete tx[key];
            }
        });
        return this.safe3Signer.sendTransaction(tx);
    }
    async signMessage(message) {
        const messageStr = typeof message === 'string' ? message : ethers_1.ethers.toUtf8String(message);
        return this.safe3Signer.signMessage(messageStr);
    }
    async sendTransaction(transaction) {
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
                const receipt = await this.provider.waitForTransaction(txHash);
                return receipt;
            }
        };
    }
    connect(provider) {
        return new Safe3EthersSignerWrapper(provider, this.safe3Signer);
    }
}
//# sourceMappingURL=index.js.map