// ActivityScreen.tsx
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface TxRecord {
  hash: string;
  type: 'send' | 'receive';
  amount: string;
  symbol: string;
  timestamp: number;
  status: 'confirmed' | 'pending' | 'failed';
}

const STATUS_COLOR = {
  confirmed: '#00C48C',
  pending: '#FFB020',
  failed: '#FF6B6B',
};

export function ActivityScreen() {
  // In production: load from MMKV storage keyed by address+network
  const transactions: TxRecord[] = [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>Activity</Text>
      <FlatList
        data={transactions}
        keyExtractor={item => item.hash}
        contentContainerStyle={transactions.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.txCard}>
            <View style={styles.txLeft}>
              <Text style={styles.txType}>{item.type === 'send' ? '↑ Sent' : '↓ Received'}</Text>
              <Text style={styles.txHash}>{item.hash.slice(0, 16)}…</Text>
            </View>
            <View style={styles.txRight}>
              <Text style={[styles.txAmount, item.type === 'receive' ? styles.txAmountIn : {}]}>
                {item.type === 'send' ? '-' : '+'}{item.amount} {item.symbol}
              </Text>
              <Text style={[styles.txStatus, { color: STATUS_COLOR[item.status] }]}>
                {item.status}
              </Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d0f14' },
  title: { color: '#fff', fontSize: 20, fontWeight: '700', padding: 20 },
  emptyContainer: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: '#5a6080', fontSize: 15 },
  txCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: 20, marginBottom: 10,
    backgroundColor: '#161a24', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#2a2f3e',
  },
  txLeft: {},
  txRight: { alignItems: 'flex-end' },
  txType: { color: '#fff', fontWeight: '600', marginBottom: 4 },
  txHash: { color: '#5a6080', fontSize: 12, fontFamily: 'monospace' },
  txAmount: { color: '#FF6B6B', fontWeight: '700', marginBottom: 4 },
  txAmountIn: { color: '#00C48C' },
  txStatus: { fontSize: 12 },
});
