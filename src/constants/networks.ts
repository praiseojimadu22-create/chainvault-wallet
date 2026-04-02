export const NETWORKS: Record<string, Network> = {
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum',
    chainId: 1,
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
    explorerUrl: 'https://etherscan.io',
    symbol: 'ETH',
    decimals: 18,
    color: '#627EEA',
    isTestnet: false,
  },
  polygon: {
    id: 'polygon',
    name: 'Polygon',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    symbol: 'MATIC',
    decimals: 18,
    color: '#8247E5',
    isTestnet: false,
  },
  bsc: {
    id: 'bsc',
    name: 'BNB Smart Chain',
    chainId: 56,
    rpcUrl: 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    symbol: 'BNB',
    decimals: 18,
    color: '#F0B90B',
    isTestnet: false,
  },
  sepolia: {
    id: 'sepolia',
    name: 'Sepolia Testnet',
    chainId: 11155111,
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    explorerUrl: 'https://sepolia.etherscan.io',
    symbol: 'ETH',
    decimals: 18,
    color: '#627EEA',
    isTestnet: true,
  },
};

export const DEFAULT_NETWORK = NETWORKS.ethereum;

export const GAS_LIMIT_DEFAULTS = {
  ETH_TRANSFER: 21000n,
  ERC20_TRANSFER: 65000n,
  CONTRACT_INTERACTION: 200000n,
};

export const STORAGE_KEYS = {
  ENCRYPTED_MNEMONIC: 'cv_enc_mnemonic',
  WALLET_ADDRESS: 'cv_wallet_address',
  SELECTED_NETWORK: 'cv_network',
  TOKEN_LIST: 'cv_token_list',
  BIOMETRIC_ENABLED: 'cv_biometric',
  TRANSACTION_HISTORY: 'cv_tx_history',
};

export interface Network {
  id: string;
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  symbol: string;
  decimals: number;
  color: string;
  isTestnet: boolean;
}

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  network: string;
  logoUri?: string;
}
