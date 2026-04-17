import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { appTheme } from '../../theme';
import { triggerTapHaptic } from '../../utils/haptics';

type AppButtonVariant = 'primary' | 'secondary';

type AppButtonProps = {
  title: string;
  variant?: AppButtonVariant;
  onPress?: () => void;
  style?: ViewStyle;
  enableHaptics?: boolean;
};

export function AppButton({
  title,
  variant = 'primary',
  onPress,
  style,
  enableHaptics = true,
}: AppButtonProps) {
  const handlePress = async () => {
    if (enableHaptics) {
      await triggerTapHaptic();
    }
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.secondary,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.text, variant === 'primary' ? styles.textPrimary : styles.textSecondary]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    minHeight: 46,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#238F8A',
    shadowColor: '#111738',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  secondary: {
    backgroundColor: '#EEF4F3',
    borderWidth: 1,
    borderColor: appTheme.colors.borderSubtle,
  },
  text: {
    ...appTheme.typography.body,
    fontWeight: '600',
    letterSpacing: 0.15,
  },
  textPrimary: {
    color: '#F7FBF9',
  },
  textSecondary: {
    color: appTheme.colors.primaryNavy,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});
