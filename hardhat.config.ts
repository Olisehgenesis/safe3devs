import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import './plugins/safe3-deploy';
import * as dotenv from 'dotenv';

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.19',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    mainnet: {
      url: process.env.MAINNET_RPC_URL || 'https://eth.llamarpc.com',
      chainId: 1,
    },
    polygon: {
      url: process.env.POLYGON_RPC_URL || 'https://polygon.llamarpc.com',
      chainId: 137,
    },
    bsc: {
      url: process.env.BSC_RPC_URL || 'https://bsc.llamarpc.com',
      chainId: 56,
    },
    arbitrum: {
      url: process.env.ARBITRUM_RPC_URL || 'https://arbitrum.llamarpc.com',
      chainId: 42161,
    },
    optimism: {
      url: process.env.OPTIMISM_RPC_URL || 'https://optimism.llamarpc.com',
      chainId: 10,
    },
    base: {
      url: process.env.BASE_RPC_URL || 'https://base.llamarpc.com',
      chainId: 8453,
    },
    alfajores: {
      url: process.env.ALFAJORES_RPC_URL || 'https://alfajores-forno.celo-testnet.org',
      chainId: 44787,
    },
  },
  // Safe3Devs QR Deploy configuration
  safe3: {
    projectId: process.env.WALLETCONNECT_PROJECT_ID || '',
    metadata: {
      name: 'Safe3Devs Hardhat Deploy',
      description: 'Deploy contracts using QR code signing',
      url: 'https://safe3devs.com',
      icons: ['https://safe3devs.com/icon.png']
    }
  },
  paths: {
    sources: './contracts',
    tests: './tests',
    cache: './cache',
    artifacts: './artifacts',
  },
};

export default config;
