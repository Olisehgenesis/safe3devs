# Safe3Devs QR Deploy SDK

A universal TypeScript/JavaScript SDK for deploying smart contracts using WalletConnect QR code signing. Supports both **ethers.js** and **viem** clients, making it perfect for any Web3 development workflow.

## 🚀 Features

- **Cross-Client Support**: Works with both ethers.js v6 and viem v2
- **QR Code Signing**: Deploy contracts using WalletConnect QR code authentication
- **Hardhat Integration**: Seamless integration with Hardhat development environment
- **TypeScript First**: Full TypeScript support with comprehensive type definitions
- **JavaScript Compatible**: Works in both TypeScript and JavaScript environments
- **Multi-Chain**: Support for Ethereum, Polygon, BSC, Arbitrum, Optimism, Base, and more
- **Event-Driven**: Built-in event system for connection and transaction monitoring

## 📦 Installation

```bash
npm install @safe3devs/safedeploy
```

### Peer Dependencies

Install one or both of the following:

```bash
# For ethers.js support
npm install ethers@^6.0.0

# For viem support  
npm install viem@^2.0.0
```

## 🔧 Quick Start

### 1. Get WalletConnect Project ID

1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project
3. Copy your Project ID

### 2. Environment Setup

Create a `.env` file:

```env
WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### 3. Basic Usage

#### With Ethers.js

```typescript
import { createSafe3Client } from '@safe3devs/safedeploy';

const client = createSafe3Client({
  client: 'ethers',
  projectId: process.env.WALLETCONNECT_PROJECT_ID!,
  chainId: 1, // Ethereum mainnet
});

// Connect to wallet
await client.connectWallet();

// Get ethers signer
const signer = client.getSigner();

// Deploy contract
const factory = new ethers.ContractFactory(abi, bytecode);
const contract = await client.deployContract(factory, 'Hello World!');
```

#### With Viem

```typescript
import { createSafe3Client } from '@safe3devs/safedeploy';

const client = createSafe3Client({
  client: 'viem',
  projectId: process.env.WALLETCONNECT_PROJECT_ID!,
  chainId: 1, // Ethereum mainnet
});

// Connect to wallet
await client.connectWallet();

// Deploy contract
const contractAddress = await client.deployContract({
  abi: greeterABI,
  bytecode: greeterBytecode,
  args: ['Hello World!']
});
```

## 🧩 Hardhat Integration

### 1. Install Plugin

```bash
npm install @safe3devs/safedeploy
```

### 2. Configure Hardhat

Add to your `hardhat.config.ts`:

```typescript
import '@safe3devs/safedeploy/plugins/safe3-deploy';

const config: HardhatUserConfig = {
  // ... your config
  safe3: {
    projectId: process.env.WALLETCONNECT_PROJECT_ID!,
  },
};
```

### 3. Use in Scripts

```typescript
import { ethers } from 'hardhat';

async function main() {
  // Get Safe3 signer
  const signer = hre.safe3.getSigner();
  
  // Deploy contract
  const Greeter = await ethers.getContractFactory('Greeter', signer);
  const greeter = await Greeter.deploy('Hello Safe3Devs!');
  await greeter.waitForDeployment();
  
  console.log('Deployed at:', await greeter.getAddress());
}
```

### 4. Hardhat Tasks

```bash
# Connect to wallet
npx hardhat safe3:connect

# Deploy contract
npx hardhat safe3:deploy --contract Greeter --args '["Hello World!"]'

# Check connection status
npx hardhat safe3:status

# Disconnect
npx hardhat safe3:disconnect
```

## 📚 API Reference

### Core SDK

#### `Safe3QRDeploy`

Base class for QR-based wallet connection and transaction signing.

```typescript
class Safe3QRDeploy {
  constructor(options: Safe3QRDeployOptions);
  
