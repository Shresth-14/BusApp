import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { appTheme } from '../../theme';

type StopsSearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  onNearMePress?: () => void;
};

export function StopsSearchBar({
  value,
  onChangeText,
  placeholder = 'Search stops...',
  onNearMePress,
}: StopsSearchBarProps) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="magnify" size={20} color={appTheme.colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={appTheme.colors.textMuted}
        style={styles.input}
      />
      <Pressable onPress={onNearMePress} style={({ pressed }) => [styles.nearMeBtn, pressed && styles.pressed]}>
        <MaterialCommunityIcons name="crosshairs-gps" size={18} color="#0F8B8D" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 54,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFE6EE',
    paddingHorizontal: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#10213A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#12223A',
    fontWeight: '500',
  },
  nearMeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF8F8',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
});
