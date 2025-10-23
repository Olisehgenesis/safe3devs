# Coinbase Smart Wallet Integration

## 🔐 **Coinbase Smart Wallet** - The Future of Web3 Authentication

The Safe3Devs QR Deploy SDK now includes **first-class support** for Coinbase Smart Wallet, enabling developers to deploy contracts using **passkey/biometric authentication** instead of traditional private keys.

## 🌟 **Why Coinbase Smart Wallet?**

### ✅ **Enhanced Security**
- **No Private Keys**: Users never manage private keys
- **Biometric Authentication**: Face ID, Touch ID, Windows Hello
- **Passkey Support**: WebAuthn standard for secure authentication
- **Social Recovery**: Easy account recovery without seed phrases

### ✅ **Better User Experience**
- **One-Click Deploy**: No wallet setup required
- **Gasless Transactions**: Pay with credit card or other methods
- **Cross-Device**: Works on any device with biometric support
- **Familiar UX**: Uses native device authentication

### ✅ **Developer Benefits**
- **Higher Conversion**: Users don't need to install wallets
- **Reduced Friction**: No onboarding complexity
- **Better Analytics**: Track user engagement without wallet barriers
- **Future-Proof**: Built on Account Abstraction standards

## 🚀 **Quick Start with Coinbase Smart Wallet**

### 1. Install the SDK

```bash
npm install safe3devs-qr-deploy
```

### 2. Get WalletConnect Project ID

1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project
3. Copy your Project ID

### 3. Deploy with Passkey Authentication

```typescript
import { createSmartWalletClient } from 'safe3devs-qr-deploy';

const coinbaseWallet = createSmartWalletClient({
  projectId: 'your-walletconnect-project-id',
  chainId: 8453, // Base Mainnet (recommended for low fees)
  smartWalletType: 'coinbase',
  metadata: {
    name: 'My DApp',
    description: 'Deploy contracts with passkey authentication',
    url: 'https://mydapp.com',
    icons: ['https://mydapp.com/icon.png']
  }
});

// Connect via QR code + passkey prompt
await coinbaseWallet.connectWallet();

// Deploy contract (gasless!)
const contractAddress = await coinbaseWallet.deployContract({
  abi: greeterABI,
  bytecode: greeterBytecode,
  args: ['Hello Coinbase Smart Wallet!']
});

console.log('Contract deployed at:', contractAddress);
```

## 🔧 **Advanced Features**

### **Gasless Transactions**

```typescript
// Deploy without gas fees (sponsored by Coinbase)
const contractAddress = await coinbaseWallet.deployContract({
  abi: greeterABI,
  bytecode: greeterBytecode,
  args: ['Hello Gasless!'],
  // No gas configuration needed - handled automatically
});
```

### **Batch Operations**

```typescript
// Deploy multiple contracts in one transaction
const contracts = [
  { abi: greeterABI, bytecode: greeterBytecode, args: ['Hello 1'] },
  { abi: greeterABI, bytecode: greeterBytecode, args: ['Hello 2'] },
  { abi: greeterABI, bytecode: greeterBytecode, args: ['Hello 3'] }
];

const addresses = await Promise.all(
  contracts.map(contract => 
    coinbaseWallet.deployContract(contract)
  )
);
```

### **Contract Interaction**

```typescript
const contractInstance = coinbaseWallet.getContract({
  address: contractAddress,
  abi: greeterABI
});

// Read from contract
const greeting = await contractInstance.read.greet();

// Write to contract (gasless!)
const txHash = await contractInstance.write.setGreeting(['New Greeting']);
```

## 🌐 **Supported Networks**

| Network | Chain ID | Status | Gas Fees |
|---------|----------|--------|----------|
| **Base Mainnet** | 8453 | ✅ Recommended | ~$0.01-0.05 |
| **Ethereum Mainnet** | 1 | ✅ Supported | ~$5-50 |
| **Polygon Mainnet** | 137 | ✅ Supported | ~$0.01-0.10 |
| **Arbitrum One** | 42161 | ✅ Supported | ~$0.10-1.00 |
| **Optimism** | 10 | ✅ Supported | ~$0.10-1.00 |

## 🧪 **Testing**

### **Test on Base Mainnet**

```bash
# Test Coinbase Smart Wallet deployment
node test-smart-wallet.js
```

### **Test Different Networks**

```typescript
// Test on Polygon (low fees)
const polygonWallet = createSmartWalletClient({
  projectId: 'your-project-id',
  chainId: 137, // Polygon
  smartWalletType: 'coinbase'
});

// Test on Ethereum (higher fees but most secure)
const ethereumWallet = createSmartWalletClient({
  projectId: 'your-project-id',
  chainId: 1, // Ethereum
  smartWalletType: 'coinbase'
});
```

## 🔍 **Troubleshooting**

### **Common Issues**

1. **"Passkey not supported"**
   - Ensure device supports WebAuthn
   - Check browser compatibility
   - Try on Chrome/Safari/Firefox

2. **"Gasless transaction failed"**
   - Verify Coinbase Smart Wallet configuration
   - Check paymaster balance
   - Ensure network supports gasless transactions

3. **"QR code not scanning"**
   - Ensure WalletConnect project ID is correct
   - Check network connectivity
   - Try refreshing the QR code

### **Debug Mode**

```typescript
const coinbaseWallet = createSmartWalletClient({
  projectId: 'your-project-id',
  chainId: 8453,
  smartWalletType: 'coinbase',
  debug: true // Enable debug logging
});
```

## 📚 **Examples**

Check out the `examples/` directory for:

- **Basic Coinbase Smart Wallet Deployment**
- **Gasless Transaction Examples**
- **Batch Contract Deployment**
- **Cross-Chain Deployment**
- **Contract Interaction Patterns**

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 **License**

MIT License - see [LICENSE](LICENSE) file for details.

---

**Ready to deploy with Coinbase Smart Wallet?** 🚀

Start with our [Quick Start Guide](README.md) or run the test:

```bash
node test-smart-wallet.js
```

**Experience the future of Web3 authentication!** ✨