  // Connection management
  connectWallet(): Promise<SessionTypes.Struct>;
  disconnectWallet(): Promise<void>;
  isConnected(): boolean;
  getAddress(): Promise<string>;
  
  // Transaction methods
  sendTransaction(tx: any): Promise<string>;
  signMessage(message: string): Promise<string>;
  
  // Event handling
  on(event: string, listener: Function): this;
  emit(event: string, ...args: any[]): boolean;
}
```

#### `Safe3EthersSigner`

Ethers.js integration for Safe3Devs QR Deploy.

```typescript
class Safe3EthersSigner extends Safe3QRDeploy {
  constructor(options: Safe3EthersSignerOptions);
  
  // Ethers-specific methods
  getSigner(): ethers.JsonRpcSigner;
  getProvider(): ethers.JsonRpcProvider;
  deployContract(factory: ethers.ContractFactory, ...args: any[]): Promise<ethers.Contract>;
  deployContractFromABI(abi: any[], bytecode: string, ...args: any[]): Promise<ethers.Contract>;
}
```

#### `Safe3ViemClient`

Viem integration for Safe3Devs QR Deploy.

```typescript
class Safe3ViemClient extends Safe3QRDeploy {
  constructor(options: Safe3ViemClientOptions);
  
  // Viem-specific methods
  getClient(): WalletClient;
  getPublicClient(): PublicClient;
  deployContract(options: DeployContractOptions): Promise<Address>;
  deployContractAndGetInstance(options: DeployContractOptions): Promise<Contract>;
  switchChain(chainId: number): Promise<void>;
}
```

### JavaScript Wrapper

#### `createSafe3Client`

Factory function to create Safe3 client instances.

```typescript
function createSafe3Client(options: Safe3ClientOptions): Safe3Client;
function createSafe3ClientAuto(options: Omit<Safe3ClientOptions, 'client'>): Safe3Client;
```

#### Utility Functions

```typescript
function isEthersClient(client: Safe3Client): client is Safe3EthersSigner;
function isViemClient(client: Safe3Client): client is Safe3ViemClient;
function getClientType(client: Safe3Client): ClientType;
```

## 🔗 Supported Networks

- **Ethereum Mainnet** (Chain ID: 1)
- **Polygon** (Chain ID: 137)
- **BSC** (Chain ID: 56)
- **Arbitrum** (Chain ID: 42161)
- **Optimism** (Chain ID: 10)
- **Base** (Chain ID: 8453)

## 🎯 Use Cases

- **Smart Contract Deployment**: Deploy contracts without exposing private keys
- **Development Workflows**: Integrate QR signing into existing Hardhat workflows
- **Cross-Platform**: Use the same SDK in Node.js, browsers, and mobile apps
- **Team Collaboration**: Share deployment scripts without sharing private keys
- **CI/CD Integration**: Deploy contracts in automated environments with QR approval

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm test -- --coverage
```

## 🏗️ Building

```bash
# Build all packages
npm run build

# Build specific package
npm run build:core
npm run build:ethers
npm run build:viem
npm run build:js
npm run build:plugin
```

## 📝 Examples

Check the `scripts/` directory for complete examples:

- `deploy.ts` - Hardhat integration example
- `deploy-ethers.ts` - Ethers.js standalone example
- `deploy-viem.ts` - Viem standalone example

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [GitHub Wiki](https://github.com/safe3devs/safedeploy-sdk/wiki)
- **Issues**: [GitHub Issues](https://github.com/safe3devs/safedeploy-sdk/issues)
- **Discord**: [Safe3Devs Community](https://discord.gg/safe3devs)

## 🙏 Acknowledgments

- [WalletConnect](https://walletconnect.com/) for the amazing QR code signing infrastructure
- [Ethers.js](https://ethers.org/) and [Viem](https://viem.sh/) teams for excellent Web3 libraries
- [Hardhat](https://hardhat.org/) for the fantastic development environment

---

**Built with ❤️ by the Safe3Devs team**