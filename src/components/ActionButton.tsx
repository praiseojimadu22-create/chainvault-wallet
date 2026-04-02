import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

interface ActionButtonProps {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
  disabled?: boolean;
}

export function ActionButton({ icon, label, color, onPress, disabled }: ActionButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}>
      <View style={[styles.iconCircle, { backgroundColor: color + '22', borderColor: color + '44' }]}>
        <Icon name={icon} size={20} color={color} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 8 },
  disabled: { opacity: 0.4 },
  iconCircle: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  label: { color: '#8a8fa8', fontSize: 12 },
});
