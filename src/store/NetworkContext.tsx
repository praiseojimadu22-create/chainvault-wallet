import React, { createContext, useContext, useState, type ReactNode } from 'react';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { useEffect } from 'react';

interface NetworkContextValue {
  isConnected: boolean;
  connectionType: string | null;
}

const NetworkContext = createContext<NetworkContextValue>({
  isConnected: true,
  connectionType: null,
});

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(state.isConnected ?? false);
      setConnectionType(state.type);
    });
    return unsubscribe;
  }, []);

  return (
    <NetworkContext.Provider value={{ isConnected, connectionType }}>
      {children}
    </NetworkContext.Provider>
  );
}

export const useNetwork = () => useContext(NetworkContext);
