import { Safe3QRDeploy } from '../sdk/safedeploy/core';

describe('Safe3QRDeploy Core', () => {
  let safe3Deploy: Safe3QRDeploy;

  beforeEach(() => {
    safe3Deploy = new Safe3QRDeploy({
      projectId: 'test-project-id',
      metadata: {
        name: 'Test App',
        description: 'Test Description',
        url: 'https://test.com',
        icons: ['https://test.com/icon.png']
      }
    });
  });

  afterEach(async () => {
    await safe3Deploy.cleanup();
  });

  describe('Initialization', () => {
    it('should create instance with correct options', () => {
      expect(safe3Deploy).toBeInstanceOf(Safe3QRDeploy);
    });

    it('should not be connected initially', () => {
      expect(safe3Deploy.isConnected()).toBe(false);
    });

    it('should return null session initially', () => {
      expect(safe3Deploy.getSession()).toBeNull();
    });
  });

  describe('Connection Management', () => {
    it('should throw error when getting address without connection', async () => {
      await expect(safe3Deploy.getAddress()).rejects.toThrow('Wallet not connected');
    });

    it('should throw error when sending transaction without connection', async () => {
      await expect(safe3Deploy.sendTransaction({})).rejects.toThrow('Wallet not connected');
    });

    it('should throw error when signing message without connection', async () => {
      await expect(safe3Deploy.signMessage('test')).rejects.toThrow('Wallet not connected');
    });
  });

  describe('Event Handling', () => {
    it('should handle initialization', async () => {
      // Test that the instance is created successfully
      expect(safe3Deploy).toBeDefined();
      expect(safe3Deploy.isConnected()).toBe(false);
    });
  });
});
