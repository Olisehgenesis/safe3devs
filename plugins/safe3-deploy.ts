import { extendEnvironment } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Safe3EthersSigner, Safe3EthersSignerOptions } from '../sdk/safedeploy/ethers';

declare module 'hardhat/types/runtime' {
  interface HardhatRuntimeEnvironment {
    safe3: Safe3EthersSigner;
  }
}

/**
 * Hardhat plugin for Safe3Devs QR Deploy SDK
 * 
 * Usage:
 * 1. Add to hardhat.config.ts:
 *    import '@safe3devs/safedeploy/plugins/safe3-deploy';
 * 
 * 2. Use in scripts:
 *    const signer = hre.safe3.getSigner();
 *    const contract = await ethers.getContractFactory("MyContract", signer);
 *    const instance = await contract.deploy();
 */
extendEnvironment(async (hre: HardhatRuntimeEnvironment) => {
  // Get configuration from hardhat config
  const config = hre.config.safe3 || {};
  
  // Default options
  const options: Safe3EthersSignerOptions = {
    projectId: process.env.WALLETCONNECT_PROJECT_ID || '',
    chainId: hre.network.config.chainId || 1,
    rpcUrl: hre.network.config.url,
    metadata: {
      name: 'Safe3Devs Hardhat Deploy',
      description: 'Deploy contracts using QR code signing',
      url: 'https://safe3devs.com',
      icons: ['https://safe3devs.com/icon.png']
    },
    ...config
  };

  // Validate required options
  if (!options.projectId) {
    throw new Error(
      'WalletConnect Project ID is required. Set WALLETCONNECT_PROJECT_ID environment variable or add projectId to hardhat config.'
    );
  }

  // Create Safe3EthersSigner instance
  const safe3Signer = new Safe3EthersSigner(options);
  
  // Add to Hardhat runtime environment
  hre.safe3 = safe3Signer;

  // Auto-connect on first use
  let connected = false;
  const originalGetSigner = safe3Signer.getSigner.bind(safe3Signer);
  
  safe3Signer.getSigner = async function() {
    if (!connected) {
      console.log('🔗 Connecting to wallet via QR code...');
      await safe3Signer.connectWallet();
      connected = true;
    }
    return originalGetSigner();
  };
});

/**
 * Hardhat task for deploying contracts with QR signing
 */
import { task } from 'hardhat/config';

task('safe3:deploy', 'Deploy a contract using QR code signing')
  .addParam('contract', 'Contract name to deploy')
  .addOptionalParam('args', 'Constructor arguments (JSON string)', '[]')
  .setAction(async (taskArgs, hre) => {
    const { contract, args } = taskArgs;
    
    try {
      // Parse constructor arguments
      const constructorArgs = JSON.parse(args);
      
      // Get contract factory
      const ContractFactory = await hre.ethers.getContractFactory(contract);
      
      // Get Safe3 signer
      const signer = hre.safe3.getSigner();
      
      // Deploy contract
      console.log(`🚀 Deploying ${contract}...`);
      const contractInstance = await ContractFactory.connect(signer).deploy(...constructorArgs);
      
      // Wait for deployment
      await contractInstance.waitForDeployment();
      const address = await contractInstance.getAddress();
      
      console.log(`✅ Contract deployed successfully!`);
      console.log(`📍 Address: ${address}`);
      console.log(`🔗 Transaction: ${contractInstance.deploymentTransaction()?.hash}`);
      
      return address;
    } catch (error) {
      console.error('❌ Deployment failed:', error);
      throw error;
    }
  });

task('safe3:connect', 'Connect to wallet via QR code')
  .setAction(async (taskArgs, hre) => {
    try {
      console.log('🔗 Connecting to wallet...');
      await hre.safe3.connectWallet();
      
      const address = await hre.safe3.getAddress();
      console.log(`✅ Connected to wallet: ${address}`);
      
      return address;
    } catch (error) {
      console.error('❌ Connection failed:', error);
      throw error;
    }
  });

task('safe3:disconnect', 'Disconnect from wallet')
  .setAction(async (taskArgs, hre) => {
    try {
      await hre.safe3.disconnectWallet();
      console.log('✅ Disconnected from wallet');
    } catch (error) {
      console.error('❌ Disconnection failed:', error);
      throw error;
    }
  });

task('safe3:status', 'Check wallet connection status')
  .setAction(async (taskArgs, hre) => {
    try {
      const isConnected = hre.safe3.isConnected();
      
      if (isConnected) {
        const address = await hre.safe3.getAddress();
        console.log(`✅ Wallet connected: ${address}`);
      } else {
        console.log('❌ Wallet not connected');
      }
      
      return { connected: isConnected, address: isConnected ? await hre.safe3.getAddress() : null };
    } catch (error) {
      console.error('❌ Status check failed:', error);
      throw error;
    }
  });
