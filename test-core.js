// Simple development test - direct import
import { Safe3QRDeploy } from './sdk/safedeploy/core/index.js';

async function testCore() {
  console.log('🧪 Testing Safe3QRDeploy Core...');
  
  try {
    const client = new Safe3QRDeploy({
      projectId: process.env.WALLETCONNECT_PROJECT_ID || 'test-project-id',
      metadata: {
        name: 'Safe3Devs Test',
        description: 'Testing QR Deploy SDK',
        url: 'https://safe3devs.com',
        icons: ['https://safe3devs.com/icon.png']
      }
    });

    console.log('✅ Safe3QRDeploy instance created');
    console.log('📱 Ready for QR code connection');
    
    // Test basic functionality
    console.log('🔍 Connection status:', client.isConnected());
    console.log('📋 Session:', client.getSession());
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCore();
