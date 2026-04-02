// TokenDetailScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useWallet } from '../../store/WalletContext';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Route = RouteProp<RootStackParamList, 'TokenDetail'>;

export function TokenDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { state } = useWallet();
  const token = state.tokens.find(t => t.address === route.params.tokenAddress);
  const balance = state.tokenBalances[route.params.tokenAddress] ?? '0';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{token?.symbol ?? 'Token'}</Text>
        <View style={{ width: 60 }} />
      </View>
      <View style={styles.content}>
        <Text style={styles.balance}>{balance}</Text>
        <Text style={styles.symbol}>{token?.symbol}</Text>
        <Text style={styles.name}>{token?.name}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d0f14' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  back: { color: '#627EEA', fontSize: 15 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  balance: { color: '#fff', fontSize: 48, fontWeight: '700' },
  symbol: { color: '#627EEA', fontSize: 20, marginTop: 4 },
  name: { color: '#5a6080', fontSize: 14, marginTop: 8 },
});
