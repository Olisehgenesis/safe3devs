"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Safe3QRDeploy = exports.Safe3ViemClient = exports.Safe3EthersSigner = void 0;
exports.createSafe3Client = createSafe3Client;
exports.createSafe3ClientAuto = createSafe3ClientAuto;
exports.isEthersClient = isEthersClient;
exports.isViemClient = isViemClient;
exports.getClientType = getClientType;
const ethers_1 = require("../ethers");
const viem_1 = require("../viem");
/**
 * Factory function to create Safe3 client based on specified type
 */
function createSafe3Client(options) {
    const baseOptions = {
        projectId: options.projectId,
        chainId: options.chainId,
        rpcUrl: options.rpcUrl,
        metadata: options.metadata,
        relayUrl: options.relayUrl,
        logger: options.logger
    };
    switch (options.client) {
        case 'ethers':
            return new ethers_1.Safe3EthersSigner(baseOptions);
        case 'viem':
            return new viem_1.Safe3ViemClient(baseOptions);
        default:
            throw new Error(`Unsupported client type: ${options.client}. Supported types: 'ethers', 'viem'`);
    }
}
/**
 * Auto-detect client type based on available dependencies
 */
function createSafe3ClientAuto(options) {
    try {
        // Try to import ethers first
        require('ethers');
        return createSafe3Client({ ...options, client: 'ethers' });
    }
    catch {
        try {
            // Fallback to viem
            require('viem');
            return createSafe3Client({ ...options, client: 'viem' });
        }
        catch {
            throw new Error('Neither ethers nor viem is available. Please install one of them.');
        }
    }
}
/**
 * Utility function to check if a client is ethers-based
 */
function isEthersClient(client) {
    return client instanceof ethers_1.Safe3EthersSigner;
}
/**
 * Utility function to check if a client is viem-based
 */
function isViemClient(client) {
    return client instanceof viem_1.Safe3ViemClient;
}
/**
 * Get the client type from a Safe3Client instance
 */
function getClientType(client) {
    return isEthersClient(client) ? 'ethers' : 'viem';
}
// Re-export types and classes for convenience
var ethers_2 = require("../ethers");
Object.defineProperty(exports, "Safe3EthersSigner", { enumerable: true, get: function () { return ethers_2.Safe3EthersSigner; } });
Object.defineProperty(exports, "Safe3ViemClient", { enumerable: true, get: function () { return ethers_2.Safe3ViemClient; } });
var core_1 = require("../core");
Object.defineProperty(exports, "Safe3QRDeploy", { enumerable: true, get: function () { return core_1.Safe3QRDeploy; } });
//# sourceMappingURL=index.js.map