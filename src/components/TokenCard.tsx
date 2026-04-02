import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface TokenCardProps {
  symbol: string;
  name: string;
  balance: string;
  color: string;
  usdValue?: string;
  onPress: () => void;
}

export function TokenCard({ symbol, name, balance, color, usdValue, onPress }: TokenCardProps) {
  const initial = symbol.charAt(0).toUpperCase();
  const formattedBalance = isNaN(Number(balance))
    ? balance
    : parseFloat(balance).toFixed(6).replace(/\.?0+$/, '') || '0';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.avatar, { backgroundColor: color + '22', borderColor: color + '44' }]}>
        <Text style={[styles.avatarText, { color }]}>{initial}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.symbol}>{symbol}</Text>
        <Text style={styles.name}>{name}</Text>
      </View>
      <View style={styles.balanceArea}>
        <Text style={styles.balance}>{formattedBalance}</Text>
        {usdValue && <Text style={styles.usd}>{usdValue}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#161a24', borderRadius: 14,
    padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#2a2f3e',
  },
  avatar: {
    width: 42, height: 42, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: '700' },
  info: { flex: 1 },
  symbol: { color: '#fff', fontSize: 15, fontWeight: '700' },
  name: { color: '#5a6080', fontSize: 12, marginTop: 2 },
  balanceArea: { alignItems: 'flex-end' },
  balance: { color: '#fff', fontSize: 14, fontWeight: '600' },
  usd: { color: '#5a6080', fontSize: 12, marginTop: 2 },
});
