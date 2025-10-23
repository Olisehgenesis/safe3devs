// Quick test script for development
import { createSafe3Client } from './dist/index.js';

async function testConnection() {
  console.log('🧪 Testing Safe3Devs QR Deploy SDK...');
  
  try {
    // Create client
    const client = createSafe3Client({
      client: 'ethers',
      projectId: process.env.WALLETCONNECT_PROJECT_ID || 'test-project-id',
      chainId: 1
    });

    console.log('✅ Client created successfully');
    console.log('🔗 Ready to connect to wallet via QR code');
    
    // Uncomment the next lines to test actual connection:
    // await client.connectWallet();
    // const address = await client.getAddress();
    // console.log(`✅ Connected to: ${address}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testConnection();
