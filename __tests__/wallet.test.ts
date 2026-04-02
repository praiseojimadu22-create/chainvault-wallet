import { ethers } from 'ethers';
import {
  generateNewWallet,
  walletFromMnemonic,
  isValidAddress,
  truncateAddress,
  checksumAddress,
} from '../src/utils/wallet';

// Mock encrypted storage
jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn().mockResolvedValue(undefined),
  getItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

describe('Wallet Generation', () => {
  test('generates a valid wallet with mnemonic, address, privateKey', async () => {
    const wallet = await generateNewWallet();
    expect(wallet.mnemonic).toBeDefined();
    expect(wallet.mnemonic.split(' ')).toHaveLength(12);
    expect(ethers.isAddress(wallet.address)).toBe(true);
    expect(wallet.privateKey).toMatch(/^0x[0-9a-fA-F]{64}$/);
  });

  test('generates unique wallets each call', async () => {
    const w1 = await generateNewWallet();
    const w2 = await generateNewWallet();
    expect(w1.mnemonic).not.toBe(w2.mnemonic);
    expect(w1.address).not.toBe(w2.address);
  });
});

describe('Wallet Import', () => {
  test('restores correct address from known mnemonic', async () => {
    const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    const { address } = await walletFromMnemonic(mnemonic);
    expect(ethers.isAddress(address)).toBe(true);
    // Known derivation for this mnemonic at m/44'/60'/0'/0/0
    expect(address.toLowerCase()).toBe('0x9858effd232b4033e47d90003d41ec34ecaeda94');
  });

  test('throws on invalid mnemonic', async () => {
    await expect(walletFromMnemonic('not valid words at all here')).rejects.toThrow();
  });
});

describe('Address Utilities', () => {
  const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
  const invalidAddress = '0xnotanaddress';

  test('validates correct address', () => {
    expect(isValidAddress(validAddress)).toBe(true);
  });

  test('rejects invalid address', () => {
    expect(isValidAddress(invalidAddress)).toBe(false);
  });

  test('truncates address correctly', () => {
    const truncated = truncateAddress(validAddress);
    expect(truncated).toBe('0x742d...f44e');
  });

  test('returns checksum address', () => {
    const lower = validAddress.toLowerCase();
    const checksum = checksumAddress(lower);
    expect(checksum).toBe(validAddress);
  });
});
