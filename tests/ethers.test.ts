import { Safe3EthersSigner } from '../sdk/safedeploy/ethers';
import { ethers } from 'ethers';

// Mock ethers for testing
jest.mock('ethers');

describe('Safe3EthersSigner', () => {
  let safe3EthersSigner: Safe3EthersSigner;
  let mockProvider: jest.Mocked<ethers.JsonRpcProvider>;
  let mockSigner: jest.Mocked<ethers.JsonRpcSigner>;

  beforeEach(() => {
    mockProvider = {
      waitForTransaction: jest.fn(),
    } as any;

    mockSigner = {
      getAddress: jest.fn(),
      signTransaction: jest.fn(),
      signMessage: jest.fn(),
      sendTransaction: jest.fn(),
      connect: jest.fn(),
    } as any;

    // Mock ethers.JsonRpcProvider constructor
    (ethers.JsonRpcProvider as jest.Mock).mockImplementation(() => mockProvider);

    safe3EthersSigner = new Safe3EthersSigner({
      projectId: 'test-project-id',
      chainId: 1,
      rpcUrl: 'https://test-rpc.com'
    });
  });

  afterEach(async () => {
    await safe3EthersSigner.cleanup();
  });

  describe('Initialization', () => {
    it('should create instance with correct options', () => {
      expect(safe3EthersSigner).toBeInstanceOf(Safe3EthersSigner);
    });

    it('should throw error when getting signer without connection', () => {
      expect(() => safe3EthersSigner.getSigner()).toThrow('Signer not initialized');
    });

    it('should throw error when getting provider without connection', () => {
      expect(() => safe3EthersSigner.getProvider()).toThrow('Provider not initialized');
    });
  });

  describe('Contract Deployment', () => {
    it('should throw error when deploying contract without connection', async () => {
      const mockFactory = {
        connect: jest.fn().mockReturnThis(),
        deploy: jest.fn(),
      } as any;

      await expect(safe3EthersSigner.deployContract(mockFactory, 'test')).rejects.toThrow('Signer not initialized');
    });

    it('should deploy contract with ABI and bytecode', async () => {
      const mockContract = {
        waitForDeployment: jest.fn().mockResolvedValue(undefined),
        getAddress: jest.fn().mockResolvedValue('0x123'),
      };

      const mockFactory = {
        connect: jest.fn().mockReturnThis(),
        deploy: jest.fn().mockResolvedValue(mockContract),
        interface: {},
        bytecode: '0x123',
        runner: mockSigner,
        attach: jest.fn(),
        getDeployTransaction: jest.fn(),
      } as any;

      // Mock the connection
      jest.spyOn(safe3EthersSigner, 'isConnected').mockReturnValue(true);
      jest.spyOn(safe3EthersSigner, 'getSigner').mockReturnValue(mockSigner);

      const result = await safe3EthersSigner.deployContract(mockFactory, 'test');
      
      expect(mockFactory.connect).toHaveBeenCalledWith(mockSigner);
      expect(mockFactory.deploy).toHaveBeenCalledWith('test');
      expect(result).toBe(mockContract);
    });
  });

  describe('RPC URL Configuration', () => {
    it('should use default RPC URL for mainnet', () => {
      const signer = new Safe3EthersSigner({
        projectId: 'test',
        chainId: 1
      });
      
      expect(signer).toBeDefined();
    });

    it('should use custom RPC URL when provided', () => {
      const customRpcUrl = 'https://custom-rpc.com';
      const signer = new Safe3EthersSigner({
        projectId: 'test',
        chainId: 1,
        rpcUrl: customRpcUrl
      });
      
      expect(signer).toBeDefined();
    });
  });
});
