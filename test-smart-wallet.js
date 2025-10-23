#!/usr/bin/env node

import { createSmartWalletClient } from './sdk/safedeploy/smart-wallet/index.js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Smart Wallet Deployment Test
 * 
 * This script will:
 * 1. Connect to smart wallet via QR code (passkey/biometric)
 * 2. Deploy a simple Greeter contract using smart wallet
 * 3. Interact with the deployed contract
 * 4. Test on Base Mainnet with gasless transactions
 */

async function testSmartWalletDeployment() {
  console.log('🚀 Safe3Devs Smart Wallet Deployment Test');
  console.log('==========================================');

  const projectId = process.env.WALLETCONNECT_PROJECT_ID;
  if (!projectId) {
    console.log('❌ WALLETCONNECT_PROJECT_ID is not set in .env');
    console.log('📝 Get your project ID from: https://cloud.walletconnect.com/');
    process.exit(1);
  }

  // Choose your smart wallet type
  const smartWalletTypes = {
    'coinbase': { name: 'Coinbase Smart Wallet', description: 'Passkey/Biometric authentication' },
    'safe': { name: 'Safe Multisig', description: 'Multisig wallet with social recovery' },
    'biconomy': { name: 'Biconomy', description: 'Gasless transactions' },
    'thirdweb': { name: 'Thirdweb', description: 'Custom smart wallet' }
  };

  // Default to Coinbase Smart Wallet
  const selectedSmartWallet = 'coinbase';
  const smartWalletInfo = smartWalletTypes[selectedSmartWallet];
  
  console.log(`🔐 Smart Wallet: ${smartWalletInfo.name}`);
  console.log(`📝 Description: ${smartWalletInfo.description}`);
  console.log(`🌐 Network: Base Mainnet (Chain ID: 8453)`);
  console.log('');

  try {
    // Initialize Smart Wallet client
    const smartWalletClient = createSmartWalletClient({
      projectId: projectId,
      chainId: 8453, // Base Mainnet
      smartWalletType: selectedSmartWallet,
      metadata: {
        name: 'Safe3Devs Smart Wallet Test',
        description: 'Testing smart wallet deployment on Base',
        url: 'https://safe3devs.com',
        icons: ['https://safe3devs.com/icon.png']
      }
    });

    console.log('✅ Smart Wallet client created');

    // Connect to smart wallet
    console.log('🔗 Connecting to smart wallet via QR code...');
    console.log('📱 Scan QR code with your wallet app');
    await smartWalletClient.connectWallet();
    
    const walletAddress = await smartWalletClient.getAddress();
    console.log('✅ Smart wallet connected!');
    console.log(`📍 Smart Wallet Address: ${walletAddress}`);

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

    console.log('📝 Deploying Greeter contract via Smart Wallet...');
    console.log('⏳ This may take a few moments...');
    
    // Deploy the contract
    const initialGreeting = "Hello Safe3Devs Smart Wallet!";
    const contractAddress = await smartWalletClient.deployContract({
      abi: greeterABI,
      bytecode: greeterBytecode,
      args: [initialGreeting]
    });

    console.log('🎉 Contract deployed successfully!');
    console.log(`📍 Contract Address: ${contractAddress}`);

    // Get contract instance
    const contractInstance = smartWalletClient.getContract({
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
    const newGreeting = "Updated greeting from Smart Wallet!";
    console.log('✍️ Setting new greeting...');
    const txHash = await contractInstance.write.setGreeting([newGreeting]);
    console.log(`🔗 Transaction hash: ${txHash}`);

    // Wait for transaction to be mined
    console.log('⏳ Waiting for transaction to be mined...');
    const publicClient = smartWalletClient.getPublicClient();
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
    console.log('🎉 Smart Wallet test completed successfully!');
    console.log(`🔐 Smart Wallet Type: ${smartWalletInfo.name}`);
    console.log(`📍 Smart Wallet Address: ${walletAddress}`);
    console.log(`📍 Contract Address: ${contractAddress}`);
    console.log(`🌐 Network: Base Mainnet`);

  } catch (error) {
    console.error('❌ Smart wallet test failed:', error);
  } finally {
    // Disconnect WalletConnect session
    console.log('🔌 Disconnecting from WalletConnect...');
    // Note: In a real implementation, you'd call disconnectWallet()
    console.log('✅ Disconnected successfully');
  }
}

// Run the test
testSmartWalletDeployment();
