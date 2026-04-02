// SettingsScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWallet } from '../../store/WalletContext';
import { truncateAddress } from '../../utils/wallet';

export function SettingsScreen() {
  const { state, switchNetwork, disconnectWallet } = useWallet();
  const [testnetVisible, setTestnetVisible] = React.useState(false);

  const networks = testnetVisible
    ? ['ethereum', 'polygon', 'bsc', 'sepolia']
    : ['ethereum', 'polygon', 'bsc'];

  function confirmDisconnect() {
    Alert.alert(
      'Disconnect Wallet',
      'This will delete your wallet from this device. Make sure you have your recovery phrase backed up.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Disconnect', style: 'destructive', onPress: disconnectWallet },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Wallet</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Address</Text>
          <Text style={styles.infoValue}>
            {state.address ? truncateAddress(state.address) : '—'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Network</Text>
        {networks.map(netId => (
          <TouchableOpacity
            key={netId}
            style={[styles.networkItem, state.network.id === netId && styles.networkItemActive]}
            onPress={() => switchNetwork(netId)}>
            <Text style={[styles.networkName, state.network.id === netId && styles.networkNameActive]}>
              {netId.charAt(0).toUpperCase() + netId.slice(1)}
            </Text>
            {state.network.id === netId && <Text style={styles.check}>✓</Text>}
          </TouchableOpacity>
        ))}
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Show Testnets</Text>
          <Switch
            value={testnetVisible}
            onValueChange={setTestnetVisible}
            trackColor={{ false: '#2a2f3e', true: '#627EEA' }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.dangerButton} onPress={confirmDisconnect}>
          <Text style={styles.dangerText}>Disconnect Wallet</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d0f14' },
  title: { color: '#fff', fontSize: 20, fontWeight: '700', padding: 20 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionLabel: { color: '#5a6080', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 },
  infoCard: { backgroundColor: '#161a24', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#2a2f3e', flexDirection: 'row', justifyContent: 'space-between' },
  infoLabel: { color: '#5a6080' },
  infoValue: { color: '#fff', fontFamily: 'monospace' },
  networkItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#161a24', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#2a2f3e', marginBottom: 8 },
  networkItemActive: { borderColor: '#627EEA', backgroundColor: '#1a2040' },
  networkName: { color: '#fff', fontSize: 15 },
  networkNameActive: { color: '#627EEA', fontWeight: '700' },
  check: { color: '#627EEA', fontWeight: '700' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, marginTop: 4 },
  toggleLabel: { color: '#8a8fa8', fontSize: 14 },
  dangerButton: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: '#FF6B6B' },
  dangerText: { color: '#FF6B6B', fontWeight: '700', fontSize: 15 },
});
