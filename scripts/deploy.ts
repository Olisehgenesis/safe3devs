import { ethers } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

async function main() {
  console.log('🚀 Safe3Devs QR Deploy Demo');
  console.log('============================');

  // Get the Safe3 signer from Hardhat environment
  const signer = hre.safe3.getSigner();
  
  // Get contract factory
  const Greeter = await ethers.getContractFactory('Greeter', signer);
  
  console.log('📝 Deploying Greeter contract...');
  console.log('🔗 Please scan the QR code to sign the deployment transaction');
  
  // Deploy the contract
  const greeter = await Greeter.deploy('Hello Safe3Devs!');
  
  console.log('⏳ Waiting for deployment confirmation...');
  await greeter.waitForDeployment();
  
  const address = await greeter.getAddress();
  console.log('✅ Contract deployed successfully!');
  console.log(`📍 Address: ${address}`);
  console.log(`🔗 Transaction: ${greeter.deploymentTransaction()?.hash}`);
  
  // Test the contract
  console.log('\n🧪 Testing deployed contract...');
  const greeting = await greeter.greet();
  console.log(`💬 Current greeting: "${greeting}"`);
  
  // Update greeting
  console.log('📝 Updating greeting...');
  const updateTx = await greeter.setGreeting('Hello from Safe3Devs QR Deploy!');
  await updateTx.wait();
  
  const newGreeting = await greeter.greet();
  console.log(`💬 New greeting: "${newGreeting}"`);
  
  // Get contract version
  const version = await greeter.version();
  console.log(`📋 Contract version: ${version}`);
  
  console.log('\n🎉 Demo completed successfully!');
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });
