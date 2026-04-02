import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';

// Screens
import { GenerateWalletScreen } from '../screens/onboarding/GenerateWalletScreen';
import { ImportWalletScreen } from '../screens/onboarding/ImportWalletScreen';
import { OnboardingHomeScreen } from '../screens/onboarding/OnboardingHomeScreen';
import { HomeScreen } from '../screens/main/HomeScreen';
import { SendScreen } from '../screens/main/SendScreen';
import { ReceiveScreen } from '../screens/main/ReceiveScreen';
import { ActivityScreen } from '../screens/main/ActivityScreen';
import { SettingsScreen } from '../screens/main/SettingsScreen';
import { TokenDetailScreen } from '../screens/main/TokenDetailScreen';
import { WalletConnectScreen } from '../screens/main/WalletConnectScreen';
import { TransactionStatusScreen } from '../screens/main/TransactionStatusScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  Send: { tokenAddress?: string };
  Receive: undefined;
  TokenDetail: { tokenAddress: string };
  TransactionStatus: { txHash: string };
  WalletConnect: undefined;
};

export type OnboardingStackParamList = {
  OnboardingHome: undefined;
  GenerateWallet: undefined;
  ImportWallet: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Activity: undefined;
  Settings: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

function OnboardingNavigator() {
  return (
    <OnboardingStack.Navigator screenOptions={{ headerShown: false }}>
      <OnboardingStack.Screen name="OnboardingHome" component={OnboardingHomeScreen} />
      <OnboardingStack.Screen name="GenerateWallet" component={GenerateWalletScreen} />
      <OnboardingStack.Screen name="ImportWallet" component={ImportWalletScreen} />
    </OnboardingStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0d0f14',
          borderTopColor: '#1e2235',
          paddingBottom: 6,
        },
        tabBarActiveTintColor: '#627EEA',
        tabBarInactiveTintColor: '#5a6080',
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            Home: 'home',
            Activity: 'activity',
            Settings: 'settings',
          };
          return <Icon name={icons[route.name]} size={size} color={color} />;
        },
      })}>
      <MainTab.Screen name="Home" component={HomeScreen} />
      <MainTab.Screen name="Activity" component={ActivityScreen} />
      <MainTab.Screen name="Settings" component={SettingsScreen} />
    </MainTab.Navigator>
  );
}

export function RootNavigator({ initialRoute }: { initialRoute: 'Main' | 'Onboarding' }) {
  return (
    <RootStack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Onboarding" component={OnboardingNavigator} />
      <RootStack.Screen name="Main" component={MainNavigator} />
      <RootStack.Screen name="Send" component={SendScreen} />
      <RootStack.Screen name="Receive" component={ReceiveScreen} />
      <RootStack.Screen name="TokenDetail" component={TokenDetailScreen} />
      <RootStack.Screen name="TransactionStatus" component={TransactionStatusScreen} />
      <RootStack.Screen name="WalletConnect" component={WalletConnectScreen} />
    </RootStack.Navigator>
  );
}
