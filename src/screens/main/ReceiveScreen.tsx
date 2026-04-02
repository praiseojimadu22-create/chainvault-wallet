// src/screens/main/ReceiveScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useWallet } from '../../store/WalletContext';
import { truncateAddress } from '../../utils/wallet';

export function ReceiveScreen() {
  const navigation = useNavigation();
  const { state } = useWallet();

  async function copyAddress() {
    if (!state.address) return;
    await Share.share({ message: state.address });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Receive</Text>
        <View style={{ width: 60 }} />
      </View>
      <View style={styles.content}>
        <View style={styles.qrPlaceholder}>
          <Text style={styles.qrText}>QR Code</Text>
          <Text style={styles.qrSub}>(react-native-qrcode-svg)</Text>
        </View>
        <Text style={styles.networkLabel}>
          {state.network.name} Address
        </Text>
        <Text style={styles.address}>
          {state.address ?? '—'}
        </Text>
        <TouchableOpacity style={styles.copyButton} onPress={copyAddress}>
          <Text style={styles.copyText}>Copy Address</Text>
        </TouchableOpacity>
        <Text style={styles.warning}>
          Only send {state.network.symbol} and tokens on the {state.network.name} network to this address.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d0f14' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  back: { color: '#627EEA', fontSize: 15 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 24 },
  qrPlaceholder: {
    width: 200, height: 200, backgroundColor: '#fff', borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', marginBottom: 28,
  },
  qrText: { color: '#000', fontWeight: '700' },
  qrSub: { color: '#666', fontSize: 11 },
  networkLabel: { color: '#5a6080', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  address: { color: '#fff', fontSize: 13, textAlign: 'center', fontFamily: 'monospace', marginBottom: 20 },
  copyButton: {
    backgroundColor: '#627EEA', borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 32, marginBottom: 20,
  },
  copyText: { color: '#fff', fontWeight: '700' },
  warning: { color: '#5a6080', fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
