// TransactionStatusScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useWallet } from '../../store/WalletContext';
import { pollTransactionStatus } from '../../utils/wallet';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Route = RouteProp<RootStackParamList, 'TransactionStatus'>;

export function TransactionStatusScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { state } = useWallet();
  const { txHash } = route.params;

  const [status, setStatus] = useState<'pending' | 'confirmed' | 'failed'>('pending');

  useEffect(() => {
    pollTransactionStatus(txHash, state.network).then(setStatus);
  }, [txHash, state.network]);

  const statusConfig = {
    pending: { icon: '⏳', label: 'Transaction Pending', color: '#FFB020' },
    confirmed: { icon: '✅', label: 'Transaction Confirmed', color: '#00C48C' },
    failed: { icon: '❌', label: 'Transaction Failed', color: '#FF6B6B' },
  };

  const cfg = statusConfig[status];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {status === 'pending'
          ? <ActivityIndicator size="large" color="#627EEA" style={styles.spinner} />
          : <Text style={styles.icon}>{cfg.icon}</Text>
        }
        <Text style={[styles.statusLabel, { color: cfg.color }]}>{cfg.label}</Text>
        <Text style={styles.hash}>{txHash.slice(0, 20)}…{txHash.slice(-8)}</Text>

        <TouchableOpacity
          style={styles.explorerButton}
          onPress={() => Linking.openURL(`${state.network.explorerUrl}/tx/${txHash}`)}>
          <Text style={styles.explorerText}>View on Explorer</Text>
        </TouchableOpacity>

        {status !== 'pending' && (
          <TouchableOpacity style={styles.doneButton} onPress={() => navigation.navigate('Main' as never)}>
            <Text style={styles.doneText}>Back to Wallet</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d0f14' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  spinner: { marginBottom: 24 },
  icon: { fontSize: 64, marginBottom: 16 },
  statusLabel: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  hash: { color: '#5a6080', fontSize: 13, fontFamily: 'monospace', textAlign: 'center', marginBottom: 32 },
  explorerButton: { borderWidth: 1, borderColor: '#627EEA', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28, marginBottom: 12 },
  explorerText: { color: '#627EEA', fontWeight: '600' },
  doneButton: { backgroundColor: '#627EEA', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28 },
  doneText: { color: '#fff', fontWeight: '700' },
});
