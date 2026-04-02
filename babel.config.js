module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@components': './src/components',
          '@screens': './src/screens',
          '@hooks': './src/hooks',
          '@utils': './src/utils',
          '@store': './src/store',
          '@constants': './src/constants',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
