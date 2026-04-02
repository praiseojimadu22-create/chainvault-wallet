import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useWallet } from '../../store/WalletContext';
import { getSigner } from '../../utils/wallet';

interface PendingRequest {
  id: number;
  method: string;
  params: unknown[];
  dAppName: string;
  dAppIcon?: string;
}

export function WalletConnectScreen() {
  const navigation = useNavigation();
  const { state } = useWallet();

  const [uri, setUri] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedDApp, setConnectedDApp] = useState<string | null>(null);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);

  const handleConnect = useCallback(async () => {
    if (!uri.startsWith('wc:')) {
      Alert.alert('Invalid URI', 'Please paste a valid WalletConnect URI (starts with wc:)');
      return;
    }
    setIsConnecting(true);
    try {
      // In production: initialize @walletconnect/web3wallet with project ID
      // and call web3wallet.pair({ uri })
      // For brevity, simulating connection:
      await new Promise(r => setTimeout(r, 1500));
      setConnectedDApp('Connected dApp');
      setUri('');
    } catch (e: any) {
      Alert.alert('Connection failed', e?.message ?? 'Could not connect to dApp');
    } finally {
      setIsConnecting(false);
    }
  }, [uri]);

  async function approveRequest(request: PendingRequest) {
    try {
      const signer = await getSigner(state.network);
      if (request.method === 'eth_sendTransaction') {
        const txParams = request.params[0] as any;
        const tx = await signer.sendTransaction(txParams);
        Alert.alert('Transaction sent', `Hash: ${tx.hash.slice(0, 20)}…`);
      } else if (request.method === 'personal_sign' || request.method === 'eth_sign') {
        const message = request.params[0] as string;
        const sig = await signer.signMessage(message);
        Alert.alert('Message signed', `Signature: ${sig.slice(0, 20)}…`);
      }
      setPendingRequests(prev => prev.filter(r => r.id !== request.id));
    } catch (e: any) {
      Alert.alert('Error', e?.message);
    }
  }

  function rejectRequest(id: number) {
    setPendingRequests(prev => prev.filter(r => r.id !== id));
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>WalletConnect</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Connection Input */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Connect to a dApp</Text>
        <TextInput
          style={styles.input}
          placeholder="Paste WalletConnect URI (wc:...)"
          placeholderTextColor="#3a3f52"
          value={uri}
          onChangeText={setUri}
          autoCapitalize="none"
          autoCorrect={false}
          multiline
        />
        <TouchableOpacity
          style={[styles.button, isConnecting && styles.buttonDisabled]}
          onPress={handleConnect}
          disabled={isConnecting}>
          {isConnecting
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Connect</Text>}
        </TouchableOpacity>
      </View>

      {/* Connected dApp */}
      {connectedDApp && (
        <View style={styles.connectedCard}>
          <View style={styles.connectedDot} />
          <Text style={styles.connectedText}>Connected: {connectedDApp}</Text>
        </View>
      )}

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Pending Requests</Text>
          <FlatList
            data={pendingRequests}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => (
              <View style={styles.requestCard}>
                <Text style={styles.requestDApp}>{item.dAppName}</Text>
                <Text style={styles.requestMethod}>{item.method}</Text>
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => rejectRequest(item.id)}>
                    <Text style={styles.rejectText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.approveButton}
                    onPress={() => approveRequest(item)}>
                    <Text style={styles.approveText}>Approve</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </View>
      )}

      {!connectedDApp && pendingRequests.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔗</Text>
          <Text style={styles.emptyText}>
            Scan a QR code or paste a WalletConnect URI from any Web3 app to connect.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d0f14' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 20,
  },
  back: { color: '#627EEA', fontSize: 15 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionLabel: {
    color: '#5a6080', fontSize: 11, letterSpacing: 1.5,
    textTransform: 'uppercase', marginBottom: 12,
  },
  input: {
    backgroundColor: '#161a24', borderWidth: 1, borderColor: '#2a2f3e',
    borderRadius: 14, padding: 16, color: '#fff', fontSize: 13,
    marginBottom: 12, minHeight: 60,
  },
  button: {
    backgroundColor: '#627EEA', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  connectedCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 20, marginBottom: 20,
    backgroundColor: '#0d2010', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#1a4020',
  },
  connectedDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00C48C' },
  connectedText: { color: '#00C48C', fontSize: 14 },
  requestCard: {
    backgroundColor: '#161a24', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#2a2f3e', marginBottom: 10,
  },
  requestDApp: { color: '#fff', fontWeight: '700', marginBottom: 4 },
  requestMethod: { color: '#5a6080', fontSize: 13, marginBottom: 14 },
  requestActions: { flexDirection: 'row', gap: 10 },
  rejectButton: {
    flex: 1, borderRadius: 10, paddingVertical: 12,
    alignItems: 'center', borderWidth: 1, borderColor: '#FF6B6B',
  },
  rejectText: { color: '#FF6B6B', fontWeight: '600' },
  approveButton: {
    flex: 1, borderRadius: 10, paddingVertical: 12,
    alignItems: 'center', backgroundColor: '#627EEA',
  },
  approveText: { color: '#fff', fontWeight: '600' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: '#5a6080', fontSize: 15, textAlign: 'center', lineHeight: 22 },
});
