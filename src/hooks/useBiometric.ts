import { useState, useCallback } from 'react';
import ReactNativeBiometrics from 'react-native-biometrics';
import { MMKV } from 'react-native-mmkv';
import { STORAGE_KEYS } from '../constants/networks';

const storage = new MMKV();
const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });

export function useBiometric() {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [biometryType, setBiometryType] = useState<string | null>(null);

  const checkSupport = useCallback(async () => {
    const { available, biometryType: type } = await rnBiometrics.isSensorAvailable();
    setIsSupported(available);
    setBiometryType(type ?? null);
    return available;
  }, []);

  const authenticate = useCallback(async (reason = 'Authenticate to continue'): Promise<boolean> => {
    const { success } = await rnBiometrics.simplePrompt({
      promptMessage: reason,
      cancelButtonText: 'Cancel',
      fallbackPromptMessage: 'Use device PIN',
    });
    return success;
  }, []);

  const isBiometricEnabled = useCallback((): boolean => {
    return storage.getBoolean(STORAGE_KEYS.BIOMETRIC_ENABLED) ?? true;
  }, []);

  const setBiometricEnabled = useCallback((enabled: boolean) => {
    storage.set(STORAGE_KEYS.BIOMETRIC_ENABLED, enabled);
  }, []);

  return { isSupported, biometryType, checkSupport, authenticate, isBiometricEnabled, setBiometricEnabled };
}
