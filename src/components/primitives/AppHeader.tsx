import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { appTheme } from '../../theme';
import { useDeviceClass } from '../../utils/device';

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  onLeadingPress?: () => void;
  onTrailingPress?: () => void;
};

export function AppHeader({
  title,
  subtitle,
  leadingIcon,
  trailingIcon,
  onLeadingPress,
  onTrailingPress,
}: AppHeaderProps) {
  const { isCompact } = useDeviceClass();

  return (
    <View style={[styles.wrapper, isCompact && styles.wrapperCompact]}>
      <View style={styles.row}>
        {leadingIcon ? (
          <Pressable
            onPress={onLeadingPress}
            disabled={!onLeadingPress}
            style={({ pressed }) => [
              styles.iconButton,
              isCompact && styles.iconButtonCompact,
              !onLeadingPress && styles.iconButtonDisabled,
              pressed && styles.iconButtonPressed,
            ]}
          >
            {leadingIcon}
          </Pressable>
        ) : (
          <View style={styles.placeholder} />
        )}

        <View style={styles.titleBlock}>
          {subtitle ? (
            <Text style={[styles.subtitle, isCompact && styles.subtitleCompact]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
          <Text style={[styles.title, isCompact && styles.titleCompact]} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {trailingIcon ? (
          <Pressable
            onPress={onTrailingPress}
            disabled={!onTrailingPress}
            style={({ pressed }) => [
              styles.iconButton,
              isCompact && styles.iconButtonCompact,
              !onTrailingPress && styles.iconButtonDisabled,
              pressed && styles.iconButtonPressed,
            ]}
          >
            {trailingIcon}
          </Pressable>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'transparent',
    paddingHorizontal: appTheme.spacing.lg,
    paddingTop: appTheme.spacing.md,
    paddingBottom: appTheme.spacing.lg,
  },
  wrapperCompact: {
    paddingHorizontal: appTheme.spacing.md,
    paddingBottom: appTheme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  placeholder: {
    width: 36,
    height: 36,
  },
  titleBlock: {
    flex: 1,
    paddingHorizontal: appTheme.spacing.sm,
  },
  subtitle: {
    color: appTheme.colors.textMuted,
    ...appTheme.typography.caption,
    marginBottom: 2,
  },
  subtitleCompact: {
    fontSize: 11,
  },
  title: {
    color: appTheme.colors.primaryNavy,
    ...appTheme.typography.subtitle,
  },
  titleCompact: {
    fontSize: 15,
    lineHeight: 19,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: appTheme.colors.borderSubtle,
    backgroundColor: 'rgba(247, 251, 250, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonCompact: {
    width: 34,
    height: 34,
    borderRadius: 11,
  },
  iconButtonDisabled: {
    opacity: 0.6,
  },
  iconButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
