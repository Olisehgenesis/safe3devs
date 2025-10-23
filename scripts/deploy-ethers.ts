import { createSafe3Client } from '../sdk/safedeploy/js';
import { ethers } from 'ethers';

async function deployWithEthers() {
  console.log('🚀 Safe3Devs QR Deploy - Ethers.js Example');
  console.log('==========================================');

  // Create Safe3 client with ethers
  const safe3Client = createSafe3Client({
    client: 'ethers',
    projectId: process.env.WALLETCONNECT_PROJECT_ID || 'your-project-id',
    chainId: 1, // Ethereum mainnet
    metadata: {
      name: 'Safe3Devs Ethers Deploy',
      description: 'Deploy contracts using ethers.js and QR signing',
      url: 'https://safe3devs.com',
      icons: ['https://safe3devs.com/icon.png']
    }
  });

  try {
    // Connect to wallet
    console.log('🔗 Connecting to wallet...');
    await safe3Client.connectWallet();
    
    const address = await safe3Client.getAddress();
    console.log(`✅ Connected: ${address}`);

    // Get ethers signer
    const signer = safe3Client.getSigner();
    
    // Deploy Greeter contract
    console.log('📝 Deploying Greeter contract...');
    
    const greeterABI = [
      'constructor(string memory _greeting)',
      'function greet() view returns (string memory)',
      'function setGreeting(string memory _greeting)',
      'function version() pure returns (string memory)'
    ];
    
    const greeterBytecode = '0x608060405234801561001057600080fd5b5060405161014d38038061014d833981810160405281019061003291906100a2565b806000908051906020019061004892919061004f565b5050610147565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061009057805160ff19168380011785556100be565b828001600101855582156100be579182015b828111156100be5782518255916020019190600101906100a3565b506100ca9291506100cf565b5090565b5b808211156100ca57600081556001016100d0565b6000819050919050565b6100f5816100e2565b82525050565b600060208201905061011060008301846100ec565b92915050565b600080fd5b6000819050919050565b61012e8161011b565b811461013957600080fd5b50565b60008151905061014b81610125565b92915050565b60006020828403121561016757610166610116565b5b60006101758482850161013c565b91505092915050565b6101878161011b565b82525050565b60006020820190506101a2600083018461017e565b9291505056fea2646970667358221220...'; // Truncated for brevity
    
    const contract = await safe3Client.deployContractFromABI(
      greeterABI,
      greeterBytecode,
      'Hello Safe3Devs with Ethers!'
    );
    
    const contractAddress = await contract.getAddress();
    console.log(`✅ Contract deployed: ${contractAddress}`);
    
    // Test the contract
    const greeting = await contract.greet();
    console.log(`💬 Greeting: ${greeting}`);
    
    // Update greeting
    const tx = await contract.setGreeting('Updated greeting!');
    await tx.wait();
    
    const newGreeting = await contract.greet();
    console.log(`💬 New greeting: ${newGreeting}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await safe3Client.cleanup();
  }
}

deployWithEthers();
