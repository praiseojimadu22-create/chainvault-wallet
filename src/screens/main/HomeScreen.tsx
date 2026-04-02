import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useWallet } from '../../store/WalletContext';
import { truncateAddress } from '../../utils/wallet';
import { NetworkBadge } from '../../components/NetworkBadge';
import { TokenCard } from '../../components/TokenCard';
import { ActionButton } from '../../components/ActionButton';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { state, refreshBalances } = useWallet();

  useEffect(() => {
    refreshBalances();
  }, []);

  const onRefresh = useCallback(() => {
    refreshBalances();
  }, [refreshBalances]);

  const formattedBalance = parseFloat(state.nativeBalance).toFixed(6);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0d0f14" />
      <ScrollView
        style={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={state.isLoading}
            onRefresh={onRefresh}
            tintColor="#627EEA"
          />
        }>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>ChainVault</Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.address}>
                {state.address ? truncateAddress(state.address) : '—'}
              </Text>
            </TouchableOpacity>
          </View>
          <NetworkBadge network={state.network} />
        </View>

        {/* Balance card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceValue}>
            {formattedBalance}{' '}
            <Text style={styles.balanceSymbol}>{state.network.symbol}</Text>
          </Text>
          {state.error && (
            <Text style={styles.errorText}>{state.error}</Text>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <ActionButton
            icon="arrow-up-right"
            label="Send"
            onPress={() => navigation.navigate('Send', {})}
            color="#627EEA"
          />
          <ActionButton
            icon="arrow-down-left"
            label="Receive"
            onPress={() => navigation.navigate('Receive')}
            color="#00C48C"
          />
          <ActionButton
            icon="link"
            label="WalletConnect"
            onPress={() => navigation.navigate('WalletConnect')}
            color="#FF6B35"
          />
        </View>

        {/* Token list */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assets</Text>

          {/* Native token */}
          <TokenCard
            symbol={state.network.symbol}
            name={state.network.name}
            balance={formattedBalance}
            color={state.network.color}
            onPress={() => {}}
          />

          {/* ERC-20 tokens */}
          {state.tokens.map(token => (
            <TokenCard
              key={token.address}
              symbol={token.symbol}
              name={token.name}
              balance={state.tokenBalances[token.address] ?? '—'}
              color="#627EEA"
              onPress={() =>
                navigation.navigate('TokenDetail', { tokenAddress: token.address })
              }
            />
          ))}

          <TouchableOpacity style={styles.addToken}>
            <Text style={styles.addTokenText}>+ Add Token</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d0f14' },
  scroll: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: { color: '#fff', fontSize: 20, fontWeight: '700' },
  address: { color: '#627EEA', fontSize: 13, marginTop: 2 },
  balanceCard: {
    margin: 20,
    backgroundColor: '#161a24',
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: '#2a2f3e',
    alignItems: 'center',
  },
  balanceLabel: { color: '#5a6080', fontSize: 13, marginBottom: 8 },
  balanceValue: { color: '#fff', fontSize: 36, fontWeight: '700' },
  balanceSymbol: { color: '#627EEA', fontSize: 20 },
  errorText: { color: '#FF6B6B', fontSize: 12, marginTop: 8 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  section: { paddingHorizontal: 20 },
  sectionTitle: {
    color: '#5a6080',
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  addToken: {
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2f3e',
    borderRadius: 14,
    borderStyle: 'dashed',
    marginTop: 8,
    marginBottom: 32,
  },
  addTokenText: { color: '#5a6080', fontSize: 14 },
});
