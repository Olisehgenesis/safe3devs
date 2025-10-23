// Test setup file
import 'dotenv/config';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set test environment variables
process.env.WALLETCONNECT_PROJECT_ID = 'test-project-id';
process.env.NODE_ENV = 'test';

// Mock WalletConnect modules
jest.mock('@walletconnect/sign-client', () => ({
  SignClient: {
    init: jest.fn().mockResolvedValue({
      connect: jest.fn().mockResolvedValue({
        uri: 'test-uri',
        approval: jest.fn().mockResolvedValue({
          topic: 'test-topic',
          namespaces: {
            eip155: {
              accounts: ['eip155:1:0x1234567890123456789012345678901234567890']
            }
          }
        })
      }),
      request: jest.fn().mockResolvedValue('0xtest'),
      disconnect: jest.fn().mockResolvedValue(undefined),
      on: jest.fn()
    })
  }
}));

jest.mock('@walletconnect/types', () => ({}));

jest.mock('qrcode-terminal', () => ({
  generate: jest.fn()
}));

// Mock ethers
jest.mock('ethers', () => ({
  ethers: {
    JsonRpcProvider: jest.fn().mockImplementation(() => ({
      waitForTransaction: jest.fn().mockResolvedValue({
        hash: '0xtest',
        blockNumber: 123,
        status: 1
      }),
      getTransactionCount: jest.fn().mockResolvedValue(0),
      estimateGas: jest.fn().mockResolvedValue(21000n),
      call: jest.fn().mockResolvedValue('0x'),
      resolveName: jest.fn().mockResolvedValue(null),
      getBalance: jest.fn().mockResolvedValue(0n)
    })),
    ContractFactory: jest.fn().mockImplementation(() => ({
      connect: jest.fn().mockReturnThis(),
      deploy: jest.fn().mockResolvedValue({
        waitForDeployment: jest.fn().mockResolvedValue(undefined),
        getAddress: jest.fn().mockResolvedValue('0xcontract123'),
        deploymentTransaction: jest.fn().mockReturnValue({ hash: '0xtest' })
      })
    })),
    Signer: class MockSigner {}, // Add mock Signer class
    toBeHex: jest.fn((value) => `0x${value.toString(16)}`),
    toUtf8String: jest.fn((bytes) => bytes.toString())
  },
  // Add direct exports for compatibility
  JsonRpcProvider: jest.fn().mockImplementation(() => ({
    waitForTransaction: jest.fn().mockResolvedValue({
      hash: '0xtest',
      blockNumber: 123,
      status: 1
    }),
    getTransactionCount: jest.fn().mockResolvedValue(0),
    estimateGas: jest.fn().mockResolvedValue(21000n),
    call: jest.fn().mockResolvedValue('0x'),
    resolveName: jest.fn().mockResolvedValue(null),
    getBalance: jest.fn().mockResolvedValue(0n)
  })),
  ContractFactory: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockReturnThis(),
    deploy: jest.fn().mockResolvedValue({
      waitForDeployment: jest.fn().mockResolvedValue(undefined),
      getAddress: jest.fn().mockResolvedValue('0xcontract123'),
      deploymentTransaction: jest.fn().mockReturnValue({ hash: '0xtest' })
    })
  })),
  Signer: class MockSigner {},
  toBeHex: jest.fn((value) => `0x${value.toString(16)}`),
  toUtf8String: jest.fn((bytes) => bytes.toString())
}));

// Mock viem
jest.mock('viem', () => ({
  createWalletClient: jest.fn().mockReturnValue({
    deployContract: jest.fn().mockResolvedValue('0xtest'),
    sendTransaction: jest.fn().mockResolvedValue('0xtest'),
    signMessage: jest.fn().mockResolvedValue('0xtest')
  }),
  createPublicClient: jest.fn().mockReturnValue({
    waitForTransactionReceipt: jest.fn().mockResolvedValue({
      contractAddress: '0xcontract123'
    })
  }),
  http: jest.fn(),
  custom: jest.fn(),
  parseEther: jest.fn(),
  formatEther: jest.fn(),
  toHex: jest.fn(),
  getContract: jest.fn().mockReturnValue({
    read: {
      greet: jest.fn().mockResolvedValue('Hello World')
    },
    write: {
      setGreeting: jest.fn().mockResolvedValue('0xtest')
    }
  }),
  mainnet: { id: 1 },
  polygon: { id: 137 },
  bsc: { id: 56 },
  arbitrum: { id: 42161 },
  optimism: { id: 10 },
  base: { id: 8453 }
}));

// Mock Hardhat
jest.mock('hardhat/config', () => ({
  extendEnvironment: jest.fn(),
  task: jest.fn()
}));

jest.mock('hardhat/types', () => ({
  HardhatRuntimeEnvironment: {}
}));
