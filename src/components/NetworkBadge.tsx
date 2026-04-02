import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { Network } from '../constants/networks';

interface NetworkBadgeProps {
  network: Network;
  onPress?: () => void;
}

export function NetworkBadge({ network, onPress }: NetworkBadgeProps) {
  const badge = (
    <View style={styles.badge}>
      <View style={[styles.dot, { backgroundColor: network.color }]} />
      <Text style={styles.name}>{network.name}</Text>
      {network.isTestnet && <Text style={styles.testnet}>TESTNET</Text>}
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress}>{badge}</TouchableOpacity>;
  }
  return badge;
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#161a24', borderRadius: 20,
    paddingVertical: 6, paddingHorizontal: 12,
    borderWidth: 1, borderColor: '#2a2f3e',
  },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
  name: { color: '#8a8fa8', fontSize: 12, fontWeight: '600' },
  testnet: {
    color: '#FFB020', fontSize: 9, fontWeight: '700',
    letterSpacing: 0.5, backgroundColor: '#2a1f00',
    paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4,
  },
});
