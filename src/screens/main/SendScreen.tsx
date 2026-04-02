import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useWallet } from '../../store/WalletContext';
import {
  sendNativeToken, sendERC20, estimateGas,
  isValidAddress, checksumAddress,
} from '../../utils/wallet';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'Send'>;

export function SendScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { state } = useWallet();

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [gasEstimate, setGasEstimate] = useState<string | null>(null);
  const [recipientError, setRecipientError] = useState<string | null>(null);

  const tokenAddress = route.params?.tokenAddress;
  const isERC20 = !!tokenAddress;
  const token = isERC20
    ? state.tokens.find(t => t.address === tokenAddress)
    : null;
  const symbol = token?.symbol ?? state.network.symbol;

  function validateRecipient(addr: string) {
    if (!addr) { setRecipientError(null); return; }
    if (!isValidAddress(addr)) {
      setRecipientError('Invalid Ethereum address');
    } else {
      setRecipientError(null);
      estimateGasFee(addr);
    }
  }

  async function estimateGasFee(to: string) {
    if (!amount || !to) return;
    try {
      const est = await estimateGas({ to, amount, network: state.network });
      setGasEstimate(`~${parseFloat(est.estimatedFeeEth).toFixed(8)} ETH`);
    } catch { /* ignore */ }
  }

  async function handleSend() {
    if (!isValidAddress(recipient)) {
      Alert.alert('Invalid address', 'Please enter a valid Ethereum address.');
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid amount.');
      return;
    }

    setIsSending(true);
    try {
      const to = checksumAddress(recipient);
      const txHash = isERC20 && tokenAddress
        ? await sendERC20(tokenAddress, { to, amount, network: state.network })
        : await sendNativeToken({ to, amount, network: state.network });

      navigation.replace('TransactionStatus', { txHash });
    } catch (e: any) {
      Alert.alert('Transaction failed', e?.message ?? 'Unknown error');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.back}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Send {symbol}</Text>
            <View style={{ width: 60 }} />
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Recipient Address</Text>
            <TextInput
              style={[styles.input, recipientError ? styles.inputError : null]}
              placeholder="0x..."
              placeholderTextColor="#3a3f52"
              value={recipient}
              onChangeText={v => { setRecipient(v); validateRecipient(v); }}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {recipientError && (
              <Text style={styles.errorText}>{recipientError}</Text>
            )}

            <Text style={[styles.label, { marginTop: 20 }]}>Amount</Text>
            <View style={styles.amountRow}>
              <TextInput
                style={[styles.input, styles.amountInput]}
                placeholder="0.00"
                placeholderTextColor="#3a3f52"
                value={amount}
                onChangeText={v => { setAmount(v); if (recipient && isValidAddress(recipient)) estimateGasFee(recipient); }}
                keyboardType="decimal-pad"
              />
              <View style={styles.symbolBadge}>
                <Text style={styles.symbolText}>{symbol}</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setAmount(state.nativeBalance)}
              style={styles.maxButton}>
              <Text style={styles.maxText}>
                MAX: {parseFloat(state.nativeBalance).toFixed(4)} {symbol}
              </Text>
            </TouchableOpacity>

            {gasEstimate && (
              <View style={styles.gasRow}>
                <Text style={styles.gasLabel}>Estimated gas fee</Text>
                <Text style={styles.gasValue}>{gasEstimate}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.sendButton, isSending && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={isSending}>
            <Text style={styles.sendButtonText}>
              {isSending ? 'Sending…' : `Send ${symbol}`}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d0f14' },
  flex: { flex: 1 },
  content: { padding: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  back: { color: '#627EEA', fontSize: 15 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  card: {
    backgroundColor: '#161a24',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2a2f3e',
    marginBottom: 24,
  },
  label: { color: '#5a6080', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  input: {
    backgroundColor: '#0d0f14',
    borderWidth: 1,
    borderColor: '#2a2f3e',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  inputError: { borderColor: '#FF6B6B' },
  errorText: { color: '#FF6B6B', fontSize: 12, marginTop: 4 },
  amountRow: { flexDirection: 'row', gap: 8 },
  amountInput: { flex: 1 },
  symbolBadge: {
    backgroundColor: '#1e2235',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2a2f3e',
  },
  symbolText: { color: '#627EEA', fontWeight: '700' },
  maxButton: { alignSelf: 'flex-end', marginTop: 6 },
  maxText: { color: '#627EEA', fontSize: 12 },
  gasRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2f3e',
  },
  gasLabel: { color: '#5a6080', fontSize: 13 },
  gasValue: { color: '#fff', fontSize: 13 },
  sendButton: {
    backgroundColor: '#627EEA',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  sendButtonDisabled: { opacity: 0.5 },
  sendButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
