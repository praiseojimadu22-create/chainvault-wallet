import React, { useState, useEffect, type ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });

interface BiometricGateProps {
  children: ReactNode;
}

export function BiometricGate({ children }: BiometricGateProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [biometricType, setBiometricType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkBiometrics();
  }, []);

  async function checkBiometrics() {
    setChecking(true);
    setError(null);
    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      if (!available) {
        // No biometrics — skip gate
        setUnlocked(true);
        return;
      }
      setBiometricType(biometryType ?? 'Biometrics');
      await promptBiometric();
    } catch {
      setError('Biometric check failed. Try again.');
    } finally {
      setChecking(false);
    }
  }

  async function promptBiometric() {
    const { success } = await rnBiometrics.simplePrompt({
      promptMessage: 'Authenticate to access ChainVault',
      cancelButtonText: 'Cancel',
      fallbackPromptMessage: 'Use device PIN',
    });
    if (success) {
      setUnlocked(true);
    } else {
      setError('Authentication cancelled.');
    }
  }

  if (unlocked) return <>{children}</>;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.logo}>🔐</Text>
        <Text style={styles.title}>ChainVault</Text>
        <Text style={styles.subtitle}>
          {checking
            ? 'Checking authentication…'
            : error
            ? error
            : `Unlock with ${biometricType}`}
        </Text>
        {checking ? (
          <ActivityIndicator color="#627EEA" size="large" style={styles.spinner} />
        ) : (
          <TouchableOpacity style={styles.button} onPress={promptBiometric}>
            <Text style={styles.buttonText}>Authenticate</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0f14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#161a24',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    width: '80%',
    borderWidth: 1,
    borderColor: '#2a2f3e',
  },
  logo: { fontSize: 48, marginBottom: 16 },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#8a8fa8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 20,
  },
  spinner: { marginTop: 8 },
  button: {
    backgroundColor: '#627EEA',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
