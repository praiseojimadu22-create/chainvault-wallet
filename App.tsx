import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { WalletProvider } from './src/store/WalletContext';
import { NetworkProvider } from './src/store/NetworkContext';
import { BiometricGate } from './src/components/BiometricGate';
import { SplashScreen } from './src/screens/SplashScreen';
import { loadPersistedWallet } from './src/utils/wallet';

export default function App(): React.JSX.Element {
  const [isReady, setIsReady] = useState(false);
  const [hasWallet, setHasWallet] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      const wallet = await loadPersistedWallet();
      setHasWallet(!!wallet);
      setIsReady(true);
    }
    bootstrap();
  }, []);

  if (!isReady) {
    return <SplashScreen />;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <NetworkProvider>
          <WalletProvider>
            <NavigationContainer>
              {hasWallet ? (
                <BiometricGate>
                  <RootNavigator initialRoute="Main" />
                </BiometricGate>
              ) : (
                <RootNavigator initialRoute="Onboarding" />
              )}
            </NavigationContainer>
          </WalletProvider>
        </NetworkProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
