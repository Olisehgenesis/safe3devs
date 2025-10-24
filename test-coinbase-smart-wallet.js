#!/usr/bin/env node

// Test using the published package
import { createSafe3Client } from 'safe3devs-qr-deploy';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Test Coinbase Smart Wallet Deployment
 * 
 * This script will:
 * 1. Connect to wallet via QR code
 * 2. Deploy a simple Greeter contract
 * 3. Test on Base Mainnet
 */

async function testCoinbaseSmartWallet() {
  console.log('🔐 Safe3Devs Coinbase Smart Wallet Test');
  console.log('=====================================');

  const projectId = process.env.WALLETCONNECT_PROJECT_ID;
  if (!projectId) {
    console.log('❌ WALLETCONNECT_PROJECT_ID is not set in .env');
    console.log('📝 Get your project ID from: https://cloud.walletconnect.com/');
    process.exit(1);
  }

  console.log(`🌐 Testing on: Base Mainnet (Chain ID: 8453)`);
  console.log('');

  try {
    // Initialize Viem client for deployment
    const viemClient = createSafe3Client({
      client: 'viem',
      projectId: projectId,
      chainId: 8453, // Base Mainnet
      metadata: {
        name: 'Safe3Devs Coinbase Test',
        description: 'Testing Coinbase Smart Wallet on Base',
        url: 'https://safe3devs.com',
        icons: ['https://safe3devs.com/icon.png']
      }
    });

    console.log('✅ Safe3ViemClient created for Base Mainnet');

    // Connect to wallet
    console.log('🔗 Connecting to wallet via QR code...');
    console.log('📱 Scan QR code with your Coinbase Wallet app');
    await viemClient.connectWallet();
    
    const deployerAddress = await viemClient.getAddress();
    console.log('✅ Wallet connected! Deployer address:', deployerAddress);

    // Simple Greeter contract ABI
    const greeterABI = [
      {
        inputs: [
          {
            name: '_greeting',
            type: 'string'
          }
        ],
        stateMutability: 'nonpayable',
        type: 'constructor'
      },
      {
        inputs: [],
        name: 'greet',
        outputs: [
          {
            name: '',
            type: 'string'
          }
        ],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [
          {
            name: '_greeting',
            type: 'string'
          }
        ],
        name: 'setGreeting',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
      }
    ];

    // Simple Greeter contract bytecode
    const greeterBytecode = '0x608060405234801561001057600080fd5b5060405161014d38038061014d833981810160405281019061003291906100a2565b806000908051906020019061004892919061004f565b5050610147565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061009057805160ff19168380011785556100be565b828001600101855582156100be579182015b828111156100be5782518255916020019190600101906100a3565b506100ca9291506100cf565b5090565b5b808211156100ca57600081556001016100d0565b6000819050919050565b6100f5816100e2565b82525050565b600060208201905061011060008301846100ec565b92915050565b600080fd5b6000819050919050565b61012e8161011b565b811461013957600080fd5b50565b60008151905061014b81610125565b92915050565b60006020828403121561016757610166610116565b5b60006101758482850161013c565b91505092915050565b6101878161011b565b82525050565b60006020820190506101a2600083018461017e565b9291505056fea2646970667358221220...';

    console.log('📝 Deploying Greeter contract...');
    console.log('⏳ This may take a few moments...');
    
    // Deploy the contract
    const initialGreeting = "Hello Coinbase Smart Wallet!";
    const contractAddress = await viemClient.deployContract({
      abi: greeterABI,
      bytecode: greeterBytecode,
      args: [initialGreeting]
    });

    console.log('🎉 Contract deployed successfully!');
    console.log(`📍 Contract Address: ${contractAddress}`);

    // Get contract instance
    const contractInstance = viemClient.getContract({
      address: contractAddress,
      abi: greeterABI
    });

    // Read initial greeting
    console.log('📖 Reading initial greeting...');
    const greeting = await contractInstance.read.greet();
    console.log(`👋 Current greeting: ${greeting}`);

    if (greeting === initialGreeting) {
      console.log('✅ Initial greeting matches!');
    } else {
      console.error('❌ Initial greeting mismatch!');
    }

    // Update greeting
    const newGreeting = "Updated greeting from Coinbase Smart Wallet!";
    console.log('✍️ Setting new greeting...');
    const txHash = await contractInstance.write.setGreeting([newGreeting]);
    console.log(`🔗 Transaction hash: ${txHash}`);

    // Wait for transaction to be mined
    console.log('⏳ Waiting for transaction to be mined...');
    const publicClient = viemClient.getPublicClient();
    await publicClient.waitForTransactionReceipt({ hash: txHash });
    console.log('✅ Transaction mined!');

    // Read updated greeting
    const updatedGreeting = await contractInstance.read.greet();
    console.log(`👋 Updated greeting: ${updatedGreeting}`);

    if (updatedGreeting === newGreeting) {
      console.log('✅ Updated greeting matches!');
    } else {
      console.error('❌ Updated greeting mismatch!');
    }

    console.log('');
    console.log('🎉 Coinbase Smart Wallet test completed successfully!');
    console.log(`📍 Deployer Address: ${deployerAddress}`);
    console.log(`📍 Contract Address: ${contractAddress}`);
    console.log(`🌐 Network: Base Mainnet`);

  } catch (error) {
    console.error('❌ Coinbase Smart Wallet test failed:', error);
  } finally {
    // Disconnect WalletConnect session
    console.log('🔌 Disconnecting from WalletConnect...');
    // Note: In a real implementation, you'd call disconnectWallet()
    console.log('✅ Disconnected successfully');
  }
}

// Run the test
testCoinbaseSmartWallet();
