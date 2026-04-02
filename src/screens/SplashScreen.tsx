import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

export function SplashScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1, duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1, friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.inner, { opacity, transform: [{ scale }] }]}>
        <View style={styles.iconBox}>
          <Text style={styles.icon}>🔐</Text>
        </View>
        <Text style={styles.name}>ChainVault</Text>
        <Text style={styles.sub}>Decentralized. Secure. Yours.</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#0d0f14',
    alignItems: 'center', justifyContent: 'center',
  },
  inner: { alignItems: 'center' },
  iconBox: {
    width: 100, height: 100, borderRadius: 28,
    backgroundColor: '#161a24', borderWidth: 1, borderColor: '#2a2f3e',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  icon: { fontSize: 46 },
  name: { color: '#fff', fontSize: 32, fontWeight: '800', letterSpacing: -0.5, marginBottom: 8 },
  sub: { color: '#3a4060', fontSize: 14, letterSpacing: 0.5 },
});
