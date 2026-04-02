# ChainVault — Mobile Crypto Wallet

A self-custodial, multi-chain mobile wallet built with **React Native** and **TypeScript**, targeting Android and iOS. Designed for security, performance, and a clean user experience in the Web3 space.

---

## Features

- **Multi-chain support** — Ethereum, Polygon, BNB Smart Chain, with testnet toggle (Sepolia)
- **BIP-39 wallet generation** — 12-word mnemonic, with guided backup and verification flow
- **Import via recovery phrase** — grid entry or paste mode, fully client-side
- **Encrypted key storage** — private keys stored with `react-native-encrypted-storage` (AES-256), never transmitted
- **Biometric authentication** — Face ID / Fingerprint / PIN gate on every app open
- **Send & receive native tokens** — gas estimation, max balance shortcut, EIP-1559 fee support
- **ERC-20 token support** — add custom tokens by contract address, view balances
- **WalletConnect v2** — URI-based dApp connectivity, transaction and message signing
- **Transaction history** — persisted locally via MMKV, per-address per-network
- **Live USD prices** — CoinGecko API, auto-refresh every 60 seconds
- **Network switching** — runtime switch with balance auto-refresh
- **Pull-to-refresh** — balances and token prices

---

## Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.73 |
| Language | TypeScript (strict) |
| Navigation | React Navigation 6 (native stack + bottom tabs) |
| Web3 | ethers.js v6 |
| WalletConnect | @walletconnect/web3wallet v1 |
| Secure Storage | react-native-encrypted-storage |
| Fast Storage | react-native-mmkv |
| Biometrics | react-native-biometrics |
| State | React Context + useReducer |
| Testing | Jest + React Native Testing Library |
| CI/CD | GitHub Actions + Fastlane |

---

## Project Structure

```
chainvault-wallet/
├── src/
│   ├── components/         # Shared UI components
│   │   ├── BiometricGate.tsx
│   │   ├── TokenCard.tsx
│   │   ├── ActionButton.tsx
│   │   └── NetworkBadge.tsx
│   ├── constants/
│   │   └── networks.ts     # Network configs, storage keys, types
│   ├── hooks/
│   │   ├── useBiometric.ts
│   │   ├── useTokenPrices.ts
│   │   └── useTransactionHistory.ts
│   ├── navigation/
│   │   └── RootNavigator.tsx
│   ├── screens/
│   │   ├── main/
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── SendScreen.tsx
│   │   │   ├── ReceiveScreen.tsx
│   │   │   ├── ActivityScreen.tsx
│   │   │   ├── SettingsScreen.tsx
│   │   │   ├── TokenDetailScreen.tsx
│   │   │   ├── TransactionStatusScreen.tsx
│   │   │   └── WalletConnectScreen.tsx
│   │   ├── onboarding/
│   │   │   ├── OnboardingHomeScreen.tsx
│   │   │   ├── GenerateWalletScreen.tsx
│   │   │   └── ImportWalletScreen.tsx
│   │   └── SplashScreen.tsx
│   ├── store/
│   │   ├── WalletContext.tsx
│   │   └── NetworkContext.tsx
│   └── utils/
│       └── wallet.ts       # Core wallet logic
├── __tests__/
│   └── wallet.test.ts
├── App.tsx
├── index.js
├── babel.config.js
├── tsconfig.json
└── jest.config.js
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- React Native CLI
- Android Studio (for Android)
- Xcode 14+ (for iOS, macOS only)

### Install

```bash
git clone https://github.com/yourusername/chainvault-wallet.git
cd chainvault-wallet
npm install

# iOS
cd ios && pod install && cd ..
npx react-native run-ios

# Android
npx react-native run-android
```

### Environment

Create a `.env` file in the project root:

```
INFURA_KEY=your_infura_project_id
WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

Update `src/constants/networks.ts` to use `process.env.INFURA_KEY` in the RPC URLs.

---

## Security Design

- **No key transmission** — mnemonics and private keys never leave the device
- **AES-256 encryption** — `react-native-encrypted-storage` leverages Android Keystore / iOS Secure Enclave
- **Biometric gate** — every cold app open requires biometric or device credential
- **No clipboard auto-copy** — sensitive phrases must be manually copied
- **Checksum enforcement** — all addresses validated and checksummed before transaction submission

---

## Testing

```bash
npm test
npm run typecheck
npm run lint
```

---

## CI/CD

GitHub Actions pipeline (`.github/workflows/`) handles:
- TypeScript type checking on every push
- Jest test suite
- Fastlane build + distribution to TestFlight (iOS) and Play Store internal track (Android) on merge to `main`

---

## License

MIT
