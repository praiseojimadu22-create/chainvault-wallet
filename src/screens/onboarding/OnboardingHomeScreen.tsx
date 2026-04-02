import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<OnboardingStackParamList>;
const { height } = Dimensions.get('window');

export function OnboardingHomeScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.top}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🔐</Text>
        </View>
        <Text style={styles.appName}>ChainVault</Text>
        <Text style={styles.tagline}>
          Your keys. Your coins.{'\n'}Multi-chain, self-custodial.
        </Text>
      </View>

      <View style={styles.features}>
        {[
          { icon: '🔑', label: 'Self-custody wallet — you own your keys' },
          { icon: '⛓', label: 'Ethereum, Polygon, BSC & more' },
          { icon: '🔗', label: 'WalletConnect v2 dApp support' },
          { icon: '👁', label: 'Biometric lock for every session' },
        ].map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <Text style={styles.featureText}>{f.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('GenerateWallet')}>
          <Text style={styles.primaryText}>Create New Wallet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('ImportWallet')}>
          <Text style={styles.secondaryText}>Import with Recovery Phrase</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          ChainVault stores keys encrypted on your device only.
          We never have access to your funds.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d0f14' },
  top: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: height * 0.06 },
  logoCircle: {
    width: 100, height: 100, borderRadius: 30,
    backgroundColor: '#161a24', borderWidth: 1, borderColor: '#2a2f3e',
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  logoEmoji: { fontSize: 44 },
  appName: {
    color: '#fff', fontSize: 36, fontWeight: '800',
    letterSpacing: -1, marginBottom: 12,
  },
  tagline: {
    color: '#5a6080', fontSize: 16, textAlign: 'center',
    lineHeight: 24,
  },
  features: { paddingHorizontal: 32, gap: 14, marginBottom: 32 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIcon: { fontSize: 20, width: 28 },
  featureText: { color: '#8a8fa8', fontSize: 14, flex: 1 },
  actions: { paddingHorizontal: 24, paddingBottom: 16, gap: 12 },
  primaryButton: {
    backgroundColor: '#627EEA', borderRadius: 16,
    paddingVertical: 18, alignItems: 'center',
  },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryButton: {
    borderWidth: 1, borderColor: '#2a2f3e', borderRadius: 16,
    paddingVertical: 18, alignItems: 'center',
  },
  secondaryText: { color: '#8a8fa8', fontSize: 15 },
  disclaimer: {
    color: '#3a3f52', fontSize: 12, textAlign: 'center',
    lineHeight: 18, paddingHorizontal: 8,
  },
});
