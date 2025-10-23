# Smart Wallet Integration Guide

## 🚀 Safe3Devs QR Deploy SDK - Smart Wallet Support

The Safe3Devs QR Deploy SDK now supports **Smart Wallets** (Account Abstraction), enabling users to deploy contracts using:

- **🔐 Passkey/Biometric Authentication** (Coinbase Smart Wallet)
- **👥 Multisig Wallets** (Safe)
- **⛽ Gasless Transactions** (Biconomy)
- **🔧 Custom Smart Wallets** (Thirdweb)

## 🌟 Benefits of Smart Wallets

### ✅ **Better User Experience**
- No private key management
- Passkey/biometric authentication
- Social recovery options
- Gasless transactions

### ✅ **Enhanced Security**
- Multi-signature support
- Time-locked transactions
- Spending limits
- Recovery mechanisms

### ✅ **Cost Efficiency**
- Gasless transactions
- Batch operations
- Optimized gas usage

## 📦 Installation

```bash
npm install safe3devs-qr-deploy
```

## 🔧 Basic Usage

### Coinbase Smart Wallet (Passkey/Biometric)

```typescript
import { createSmartWalletClient } from 'safe3devs-qr-deploy';

const smartWallet = createSmartWalletClient({
  projectId: 'your-walletconnect-project-id',
  chainId: 8453, // Base Mainnet
  smartWalletType: 'coinbase',
  metadata: {
    name: 'My DApp',
    description: 'Deploy contracts with passkey',
    url: 'https://mydapp.com',
    icons: ['https://mydapp.com/icon.png']
  }
});

// Connect via QR code (shows passkey/biometric prompt)
await smartWallet.connectWallet();

// Deploy contract
const contractAddress = await smartWallet.deployContract({
  abi: greeterABI,
  bytecode: greeterBytecode,
  args: ['Hello Smart Wallet!']
});
```

### Safe Multisig Wallet

```typescript
const safeWallet = createSmartWalletClient({
  projectId: 'your-walletconnect-project-id',
  chainId: 1, // Ethereum Mainnet
  smartWalletType: 'safe',
  metadata: {
    name: 'My Safe DApp',
    description: 'Multisig contract deployment',
    url: 'https://mydapp.com',
    icons: ['https://mydapp.com/icon.png']
  }
});

await safeWallet.connectWallet();
const contractAddress = await safeWallet.deployContract({
  abi: greeterABI,
  bytecode: greeterBytecode,
  args: ['Hello Safe!']
});
```

### Biconomy (Gasless Transactions)

```typescript
const biconomyWallet = createSmartWalletClient({
  projectId: 'your-walletconnect-project-id',
  chainId: 137, // Polygon Mainnet
  smartWalletType: 'biconomy',
  metadata: {
    name: 'My Gasless DApp',
    description: 'Gasless contract deployment',
    url: 'https://mydapp.com',
    icons: ['https://mydapp.com/icon.png']
  }
});

await biconomyWallet.connectWallet();
// This transaction will be gasless!
const contractAddress = await biconomyWallet.deployContract({
  abi: greeterABI,
  bytecode: greeterBytecode,
  args: ['Hello Gasless!']
});
```

## 🎯 Supported Smart Wallets

| Smart Wallet | Authentication | Gasless | Multisig | Chain Support |
|--------------|----------------|---------|----------|---------------|
| **Coinbase** | Passkey/Biometric | ✅ | ❌ | All EVM |
| **Safe** | Multisig | ❌ | ✅ | All EVM |
| **Biconomy** | Social/Email | ✅ | ❌ | Polygon, BSC |
| **Thirdweb** | Custom | ✅ | ✅ | All EVM |

## 🔗 Chain Support

- **Ethereum Mainnet** (Chain ID: 1)
- **Base Mainnet** (Chain ID: 8453) ⭐ **Recommended**
- **Polygon Mainnet** (Chain ID: 137)
- **Arbitrum One** (Chain ID: 42161)
- **Optimism** (Chain ID: 10)
- **BSC** (Chain ID: 56)

## 🧪 Testing

