import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { walletFromMnemonic, persistWallet } from '../../utils/wallet';

type WordEntry = { index: number; value: string };

export function ImportWalletScreen() {
  const navigation = useNavigation();
  const [words, setWords] = useState<string[]>(Array(12).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState('');

  function updateWord(index: number, value: string) {
    const updated = [...words];
    // Handle paste of full phrase into first field
    if (index === 0 && value.trim().split(/\s+/).length >= 12) {
      const pasted = value.trim().split(/\s+/).slice(0, 12);
      setWords([...pasted, ...Array(12 - pasted.length).fill('')]);
      return;
    }
    updated[index] = value.toLowerCase().trim();
    setWords(updated);
  }

  function applyPaste() {
    const pasted = pasteText.trim().split(/\s+/).slice(0, 12);
    if (pasted.length !== 12) {
      Alert.alert('Invalid phrase', 'A recovery phrase must be exactly 12 words.');
      return;
    }
    setWords([...pasted, ...Array(12 - pasted.length).fill('')]);
    setPasteMode(false);
  }

  async function handleImport() {
    const phrase = words.map(w => w.trim()).join(' ');
    if (words.some(w => !w)) {
      Alert.alert('Incomplete', 'Please enter all 12 words of your recovery phrase.');
      return;
    }
    setIsLoading(true);
    try {
      const { address } = await walletFromMnemonic(phrase);
      await persistWallet(phrase, address);
      navigation.getParent()?.navigate('Main' as never);
    } catch (e: any) {
      Alert.alert('Import Failed', 'Invalid recovery phrase. Please check each word and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.back}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Import Wallet</Text>
            <TouchableOpacity onPress={() => setPasteMode(p => !p)}>
              <Text style={styles.pasteToggle}>{pasteMode ? 'Grid' : 'Paste'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Enter your 12-word recovery phrase in the correct order.
          </Text>

          {pasteMode ? (
            <View style={styles.pasteContainer}>
              <TextInput
                style={styles.pasteInput}
                placeholder="Paste your full recovery phrase here…"
                placeholderTextColor="#3a3f52"
                value={pasteText}
                onChangeText={setPasteText}
                multiline
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
              />
              <TouchableOpacity style={styles.applyButton} onPress={applyPaste}>
                <Text style={styles.applyText}>Apply</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.grid}>
              {words.map((word, i) => (
                <View key={i} style={styles.wordEntry}>
                  <Text style={styles.wordIndex}>{i + 1}</Text>
                  <TextInput
                    style={styles.wordInput}
                    value={word}
                    onChangeText={v => updateWord(i, v)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType={i < 11 ? 'next' : 'done'}
                    secureTextEntry
                  />
                </View>
              ))}
            </View>
          )}

          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              🔒 Your phrase is processed locally and never leaves your device.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.importButton, isLoading && styles.importButtonDisabled]}
            onPress={handleImport}
            disabled={isLoading}>
            <Text style={styles.importText}>
              {isLoading ? 'Importing…' : 'Import Wallet'}
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
  content: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 20,
  },
  back: { color: '#627EEA', fontSize: 15 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  pasteToggle: { color: '#627EEA', fontSize: 15 },
  subtitle: { color: '#5a6080', fontSize: 14, lineHeight: 20, marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  wordEntry: {
    flexDirection: 'row', alignItems: 'center',
    width: '47%', backgroundColor: '#161a24',
    borderRadius: 10, borderWidth: 1, borderColor: '#2a2f3e',
    paddingHorizontal: 10, paddingVertical: 8, gap: 8,
  },
  wordIndex: { color: '#3a4060', fontSize: 11, width: 16 },
  wordInput: { flex: 1, color: '#fff', fontSize: 14, padding: 0 },
  pasteContainer: { marginBottom: 24, gap: 10 },
  pasteInput: {
    backgroundColor: '#161a24', borderWidth: 1, borderColor: '#2a2f3e',
    borderRadius: 14, padding: 16, color: '#fff', fontSize: 14,
    minHeight: 100, textAlignVertical: 'top',
  },
  applyButton: {
    backgroundColor: '#1e2235', borderRadius: 12,
    paddingVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#2a2f3e',
  },
  applyText: { color: '#627EEA', fontWeight: '600' },
  warningBox: {
    backgroundColor: '#0d1a2a', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#1a3050', marginBottom: 24,
  },
  warningText: { color: '#6090b0', fontSize: 13, lineHeight: 20 },
  importButton: {
    backgroundColor: '#627EEA', borderRadius: 16,
    paddingVertical: 18, alignItems: 'center',
  },
  importButtonDisabled: { opacity: 0.5 },
  importText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
