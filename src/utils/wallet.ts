import { ethers } from 'ethers';
import EncryptedStorage from 'react-native-encrypted-storage';
import { STORAGE_KEYS, type Network } from '../constants/networks';

// ─── Wallet Generation ────────────────────────────────────────────────────────

export async function generateNewWallet(): Promise<{
  mnemonic: string;
  address: string;
  privateKey: string;
}> {
  const wallet = ethers.Wallet.createRandom();
  if (!wallet.mnemonic) throw new Error('Failed to generate mnemonic');
  return {
    mnemonic: wallet.mnemonic.phrase,
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
}

export async function walletFromMnemonic(mnemonic: string): Promise<{
  address: string;
  privateKey: string;
}> {
  if (!ethers.Mnemonic.isValidMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic phrase');
  }
  const wallet = ethers.HDNodeWallet.fromMnemonic(
    ethers.Mnemonic.fromPhrase(mnemonic),
    "m/44'/60'/0'/0/0",
  );
  return { address: wallet.address, privateKey: wallet.privateKey };
}

// ─── Encrypted Storage ───────────────────────────────────────────────────────

export async function persistWallet(
  mnemonic: string,
  address: string,
): Promise<void> {
  await EncryptedStorage.setItem(STORAGE_KEYS.ENCRYPTED_MNEMONIC, mnemonic);
  await EncryptedStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, address);
}

export async function loadPersistedWallet(): Promise<string | null> {
  try {
    return await EncryptedStorage.getItem(STORAGE_KEYS.WALLET_ADDRESS);
  } catch {
    return null;
  }
}

export async function getMnemonic(): Promise<string> {
  const mnemonic = await EncryptedStorage.getItem(
    STORAGE_KEYS.ENCRYPTED_MNEMONIC,
  );
  if (!mnemonic) throw new Error('No wallet found in secure storage');
  return mnemonic;
}

export async function clearWallet(): Promise<void> {
  await EncryptedStorage.removeItem(STORAGE_KEYS.ENCRYPTED_MNEMONIC);
  await EncryptedStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS);
}

// ─── Provider & Signer ──────────────────────────────────────────────────────

export function getProvider(network: Network): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(network.rpcUrl, network.chainId);
}

export async function getSigner(
  network: Network,
): Promise<ethers.HDNodeWallet> {
  const mnemonic = await getMnemonic();
  const provider = getProvider(network);
  const wallet = ethers.HDNodeWallet.fromMnemonic(
    ethers.Mnemonic.fromPhrase(mnemonic),
    "m/44'/60'/0'/0/0",
  ).connect(provider);
  return wallet;
}

// ─── Balance ─────────────────────────────────────────────────────────────────

export async function getNativeBalance(
  address: string,
  network: Network,
): Promise<string> {
  const provider = getProvider(network);
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
}

export async function getERC20Balance(
  tokenAddress: string,
  walletAddress: string,
  network: Network,
): Promise<{ balance: string; decimals: number; symbol: string }> {
  const provider = getProvider(network);
  const abi = [
    'function balanceOf(address) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
  ];
  const contract = new ethers.Contract(tokenAddress, abi, provider);
  const [raw, decimals, symbol] = await Promise.all([
    contract.balanceOf(walletAddress),
    contract.decimals(),
    contract.symbol(),
  ]);
  return {
    balance: ethers.formatUnits(raw, decimals),
    decimals: Number(decimals),
    symbol,
  };
}

// ─── Transactions ────────────────────────────────────────────────────────────

export interface TxParams {
  to: string;
  amount: string; // in ether / token units
  network: Network;
}

export async function estimateGas(params: TxParams): Promise<{
  gasLimit: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  estimatedFeeEth: string;
}> {
  const provider = getProvider(params.network);
  const feeData = await provider.getFeeData();
  const gasLimit = 21000n;
  const maxFeePerGas = feeData.maxFeePerGas ?? 20000000000n;
  const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas ?? 1500000000n;
  const estimatedFeeWei = gasLimit * maxFeePerGas;
  return {
    gasLimit,
    maxFeePerGas,
    maxPriorityFeePerGas,
    estimatedFeeEth: ethers.formatEther(estimatedFeeWei),
  };
}

export async function sendNativeToken(params: TxParams): Promise<string> {
  const signer = await getSigner(params.network);
  const gasEstimate = await estimateGas(params);

  const tx = await signer.sendTransaction({
    to: params.to,
    value: ethers.parseEther(params.amount),
    gasLimit: gasEstimate.gasLimit,
    maxFeePerGas: gasEstimate.maxFeePerGas,
    maxPriorityFeePerGas: gasEstimate.maxPriorityFeePerGas,
  });

  return tx.hash;
}

export async function sendERC20(
  tokenAddress: string,
  params: TxParams,
): Promise<string> {
  const signer = await getSigner(params.network);
  const abi = [
    'function transfer(address to, uint256 amount) returns (bool)',
    'function decimals() view returns (uint8)',
  ];
  const contract = new ethers.Contract(tokenAddress, abi, signer);
  const decimals = await contract.decimals();
  const amount = ethers.parseUnits(params.amount, Number(decimals));
  const tx = await contract.transfer(params.to, amount);
  return tx.hash;
}

// ─── Address Utilities ───────────────────────────────────────────────────────

export function isValidAddress(address: string): boolean {
  return ethers.isAddress(address);
}

export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function checksumAddress(address: string): string {
  return ethers.getAddress(address);
}

// ─── Transaction Status Polling ──────────────────────────────────────────────

export async function pollTransactionStatus(
  txHash: string,
  network: Network,
  maxAttempts = 20,
): Promise<'confirmed' | 'failed' | 'pending'> {
  const provider = getProvider(network);
  for (let i = 0; i < maxAttempts; i++) {
    const receipt = await provider.getTransactionReceipt(txHash);
    if (receipt) {
      return receipt.status === 1 ? 'confirmed' : 'failed';
    }
    await new Promise(r => setTimeout(r, 3000));
  }
  return 'pending';
}
