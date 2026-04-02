import { useState, useCallback } from 'react';
import { MMKV } from 'react-native-mmkv';
import { STORAGE_KEYS } from '../constants/networks';

const storage = new MMKV();

export interface TxRecord {
  hash: string;
  type: 'send' | 'receive';
  amount: string;
  symbol: string;
  to: string;
  from: string;
  timestamp: number;
  status: 'confirmed' | 'pending' | 'failed';
  network: string;
}

export function useTransactionHistory(address: string, networkId: string) {
  const storageKey = `${STORAGE_KEYS.TRANSACTION_HISTORY}_${address}_${networkId}`;

  const [transactions, setTransactions] = useState<TxRecord[]>(() => {
    try {
      const raw = storage.getString(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const addTransaction = useCallback((tx: TxRecord) => {
    setTransactions(prev => {
      const updated = [tx, ...prev.filter(t => t.hash !== tx.hash)];
      storage.set(storageKey, JSON.stringify(updated));
      return updated;
    });
  }, [storageKey]);

  const updateTransactionStatus = useCallback(
    (hash: string, status: TxRecord['status']) => {
      setTransactions(prev => {
        const updated = prev.map(tx =>
          tx.hash === hash ? { ...tx, status } : tx,
        );
        storage.set(storageKey, JSON.stringify(updated));
        return updated;
      });
    },
    [storageKey],
  );

  const clearHistory = useCallback(() => {
    storage.delete(storageKey);
    setTransactions([]);
  }, [storageKey]);

  return { transactions, addTransaction, updateTransactionStatus, clearHistory };
}
