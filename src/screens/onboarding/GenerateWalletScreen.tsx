import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { generateNewWallet, persistWallet } from '../../utils/wallet';
import type { OnboardingStackParamList } from '../../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<OnboardingStackParamList>;

type Step = 'generate' | 'backup' | 'verify';

export function GenerateWalletScreen() {
  const navigation = useNavigation<Nav>();
  const [step, setStep] = useState<Step>('generate');
  const [mnemonic, setMnemonic] = useState('');
  const [address, setAddress] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [verifyWords, setVerifyWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    generate();
  }, []);

  async function generate() {
    setIsLoading(true);
    try {
      const result = await generateNewWallet();
      setMnemonic(result.mnemonic);
      setAddress(result.address);
    } catch {
      Alert.alert('Error', 'Failed to generate wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function proceedToBackup() {
    const words = mnemonic.split(' ');
    // Pick 4 random words for verification
    const shuffled = [...words].sort(() => Math.random() - 0.5).slice(0, 4);
    setVerifyWords(shuffled);
    setStep('backup');
  }

  function proceedToVerify() {
    setStep('verify');
  }

  function selectWord(word: string) {
    if (selectedWords.includes(word)) {
      setSelectedWords(prev => prev.filter(w => w !== word));
    } else {
      setSelectedWords(prev => [...prev, word]);
    }
  }

  async function finalize() {
    setIsLoading(true);
    try {
      await persistWallet(mnemonic, address);
      // Navigate to main (parent navigator will re-render)
      navigation.getParent()?.navigate('Main');
    } catch {
      Alert.alert('Error', 'Failed to save wallet securely.');
    } finally {
      setIsLoading(false);
    }
  }

  const words = mnemonic.split(' ');

  if (step === 'generate') {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>New Wallet</Text>
          <Text style={styles.subtitle}>
            A 12-word recovery phrase has been generated for your wallet. Store it safely — anyone with this phrase can access your funds.
          </Text>

          <Pressable style={styles.phraseBox} onPress={() => setRevealed(r => !r)}>
            {revealed ? (
              <View style={styles.wordsGrid}>
                {words.map((word, i) => (
                  <View key={i} style={styles.wordChip}>
                    <Text style={styles.wordIndex}>{i + 1}</Text>
                    <Text style={styles.wordText}>{word}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.blurOverlay}>
                <Text style={styles.blurIcon}>👁</Text>
                <Text style={styles.blurText}>Tap to reveal phrase</Text>
                <Text style={styles.blurWarning}>Make sure no one is watching</Text>
              </View>
            )}
          </Pressable>

          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              ⚠️ Never share your recovery phrase. ChainVault will never ask for it.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, !revealed && styles.buttonDisabled]}
            onPress={proceedToBackup}
            disabled={!revealed}>
            <Text style={styles.buttonText}>I've backed it up →</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Verify Backup</Text>
        <Text style={styles.subtitle}>
          Select the words that appear in your recovery phrase, in any order.
        </Text>

        <View style={styles.selectedArea}>
          {selectedWords.map((w, i) => (
            <TouchableOpacity key={i} style={styles.selectedChip} onPress={() => selectWord(w)}>
              <Text style={styles.selectedChipText}>{w} ✕</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.wordsGrid}>
          {verifyWords.map((word, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.wordChip, selectedWords.includes(word) && styles.wordChipSelected]}
              onPress={() => selectWord(word)}>
              <Text style={[styles.wordText, selectedWords.includes(word) && styles.wordTextSelected]}>
                {word}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={finalize}
          disabled={isLoading}>
          <Text style={styles.buttonText}>{isLoading ? 'Creating…' : 'Create Wallet'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d0f14' },
  content: { padding: 24, paddingBottom: 40 },
  title: { color: '#fff', fontSize: 26, fontWeight: '700', marginBottom: 12 },
  subtitle: { color: '#5a6080', fontSize: 15, lineHeight: 22, marginBottom: 28 },
  phraseBox: {
    backgroundColor: '#161a24',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a2f3e',
    marginBottom: 20,
    overflow: 'hidden',
    minHeight: 200,
    justifyContent: 'center',
  },
  wordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 8,
  },
  wordChip: {
    flexDirection: 'row',
    backgroundColor: '#1e2235',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#2a2f3e',
    width: '30%',
    gap: 6,
  },
  wordChipSelected: { borderColor: '#627EEA', backgroundColor: '#1a2040' },
  wordIndex: { color: '#3a4060', fontSize: 11 },
  wordText: { color: '#fff', fontSize: 13 },
  wordTextSelected: { color: '#627EEA' },
  blurOverlay: { padding: 40, alignItems: 'center' },
  blurIcon: { fontSize: 32, marginBottom: 12 },
  blurText: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 6 },
  blurWarning: { color: '#5a6080', fontSize: 13 },
  warningBox: {
    backgroundColor: '#2a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4a2020',
    marginBottom: 28,
  },
  warningText: { color: '#FF6B6B', fontSize: 13, lineHeight: 20 },
  button: {
    backgroundColor: '#627EEA',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  selectedArea: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    minHeight: 50,
    marginBottom: 20,
  },
  selectedChip: {
    backgroundColor: '#1a2040',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#627EEA',
  },
  selectedChipText: { color: '#627EEA', fontSize: 13 },
});