### Run Smart Wallet Test

```bash
# Test Coinbase Smart Wallet on Base Mainnet
node test-smart-wallet.js
```

### Test Different Smart Wallets

```typescript
// Test Safe Multisig
const safeWallet = createSmartWalletClient({
  projectId: 'your-project-id',
  chainId: 1,
  smartWalletType: 'safe'
});

// Test Biconomy Gasless
const biconomyWallet = createSmartWalletClient({
  projectId: 'your-project-id',
  chainId: 137,
  smartWalletType: 'biconomy'
});
```

## 🔧 Advanced Usage

### Batch Contract Deployment

```typescript
// Deploy multiple contracts in one transaction
const contracts = [
  { abi: greeterABI, bytecode: greeterBytecode, args: ['Hello 1'] },
  { abi: greeterABI, bytecode: greeterBytecode, args: ['Hello 2'] },
  { abi: greeterABI, bytecode: greeterBytecode, args: ['Hello 3'] }
];

const addresses = await Promise.all(
  contracts.map(contract => 
    smartWallet.deployContract(contract)
  )
);
```

### Contract Interaction

```typescript
const contractInstance = smartWallet.getContract({
  address: contractAddress,
  abi: greeterABI
});

// Read from contract
const greeting = await contractInstance.read.greet();

// Write to contract (gasless with Biconomy)
const txHash = await contractInstance.write.setGreeting(['New Greeting']);
```

### Chain Switching

```typescript
// Switch to different chain
await smartWallet.switchChain(137); // Polygon
await smartWallet.switchChain(8453); // Base
```

## 🛠️ Configuration

### Environment Variables

```bash
# .env file
WALLETCONNECT_PROJECT_ID=your_project_id_here
BASE_RPC_URL=https://base.llamarpc.com
POLYGON_RPC_URL=https://polygon.llamarpc.com
MAINNET_RPC_URL=https://eth.llamarpc.com
```

### Hardhat Integration

```typescript
// hardhat.config.ts
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "./plugins/safe3-deploy";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    base: {
      url: process.env.BASE_RPC_URL || 'https://base.llamarpc.com',
      chainId: 8453,
    },
  },
  safe3: {
    projectId: process.env.WALLETCONNECT_PROJECT_ID || '',
    metadata: {
      name: 'Safe3Devs Smart Wallet Deploy',
      description: 'Deploy contracts using smart wallets',
      url: 'https://safe3devs.com',
      icons: ['https://safe3devs.com/icon.png']
    }
  }
};

export default config;
```

## 🚀 CLI Usage

```bash
# Deploy with Coinbase Smart Wallet
safe3 deploy --contract Greeter --args '["Hello Smart Wallet!"]' --network base --smart-wallet coinbase

# Deploy with Safe Multisig
safe3 deploy --contract Greeter --args '["Hello Safe!"]' --network mainnet --smart-wallet safe

# Deploy with Biconomy (Gasless)
safe3 deploy --contract Greeter --args '["Hello Gasless!"]' --network polygon --smart-wallet biconomy
```

## 🔍 Troubleshooting

### Common Issues

1. **"Smart wallet not supported"**
   - Ensure you're using a supported smart wallet type
   - Check chain compatibility

2. **"Gasless transaction failed"**
   - Verify Biconomy configuration
   - Check paymaster balance

3. **"Passkey authentication failed"**
   - Ensure device supports WebAuthn
   - Check browser compatibility

### Debug Mode

```typescript
const smartWallet = createSmartWalletClient({
  projectId: 'your-project-id',
  chainId: 8453,
  smartWalletType: 'coinbase',
  debug: true // Enable debug logging
});
```

## 📚 Examples

Check out the `examples/` directory for:

- **Basic Smart Wallet Deployment**
- **Multisig Contract Deployment**
- **Gasless Transaction Examples**
- **Batch Operations**
- **Cross-Chain Deployment**

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Ready to deploy with smart wallets?** 🚀

Start with our [Quick Start Guide](QUICK_START.md) or run the test:

```bash
node test-smart-wallet.js
```
