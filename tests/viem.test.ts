import { Safe3ViemClient } from '../sdk/safedeploy/viem';
import { createWalletClient, createPublicClient, http } from 'viem';

// Mock viem for testing
jest.mock('viem');

describe('Safe3ViemClient', () => {
  let safe3ViemClient: Safe3ViemClient;
  let mockWalletClient: any;
  let mockPublicClient: any;

  beforeEach(() => {
    mockWalletClient = {
      deployContract: jest.fn(),
      sendTransaction: jest.fn(),
      signMessage: jest.fn(),
    };

    mockPublicClient = {
      waitForTransactionReceipt: jest.fn(),
    };

    // Mock viem functions
    (createWalletClient as jest.Mock).mockReturnValue(mockWalletClient);
    (createPublicClient as jest.Mock).mockReturnValue(mockPublicClient);

    safe3ViemClient = new Safe3ViemClient({
      projectId: 'test-project-id',
      chainId: 1,
      rpcUrl: 'https://test-rpc.com'
    });
  });

  afterEach(async () => {
    await safe3ViemClient.cleanup();
  });

  describe('Initialization', () => {
    it('should create instance with correct options', () => {
      expect(safe3ViemClient).toBeInstanceOf(Safe3ViemClient);
    });

    it('should throw error when getting client without connection', () => {
      expect(() => safe3ViemClient.getClient()).toThrow('Wallet client not initialized');
    });

    it('should throw error when getting public client without connection', () => {
      expect(() => safe3ViemClient.getPublicClient()).toThrow('Public client not initialized');
    });
  });

  describe('Contract Deployment', () => {
    it('should throw error when deploying contract without connection', async () => {
      const deployOptions = {
        abi: [],
        bytecode: '0x123' as const,
        args: ['test']
      };

      await expect(safe3ViemClient.deployContract(deployOptions)).rejects.toThrow('Wallet client not initialized');
    });

    it('should deploy contract successfully', async () => {
      const deployOptions = {
        abi: [],
        bytecode: '0x123' as const,
        args: ['test']
      };

      const mockHash = '0xabc123';
      const mockReceipt = {
        contractAddress: '0xcontract123'
      };

      mockWalletClient.deployContract.mockResolvedValue(mockHash);
      mockPublicClient.waitForTransactionReceipt.mockResolvedValue(mockReceipt);

      // Mock the private walletClient property
      (safe3ViemClient as any).walletClient = mockWalletClient;
      (safe3ViemClient as any).publicClient = mockPublicClient;

      // Mock getAddress
      jest.spyOn(safe3ViemClient, 'getAddress').mockResolvedValue('0x123');

      const result = await safe3ViemClient.deployContract(deployOptions);
      
      expect(mockWalletClient.deployContract).toHaveBeenCalled();
      expect(result).toBe('0xcontract123');
    });
  });

  describe('Chain Management', () => {
    it('should get current chain', () => {
      const chain = safe3ViemClient.getChain();
      expect(chain).toBeDefined();
      expect(chain.id).toBe(1); // mainnet
    });

    it('should switch chain', async () => {
      await safe3ViemClient.switchChain(137); // polygon
      
      expect(safe3ViemClient.getChain().id).toBe(137);
    });
  });
});
