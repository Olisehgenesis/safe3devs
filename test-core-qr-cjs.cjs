#!/usr/bin/env node

// Test using CommonJS require
const { Safe3QRDeploy } = require('./dist/core/index.js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

/**
 * Test Core QR Deploy Functionality
 * 
 * This script will:
 * 1. Initialize the core SDK
 * 2. Show QR code for connection
 * 3. Test basic functionality
 */

async function testCoreQRDeploy() {
  console.log('🔐 Safe3Devs Core QR Deploy Test');
  console.log('================================');

  const projectId = process.env.WALLETCONNECT_PROJECT_ID;
  if (!projectId) {
    console.log('❌ WALLETCONNECT_PROJECT_ID is not set in .env');
    console.log('📝 Get your project ID from: https://cloud.walletconnect.com/');
    process.exit(1);
  }

  console.log(`🌐 Testing WalletConnect QR connection`);
  console.log('');

  try {
    // Initialize core SDK
    const coreSDK = new Safe3QRDeploy({
      projectId: projectId,
      chainId: 8453, // Base Mainnet
      metadata: {
        name: 'Safe3Devs Core Test',
        description: 'Testing core QR deploy functionality',
        url: 'https://safe3devs.com',
        icons: ['https://safe3devs.com/icon.png']
      }
    });

    console.log('✅ Safe3QRDeploy initialized successfully');

    // Connect to wallet
    console.log('🔗 Connecting to wallet via QR code...');
    console.log('📱 Scan QR code with your wallet app');
    
    const session = await coreSDK.connectWallet();
    console.log('✅ Wallet connected successfully!');
    console.log(`📍 Session topic: ${session.topic}`);

    // Get address
    const address = await coreSDK.getAddress();
    console.log(`📍 Wallet address: ${address}`);

    // Test signing a message
    console.log('✍️ Testing message signing...');
    const message = "Hello Safe3Devs Core Test!";
    const signature = await coreSDK.signMessage(message);
    console.log(`✅ Message signed: ${signature.slice(0, 20)}...`);

    console.log('');
    console.log('🎉 Core QR Deploy test completed successfully!');
    console.log(`📍 Wallet Address: ${address}`);
    console.log(`🌐 Network: Base Mainnet (Chain ID: 8453)`);

  } catch (error) {
    console.error('❌ Core QR Deploy test failed:', error);
  } finally {
    console.log('🔌 Test completed');
  }
}

// Run the test
testCoreQRDeploy();
