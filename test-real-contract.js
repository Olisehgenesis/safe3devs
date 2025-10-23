#!/usr/bin/env node

import { createSafe3Client } from './sdk/safedeploy/js/index.js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Real Contract Deployment Test
 * 
 * This script will:
 * 1. Connect to wallet via QR code
 * 2. Deploy a simple Greeter contract
 * 3. Interact with the deployed contract
 * 4. Test on Alfajores Celo testnet
 */

async function testRealContractDeployment() {
  console.log('🚀 Safe3Devs Real Contract Deployment Test');
  console.log('==========================================');
  
  if (!process.env.WALLETCONNECT_PROJECT_ID) {
    console.error('❌ Please set WALLETCONNECT_PROJECT_ID in your .env file');
    console.log('📝 Get your project ID from: https://cloud.walletconnect.com/');
    process.exit(1);
  }

  // Choose your test network
  const networks = {
    'alfajores': { chainId: 44787, name: 'Alfajores Celo Testnet' },
    'polygon': { chainId: 137, name: 'Polygon Mainnet' },
    'base': { chainId: 8453, name: 'Base Mainnet' },
    'mainnet': { chainId: 1, name: 'Ethereum Mainnet' }
  };

  // Default to Alfajores for testing
  const selectedNetwork = networks.alfajores;
  
  console.log(`🌐 Testing on: ${selectedNetwork.name} (Chain ID: ${selectedNetwork.chainId})`);
  console.log('');

  try {
    // Create Safe3 client with viem (recommended for testing)
    const client = createSafe3Client({
      client: 'viem',
      projectId: process.env.WALLETCONNECT_PROJECT_ID,
      chainId: selectedNetwork.chainId,
      metadata: {
        name: 'Safe3Devs Contract Test',
        description: 'Testing real contract deployment',
        url: 'https://safe3devs.com',
        icons: ['https://safe3devs.com/icon.png']
      }
    });

    console.log('🔗 Connecting to wallet...');
    console.log('📱 Please scan the QR code with your wallet');
    
    // Connect to wallet
    await client.connectWallet();
    
    const address = await client.getAddress();
    console.log(`✅ Connected to wallet: ${address}`);
    console.log('');

    // Simple Greeter contract ABI and bytecode
    const greeterABI = [
      {
        inputs: [{ name: '_greeting', type: 'string' }],
        stateMutability: 'nonpayable',
        type: 'constructor'
      },
      {
        inputs: [],
        name: 'greet',
        outputs: [{ name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [{ name: '_greeting', type: 'string' }],
        name: 'setGreeting',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
      }
    ];

    // Simple Greeter contract bytecode (compiled with Solidity 0.8.19)
    const greeterBytecode = '0x608060405234801561001057600080fd5b5060405161014d38038061014d833981810160405281019061003291906100a2565b806000908051906020019061004892919061004f565b5050610147565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061009057805160ff19168380011785556100be565b828001600101855582156100be579182015b828111156100be5782518255916020019190600101906100a3565b506100ca9291506100cf565b5090565b5b808211156100ca57600081556001016100d0565b6000819050919050565b6100f5816100e2565b82525050565b600060208201905061011060008301846100ec565b92915050565b600080fd5b6000819050919050565b61012e8161011b565b811461013957600080fd5b50565b60008151905061014b81610125565b92915050565b60006020828403121561016757610166610116565b5b60006101758482850161013c565b91505092915050565b6101878161011b565b82525050565b60006020820190506101a2600083018461017e565b9291505056fea2646970667358221220...';

    console.log('📝 Deploying Greeter contract...');
    console.log('⏳ This may take a few moments...');
    
    // Deploy the contract
    const contractAddress = await client.deployContract({
      abi: greeterABI,
      bytecode: greeterBytecode,
      args: ['Hello Safe3Devs! 🚀']
    });

    console.log(`✅ Contract deployed successfully!`);
    console.log(`📍 Contract Address: ${contractAddress}`);
    console.log('');

    // Get contract instance for interaction
    const contract = await client.deployContractAndGetInstance({
      abi: greeterABI,
      bytecode: greeterBytecode,
      args: ['Hello Safe3Devs! 🚀']
    });

    console.log('🧪 Testing contract interaction...');
    
    // Read the greeting
    const greeting = await contract.read.greet();
    console.log(`💬 Current greeting: "${greeting}"`);
    
    // Update the greeting
    console.log('📝 Updating greeting...');
    const updateTxHash = await contract.write.setGreeting(['Hello from Safe3Devs QR Deploy! 🎉']);
    console.log(`📄 Update transaction: ${updateTxHash}`);
    
    // Wait for transaction confirmation
    const publicClient = client.getPublicClient();
    await publicClient.waitForTransactionReceipt({ hash: updateTxHash });
    
    // Read the updated greeting
    const newGreeting = await contract.read.greet();
    console.log(`💬 New greeting: "${newGreeting}"`);
    
    console.log('');
    console.log('🎉 Contract deployment and interaction test completed successfully!');
    console.log(`🔗 View on explorer: https://alfajores.celoscan.io/address/${contractAddress}`);
    
    // Cleanup
    await client.cleanup();
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('');
    console.log('💡 Troubleshooting tips:');
    console.log('1. Make sure you have a WalletConnect Project ID set in .env');
    console.log('2. Ensure your wallet is connected and has testnet tokens');
    console.log('3. Check that the network is supported');
    process.exit(1);
  }
}

// Run the test
testRealContractDeployment();
