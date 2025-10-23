import { createSafe3Client, isEthersClient, isViemClient, getClientType } from '../sdk/safedeploy/js';
import { Safe3EthersSigner } from '../sdk/safedeploy/ethers';
import { Safe3ViemClient } from '../sdk/safedeploy/viem';

describe('Safe3Devs JavaScript Wrapper', () => {
  describe('createSafe3Client', () => {
    it('should create ethers client when specified', () => {
      const client = createSafe3Client({
        client: 'ethers',
        projectId: 'test-project-id'
      });

      expect(client).toBeInstanceOf(Safe3EthersSigner);
    });

    it('should create viem client when specified', () => {
      const client = createSafe3Client({
        client: 'viem',
        projectId: 'test-project-id'
      });

      expect(client).toBeInstanceOf(Safe3ViemClient);
    });

    it('should throw error for unsupported client type', () => {
      expect(() => {
        createSafe3Client({
          client: 'unsupported' as any,
          projectId: 'test-project-id'
        });
      }).toThrow('Unsupported client type: unsupported');
    });
  });

  describe('Client Type Detection', () => {
    it('should detect ethers client correctly', () => {
      const ethersClient = createSafe3Client({
        client: 'ethers',
        projectId: 'test'
      });

      expect(isEthersClient(ethersClient)).toBe(true);
      expect(isViemClient(ethersClient)).toBe(false);
      expect(getClientType(ethersClient)).toBe('ethers');
    });

    it('should detect viem client correctly', () => {
      const viemClient = createSafe3Client({
        client: 'viem',
        projectId: 'test'
      });

      expect(isEthersClient(viemClient)).toBe(false);
      expect(isViemClient(viemClient)).toBe(true);
      expect(getClientType(viemClient)).toBe('viem');
    });
  });

  describe('Auto-detection', () => {
    it('should prefer ethers when both are available', () => {
      // Mock require to simulate both libraries being available
      const originalRequire = require;
      jest.doMock('ethers', () => ({}));
      jest.doMock('viem', () => ({}));

      const { createSafe3ClientAuto } = require('../sdk/safedeploy/js');
      
      const client = createSafe3ClientAuto({
        projectId: 'test'
      });

      expect(client).toBeInstanceOf(Safe3EthersSigner);

      // Restore original require
      jest.dontMock('ethers');
      jest.dontMock('viem');
    });

    it('should fallback to viem when ethers is not available', () => {
      // Mock require to simulate only viem being available
      jest.doMock('ethers', () => {
        throw new Error('Module not found');
      });
      jest.doMock('viem', () => ({}));

      const { createSafe3ClientAuto } = require('../sdk/safedeploy/js');
      
      const client = createSafe3ClientAuto({
        projectId: 'test'
      });

      expect(client).toBeInstanceOf(Safe3ViemClient);

      // Restore original require
      jest.dontMock('ethers');
      jest.dontMock('viem');
    });

    it('should throw error when neither library is available', () => {
      // Mock require to simulate neither library being available
      jest.doMock('ethers', () => {
        throw new Error('Module not found');
      });
      jest.doMock('viem', () => {
        throw new Error('Module not found');
      });

      const { createSafe3ClientAuto } = require('../sdk/safedeploy/js');
      
      expect(() => {
        createSafe3ClientAuto({
          projectId: 'test'
        });
      }).toThrow('Neither ethers nor viem is available');

      // Restore original require
      jest.dontMock('ethers');
      jest.dontMock('viem');
    });
  });
});
