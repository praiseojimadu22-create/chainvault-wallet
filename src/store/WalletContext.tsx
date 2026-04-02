import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from 'react';
import { DEFAULT_NETWORK, NETWORKS, type Network, type Token } from '../constants/networks';
import {
  getNativeBalance,
  getERC20Balance,
  loadPersistedWallet,
  persistWallet,
  clearWallet,
} from '../utils/wallet';

// ─── State ────────────────────────────────────────────────────────────────────

interface WalletState {
  address: string | null;
  network: Network;
  nativeBalance: string;
  tokens: Token[];
  tokenBalances: Record<string, string>;
  isLoading: boolean;
  lastRefresh: number | null;
  error: string | null;
}

const initialState: WalletState = {
  address: null,
  network: DEFAULT_NETWORK,
  nativeBalance: '0',
  tokens: [],
  tokenBalances: {},
  isLoading: false,
  lastRefresh: null,
  error: null,
};

// ─── Actions ─────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_ADDRESS'; payload: string }
  | { type: 'SET_NETWORK'; payload: Network }
  | { type: 'SET_NATIVE_BALANCE'; payload: string }
  | { type: 'SET_TOKEN_BALANCE'; payload: { address: string; balance: string } }
  | { type: 'ADD_TOKEN'; payload: Token }
  | { type: 'REMOVE_TOKEN'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'REFRESH_DONE' }
  | { type: 'RESET' };

function reducer(state: WalletState, action: Action): WalletState {
  switch (action.type) {
    case 'SET_ADDRESS':
      return { ...state, address: action.payload };
    case 'SET_NETWORK':
      return { ...state, network: action.payload, nativeBalance: '0', tokenBalances: {} };
    case 'SET_NATIVE_BALANCE':
      return { ...state, nativeBalance: action.payload };
    case 'SET_TOKEN_BALANCE':
      return {
        ...state,
        tokenBalances: { ...state.tokenBalances, [action.payload.address]: action.payload.balance },
      };
    case 'ADD_TOKEN':
      return { ...state, tokens: [...state.tokens, action.payload] };
    case 'REMOVE_TOKEN':
      return { ...state, tokens: state.tokens.filter(t => t.address !== action.payload) };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'REFRESH_DONE':
      return { ...state, lastRefresh: Date.now(), isLoading: false };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface WalletContextValue {
  state: WalletState;
  initWallet: (address: string) => Promise<void>;
  switchNetwork: (networkId: string) => void;
  refreshBalances: () => Promise<void>;
  addToken: (token: Token) => void;
  removeToken: (tokenAddress: string) => void;
  disconnectWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const initWallet = useCallback(async (address: string) => {
    dispatch({ type: 'SET_ADDRESS', payload: address });
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const balance = await getNativeBalance(address, state.network);
      dispatch({ type: 'SET_NATIVE_BALANCE', payload: balance });
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load balance' });
    } finally {
      dispatch({ type: 'REFRESH_DONE' });
    }
  }, [state.network]);

  const switchNetwork = useCallback((networkId: string) => {
    const network = NETWORKS[networkId];
    if (network) dispatch({ type: 'SET_NETWORK', payload: network });
  }, []);

  const refreshBalances = useCallback(async () => {
    if (!state.address) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const balance = await getNativeBalance(state.address, state.network);
      dispatch({ type: 'SET_NATIVE_BALANCE', payload: balance });

      for (const token of state.tokens) {
        const { balance: tokenBal } = await getERC20Balance(
          token.address,
          state.address,
          state.network,
        );
        dispatch({ type: 'SET_TOKEN_BALANCE', payload: { address: token.address, balance: tokenBal } });
      }
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: 'Refresh failed' });
    } finally {
      dispatch({ type: 'REFRESH_DONE' });
    }
  }, [state.address, state.network, state.tokens]);

  const addToken = useCallback((token: Token) => {
    dispatch({ type: 'ADD_TOKEN', payload: token });
  }, []);

  const removeToken = useCallback((tokenAddress: string) => {
    dispatch({ type: 'REMOVE_TOKEN', payload: tokenAddress });
  }, []);

  const disconnectWallet = useCallback(async () => {
    await clearWallet();
    dispatch({ type: 'RESET' });
  }, []);

  return (
    <WalletContext.Provider
      value={{ state, initWallet, switchNetwork, refreshBalances, addToken, removeToken, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
